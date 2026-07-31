package com.dataacq.common.events;

/**
 * Canonical Kafka topic names for the platform.
 * All producers and consumers reference these constants — never hardcode strings.
 */
public final class KafkaTopics {
    // Execution Engine Events
    public static final String EXECUTION_JOBS   = "dataacq.execution.jobs";
    public static final String EXECUTION_STEPS  = "dataacq.execution.steps";

    // Scheduler Events
    public static final String SCHEDULE_TRIGGER = "dataacq.schedule.triggers";

    // Data Pipeline Events
    public static final String DATA_EXTRACTED   = "dataacq.data.extracted";
    public static final String DATA_STORED      = "dataacq.data.stored";

    // Config Events
    public static final String SCRAPER_CONFIG   = "dataacq.scraper.config";

    // User/Auth Events
    public static final String USER_EVENTS      = "dataacq.user.events";

    // Audit (append-only sink)
    public static final String AUDIT_LOG        = "dataacq.audit.log";

    // Dead Letter Queues
    public static final String DLQ_SUFFIX       = ".dlq";

    private KafkaTopics() {}
}
