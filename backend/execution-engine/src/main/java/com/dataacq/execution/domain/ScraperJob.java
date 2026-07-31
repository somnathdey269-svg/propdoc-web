package com.dataacq.execution.domain;

import com.dataacq.common.domain.entity.BaseEntity;
import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * ScraperJob — execution record for a single scraping run.
 * Maps to existing scraper_jobs table with extended fields.
 * Ports the job lifecycle from scraperEngine.ts to Java.
 */
@Entity
@Table(name = "scraper_jobs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ScraperJob extends BaseEntity {

    @Column(name = "portal_name", nullable = false, length = 100)
    private String portalName;

    /**
     * Job type: MANUAL (triggered by admin), CRON (scheduled), PASS_1_ONLY, PASS_2_ONLY
     */
    @Column(name = "job_type", length = 50)
    private String jobType = "MANUAL";

    /**
     * Execution status state machine:
     * QUEUED → INITIALIZING → RUNNING → COMPLETING → COMPLETED
     *                                              → FAILED
     *                                              → CANCELLED
     */
    @Column(name = "status", length = 50)
    private String status = "QUEUED";

    @Column(name = "scrape_mode", length = 20)
    private String scrapeMode = "FULL";   // FULL, DELTA, SINGLE_PROJECT, PASS_1_ONLY, PASS_2_ONLY

    @Column(name = "total_items")
    private Integer totalItems = 0;

    @Column(name = "updated_items")
    private Integer updatedItems = 0;

    @Column(name = "matched_items")
    private Integer matchedItems = 0;

    @Column(name = "review_queued_items")
    private Integer reviewQueuedItems = 0;

    @Column(name = "failed_items")
    private Integer failedItems = 0;

    @Column(name = "error_message")
    private String errorMessage;

    @Column(name = "started_at")
    private OffsetDateTime startedAt;

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;

    @Column(name = "duration_ms")
    private Long durationMs;

    @Column(name = "worker_id")
    private String workerId;

    @Column(name = "triggered_by")
    private UUID triggeredBy;

    @Column(name = "scheduled_cron", length = 100)
    private String scheduledCron;

    /** Execution options: targetCities, targetLocalities, maxPages, delayMs, etc. */
    @Type(JsonBinaryType.class)
    @Column(name = "execution_options", columnDefinition = "jsonb")
    private java.util.Map<String, Object> executionOptions;

    // Helper methods for state transitions
    public void markStarted(String workerId) {
        this.status = "RUNNING";
        this.startedAt = OffsetDateTime.now();
        this.workerId = workerId;
    }

    public void markCompleted() {
        this.status = "COMPLETED";
        this.completedAt = OffsetDateTime.now();
        this.durationMs = startedAt != null
                ? java.time.Duration.between(startedAt, completedAt).toMillis()
                : null;
    }

    public void markFailed(String error) {
        this.status = "FAILED";
        this.errorMessage = error;
        this.completedAt = OffsetDateTime.now();
    }

    public void markCancelled() {
        this.status = "CANCELLED";
        this.completedAt = OffsetDateTime.now();
    }

    public boolean isTerminal() {
        return "COMPLETED".equals(status) || "FAILED".equals(status) || "CANCELLED".equals(status);
    }

    public boolean isRunning() {
        return "RUNNING".equals(status) || "INITIALIZING".equals(status);
    }
}
