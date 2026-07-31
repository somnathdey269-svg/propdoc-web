package com.dataacq.audit.service;

import com.dataacq.audit.domain.AuditRecord;
import com.dataacq.audit.repository.AuditRecordRepository;
import com.dataacq.common.events.ExecutionEvent;
import com.dataacq.common.events.ScheduleEvent;
import com.dataacq.common.events.ScraperConfigEvent;
import com.dataacq.common.events.UserEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

/**
 * AuditEventListener — Listens to all platform Spring events and writes to audit_log.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuditEventListener {

    private final AuditRecordRepository auditRecordRepository;

    @EventListener
    public void onExecutionEvent(ExecutionEvent event) {
        AuditRecord record = AuditRecord.builder()
                .eventType("EXECUTION")
                .entityType("SCRAPER_JOB")
                .entityId(event.getJobId())
                .action(event.getType().name())
                .serviceName(event.getSourceService())
                .build();
        auditRecordRepository.save(record);
        log.debug("Audit record created for execution event: {}", event.getType());
    }

    @EventListener
    public void onUserEvent(UserEvent event) {
        AuditRecord record = AuditRecord.builder()
                .eventType("USER")
                .entityType("PLATFORM_USER")
                .entityId(event.getUserId())
                .actorUserId(event.getActorUserId())
                .action(event.getType().name())
                .serviceName(event.getSourceService())
                .build();
        auditRecordRepository.save(record);
        log.debug("Audit record created for user event: {}", event.getType());
    }

    @EventListener
    public void onScraperConfigEvent(ScraperConfigEvent event) {
        AuditRecord record = AuditRecord.builder()
                .eventType("SCRAPER_CONFIG")
                .entityType("SCRAPER_PORTAL")
                .entityId(event.getPortalId())
                .actorUserId(event.getActorUserId())
                .action(event.getType().name())
                .serviceName(event.getSourceService())
                .build();
        auditRecordRepository.save(record);
        log.debug("Audit record created for scraper config event: {}", event.getType());
    }

    @EventListener
    public void onScheduleEvent(ScheduleEvent event) {
        AuditRecord record = AuditRecord.builder()
                .eventType("SCHEDULE")
                .entityType("SCRAPER_SCHEDULE")
                .entityId(event.getScheduleId())
                .action(event.getType().name())
                .serviceName(event.getSourceService())
                .build();
        auditRecordRepository.save(record);
        log.debug("Audit record created for schedule event: {}", event.getType());
    }
}
