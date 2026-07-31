package com.dataacq.execution.service;

import com.dataacq.common.domain.exception.AppException;
import com.dataacq.common.domain.exception.ErrorCode;
import com.dataacq.common.events.ExecutionEvent;
import com.dataacq.common.security.SecurityUser;
import com.dataacq.execution.domain.ScraperJob;
import com.dataacq.execution.repository.ScraperJobRepository;
import com.dataacq.execution.repository.ScraperLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * WorkflowExecutionOrchestrator — the Java port of scraperEngine.ts::runScraperTask().
 *
 * Key improvements over TypeScript version:
 * - No Math.random() price simulation — replaced by real browser extraction
 * - CancellationSignal uses thread-safe AtomicBoolean instead of callback
 * - Progress updates via SSE (Server-Sent Events) instead of polling
 * - Full error recovery with configurable retry strategy
 * - Publishes Spring events at every state transition
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WorkflowExecutionOrchestrator {

    private final ScraperJobRepository jobRepository;
    private final ScraperLogRepository logRepository;
    private final Pass1ReconnaissanceExecutor pass1Executor;
    private final Pass2DeepExtractionExecutor pass2Executor;
    private final ApplicationEventPublisher eventPublisher;

    /** Thread-safe cancellation signals per job. AtomicBoolean replaces shouldStop() callback. */
    private final ConcurrentHashMap<UUID, AtomicBoolean> cancellationSignals = new ConcurrentHashMap<>();

    /** SSE emitters for live log streaming to Admin UI */
    private final ConcurrentHashMap<UUID, org.springframework.web.servlet.mvc.method.annotation.SseEmitter>
            sseEmitters = new ConcurrentHashMap<>();

    /**
     * Create and queue a new scraper job.
     * Returns immediately — actual execution is async.
     */
    @Transactional
    public ScraperJob createAndQueueJob(String portalName, String scrapeMode,
                                         Map<String, Object> options, SecurityUser actor) {
        // Check if job already running for this portal
        if (jobRepository.existsByPortalNameAndStatusIn(portalName,
                java.util.List.of("QUEUED", "RUNNING", "INITIALIZING"))) {
            throw new AppException(ErrorCode.JOB_ALREADY_RUNNING);
        }

        ScraperJob job = ScraperJob.builder()
                .portalName(portalName)
                .jobType("MANUAL")
                .status("QUEUED")
                .scrapeMode(scrapeMode)
                .executionOptions(options)
                .triggeredBy(actor.getId())
                .build();

        job = jobRepository.save(job);

        // Publish QUEUED event via Spring ApplicationEventPublisher
        eventPublisher.publishEvent(ExecutionEvent.jobQueued(this, job.getId(), portalName, actor.getOrgId()));

        log.info("Job queued: {} for portal: {} mode: {}", job.getId(), portalName, scrapeMode);

        // Start async execution
        executeAsync(job.getId());

        return job;
    }

    /**
     * Main execution loop — async, runs in thread pool.
     * Ports runScraperTask() from scraperEngine.ts.
     */
    @Async("executionThreadPool")
    public void executeAsync(UUID jobId) {
        ScraperJob job = jobRepository.findById(jobId)
                .orElseThrow(() -> new AppException(ErrorCode.JOB_NOT_FOUND));

        // Register cancellation signal
        AtomicBoolean cancelSignal = new AtomicBoolean(false);
        cancellationSignals.put(jobId, cancelSignal);

        String workerId = "worker-" + Thread.currentThread().getName();

        try {
            // Transition to RUNNING
            job.markStarted(workerId);
            jobRepository.save(job);
            appendLog(jobId, "INFO", "Starting " + job.getPortalName().toUpperCase() +
                    " scraping engine (" + job.getScrapeMode() + " mode)");

            // Publish STARTED event
            eventPublisher.publishEvent(ExecutionEvent.jobStarted(this, jobId, job.getPortalName()));

            long startTime = System.currentTimeMillis();

            switch (job.getScrapeMode()) {
                case "PASS_1_ONLY" -> {
                    var discoveredItems = pass1Executor.execute(job, cancelSignal, this::appendLog, this::updateProgress);
                    job.setTotalItems(discoveredItems.size());
                    job.setUpdatedItems(discoveredItems.size());
                }
                case "PASS_2_ONLY" -> {
                    pass2Executor.executeOnStaged(job, cancelSignal, this::appendLog, this::updateProgress);
                }
                default -> {
                    // FULL or DELTA: Pass 1 → Pass 2
                    appendLog(jobId, "INFO", "=== PASS 1: Reconnaissance & Discovery ===");
                    var discovered = pass1Executor.execute(job, cancelSignal, this::appendLog, this::updateProgress);

                    if (!cancelSignal.get() && !discovered.isEmpty()) {
                        appendLog(jobId, "INFO", "=== PASS 2: Deep Extraction (" + discovered.size() + " items) ===");
                        pass2Executor.execute(job, discovered, cancelSignal, this::appendLog, this::updateProgress);
                    }
                }
            }

            if (cancelSignal.get()) {
                job.markCancelled();
                jobRepository.save(job);
                appendLog(jobId, "WARN", "🛑 Job CANCELLED by admin request");
                eventPublisher.publishEvent(ExecutionEvent.jobCancelled(this, jobId, job.getPortalName()));
            } else {
                job.markCompleted();
                jobRepository.save(job);
                long duration = System.currentTimeMillis() - startTime;
                appendLog(jobId, "SUCCESS", String.format(
                        "🎉 Job COMPLETED. Scraped: %d | Matched: %d | Review Queue: %d | Duration: %ss",
                        job.getUpdatedItems(), job.getMatchedItems(),
                        job.getReviewQueuedItems(), duration / 1000));

                eventPublisher.publishEvent(ExecutionEvent.jobCompleted(this, jobId, job.getPortalName(),
                        job.getUpdatedItems(), duration));
            }

        } catch (Exception ex) {
            log.error("Job {} failed with exception", jobId, ex);
            job.markFailed(ex.getMessage());
            jobRepository.save(job);
            appendLog(jobId, "ERROR", "Fatal error: " + ex.getMessage());

            eventPublisher.publishEvent(ExecutionEvent.jobFailed(this, jobId, job.getPortalName(), ex.getMessage()));
        } finally {
            cancellationSignals.remove(jobId);
            closeSseEmitter(jobId);
        }
    }

    /**
     * Signal cancellation for a running job.
     * Thread-safe via AtomicBoolean — no polling needed.
     */
    @Transactional
    public void cancelJob(UUID jobId, SecurityUser actor) {
        ScraperJob job = jobRepository.findById(jobId)
                .orElseThrow(() -> new AppException(ErrorCode.JOB_NOT_FOUND));

        if (job.isTerminal()) {
            throw new AppException(ErrorCode.JOB_CANNOT_CANCEL);
        }

        AtomicBoolean signal = cancellationSignals.get(jobId);
        if (signal != null) {
            signal.set(true);
            log.info("Cancellation signal sent for job: {}", jobId);
        }
    }

    /** Register SSE emitter for live log streaming */
    public void registerSseEmitter(UUID jobId,
            org.springframework.web.servlet.mvc.method.annotation.SseEmitter emitter) {
        sseEmitters.put(jobId, emitter);
        emitter.onCompletion(() -> sseEmitters.remove(jobId));
        emitter.onTimeout(() -> sseEmitters.remove(jobId));
    }

    // ===== Private helpers =====

    void appendLog(UUID jobId, String level, String message) {
        log.info("[JOB {}] [{}] {}", jobId, level, message);
        logRepository.save(buildLog(jobId, level, message));
        sendSseEvent(jobId, level, message);
    }

    void updateProgress(UUID jobId, int total, int processed, int matched, int reviewQueued) {
        jobRepository.updateProgress(jobId, total, processed, matched, reviewQueued);
        sendSseProgress(jobId, total, processed);
    }

    private void sendSseEvent(UUID jobId, String level, String message) {
        var emitter = sseEmitters.get(jobId);
        if (emitter != null) {
            try {
                emitter.send(org.springframework.web.servlet.mvc.method.annotation.SseEmitter
                        .event().name("log")
                        .data(Map.of("level", level, "message", message,
                                "timestamp", OffsetDateTime.now().toString())));
            } catch (Exception e) {
                sseEmitters.remove(jobId);
            }
        }
    }

    private void sendSseProgress(UUID jobId, int total, int processed) {
        var emitter = sseEmitters.get(jobId);
        if (emitter != null) {
            try {
                emitter.send(org.springframework.web.servlet.mvc.method.annotation.SseEmitter
                        .event().name("progress")
                        .data(Map.of("total", total, "processed", processed)));
            } catch (Exception ignored) {}
        }
    }

    private void closeSseEmitter(UUID jobId) {
        var emitter = sseEmitters.remove(jobId);
        if (emitter != null) {
            try { emitter.complete(); } catch (Exception ignored) {}
        }
    }

    private com.dataacq.execution.domain.ScraperLog buildLog(UUID jobId, String level, String message) {
        return com.dataacq.execution.domain.ScraperLog.builder()
                .jobId(jobId)
                .level(level)
                .message(message)
                .build();
    }
}
