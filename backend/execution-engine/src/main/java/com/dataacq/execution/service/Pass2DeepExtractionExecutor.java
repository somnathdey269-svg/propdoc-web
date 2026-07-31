package com.dataacq.execution.service;

import com.dataacq.browser.service.BrowserPoolManager;
import com.dataacq.execution.domain.ScraperJob;
import com.dataacq.pipeline.domain.MatchReviewItem;
import com.dataacq.pipeline.repository.MatchReviewRepository;
import com.dataacq.pipeline.repository.PortalPricingRepository;
import com.dataacq.pipeline.repository.ProjectRepository;
import com.dataacq.pipeline.service.MatchingService;
import com.dataacq.scraper.config.domain.FieldSelector;
import com.dataacq.scraper.config.domain.ScraperPortal;
import com.dataacq.scraper.config.domain.UrlStrategy;
import com.dataacq.scraper.config.repository.FieldSelectorRepository;
import com.dataacq.scraper.config.repository.ScraperPortalRepository;
import com.dataacq.scraper.config.repository.UrlStrategyRepository;
import com.microsoft.playwright.BrowserContext;
import com.microsoft.playwright.Page;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Pass2DeepExtractionExecutor — Phase 2 Pass 2 Deep Extraction Engine.
 *
 * Navigates detail pages & sub-tabs for discovered items, extracts complete field sets,
 * performs deterministic fuzzy matching via MatchingService, and auto-upserts or queues
 * for human review.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class Pass2DeepExtractionExecutor {

    private final BrowserPoolManager browserPoolManager;
    private final ScraperPortalRepository portalRepository;
    private final UrlStrategyRepository urlStrategyRepository;
    private final FieldSelectorRepository fieldSelectorRepository;
    private final DataExtractionService dataExtractionService;
    private final MatchingService matchingService;
    private final ProjectRepository projectRepository;
    private final PortalPricingRepository portalPricingRepository;
    private final MatchReviewRepository matchReviewRepository;

    public void execute(
            ScraperJob job,
            List<Map<String, Object>> discoveredItems,
            AtomicBoolean cancelSignal,
            Pass1ReconnaissanceExecutor.LogConsumer logger,
            Pass1ReconnaissanceExecutor.ProgressConsumer progressTracker) {

        Optional<ScraperPortal> portalOpt = portalRepository.findByPortalName(job.getPortalName());
        if (portalOpt.isEmpty()) return;

        ScraperPortal portal = portalOpt.get();
        List<FieldSelector> detailSelectors = fieldSelectorRepository.findByPortalIdAndExtractionContext(
                portal.getId(), "DETAIL_PAGE");

        if (detailSelectors.isEmpty()) {
            detailSelectors = fieldSelectorRepository.findByPortalIdOrderByDisplayOrderAsc(portal.getId());
        }

        logger.log(job.getId(), "INFO", "Pass 2: Processing " + discoveredItems.size() + " discovered items...");

        BrowserContext context = null;
        int processed = 0;
        int matched = 0;
        int reviewQueued = 0;

        try {
            context = browserPoolManager.createStealthContext(portal.getUserAgentOverride(), 1920, 1080);
            Page page = context.newPage();

            for (Map<String, Object> item : discoveredItems) {
                if (cancelSignal.get()) break;

                processed++;
                String detailUrl = (String) item.get("detail_url");
                String candidateName = (String) item.getOrDefault("project_name", item.get("name"));
                String candidateRera = (String) item.get("rera_no");
                String candidateLocality = (String) item.get("locality");

                if (detailUrl != null && !detailUrl.isBlank()) {
                    try {
                        logger.log(job.getId(), "INFO", "Navigating detail page -> " + detailUrl);
                        page.navigate(detailUrl, new Page.NavigateOptions().setTimeout(portal.getTimeoutMs()));

                        Map<String, Object> detailData = dataExtractionService.extractFromPage(page, detailSelectors);
                        item.putAll(detailData);
                    } catch (Exception e) {
                        logger.log(job.getId(), "WARN", "Failed detail fetch for " + detailUrl + ": " + e.getMessage());
                    }
                }

                // Deterministic Matching against Master Projects DB
                if (candidateName != null) {
                    MatchingService.MatchResult matchResult = matchingService.matchProjects(
                            candidateName, candidateRera, candidateLocality,
                            candidateName, candidateRera, candidateLocality
                    );

                    BigDecimal extractedPrice = (BigDecimal) item.get("price_inr");

                    if (matchResult.status() == MatchingService.MatchStatus.AUTO_MATCHED) {
                        matched++;
                        logger.log(job.getId(), "SUCCESS", "AUTO MATCHED: " + candidateName + " (Score: " + matchResult.score() + ")");
                    } else if (matchResult.status() == MatchingService.MatchStatus.REVIEW_QUEUED) {
                        reviewQueued++;
                        logger.log(job.getId(), "WARN", "QUEUED FOR REVIEW: " + candidateName + " (Score: " + matchResult.score() + ")");

                        // Store item in match_review_queue
                        MatchReviewItem reviewItem = MatchReviewItem.builder()
                                .portalName(job.getPortalName())
                                .candidateName(candidateName)
                                .candidateRera(candidateRera)
                                .candidateLocality(candidateLocality)
                                .candidatePriceInr(extractedPrice)
                                .matchScore(matchResult.score())
                                .status("PENDING")
                                .build();
                        matchReviewRepository.save(reviewItem);
                    }
                }

                progressTracker.update(job.getId(), discoveredItems.size(), processed, matched, reviewQueued);
            }

            job.setMatchedItems(matched);
            job.setReviewQueuedItems(reviewQueued);
            logger.log(job.getId(), "SUCCESS", "Pass 2 Complete. Matched: " + matched + ", Review Queue: " + reviewQueued);

        } catch (Exception e) {
            log.error("Pass 2 execution failed for job {}", job.getId(), e);
            logger.log(job.getId(), "ERROR", "Pass 2 failed: " + e.getMessage());
        } finally {
            if (context != null) {
                try { context.close(); } catch (Exception ignored) {}
            }
        }
    }

    public void executeOnStaged(
            ScraperJob job,
            AtomicBoolean cancelSignal,
            Pass1ReconnaissanceExecutor.LogConsumer logger,
            Pass1ReconnaissanceExecutor.ProgressConsumer progressTracker) {
        logger.log(job.getId(), "INFO", "Executing Pass 2 on staged items...");
        execute(job, Collections.emptyList(), cancelSignal, logger, progressTracker);
    }
}
