package com.dataacq.scheduler.domain;

import com.dataacq.common.domain.entity.BaseEntity;
import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;

import java.time.OffsetDateTime;
import java.util.Map;

/**
 * ScraperSchedule — persistent Quartz schedule config per portal.
 * Maps to new scraper_schedules table.
 * Replaces cronScheduler.ts.
 */
@Entity
@Table(name = "scraper_schedules")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ScraperSchedule extends BaseEntity {

    @Column(name = "portal_name", nullable = false, length = 100)
    private String portalName;

    @Column(name = "schedule_name", nullable = false, length = 255)
    private String scheduleName;

    /** Standard 5-field cron expression. e.g. "0 2 * * 0" = every Sunday 2AM */
    @Column(name = "cron_expression", nullable = false, length = 100)
    private String cronExpression;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "last_triggered_at")
    private OffsetDateTime lastTriggeredAt;

    @Column(name = "next_trigger_at")
    private OffsetDateTime nextTriggerAt;

    @Column(name = "last_job_id")
    private java.util.UUID lastJobId;

    @Column(name = "trigger_count")
    private Integer triggerCount = 0;

    /** Quartz job key for reference */
    @Column(name = "quartz_job_key", length = 255)
    private String quartzJobKey;

    /** Execution options passed to execution engine when triggered */
    @Type(JsonBinaryType.class)
    @Column(name = "execution_options", columnDefinition = "jsonb")
    private Map<String, Object> executionOptions;
    // Keys: scrapeMode, maxPages, delayMs, targetCities, targetLocalities, category
}
