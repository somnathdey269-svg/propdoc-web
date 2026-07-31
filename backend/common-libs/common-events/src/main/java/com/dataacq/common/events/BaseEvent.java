package com.dataacq.common.events;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Base class for all platform domain events.
 *
 * Extends Spring's ApplicationEvent — published via ApplicationEventPublisher,
 * consumed via @EventListener. Zero infrastructure required.
 *
 * When scaling to multi-service async: serialize these as JSON and publish
 * to Upstash Kafka. The event contract is the same — only the transport changes.
 */
@Getter
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "eventType")
@JsonSubTypes({
        @JsonSubTypes.Type(value = ExecutionEvent.class,     name = "ExecutionEvent"),
        @JsonSubTypes.Type(value = ScheduleEvent.class,      name = "ScheduleEvent"),
        @JsonSubTypes.Type(value = ScraperConfigEvent.class, name = "ScraperConfigEvent"),
        @JsonSubTypes.Type(value = UserEvent.class,          name = "UserEvent"),
})
public abstract class BaseEvent extends ApplicationEvent {

    private final UUID eventId;
    private final OffsetDateTime eventTimestamp;
    private final String sourceService;
    private final String eventType;
    private final String correlationId;

    protected BaseEvent(Object source, String sourceService, String eventType) {
        super(source);
        this.eventId = UUID.randomUUID();
        this.eventTimestamp = OffsetDateTime.now();
        this.sourceService = sourceService;
        this.eventType = eventType;
        this.correlationId = null;
    }
}
