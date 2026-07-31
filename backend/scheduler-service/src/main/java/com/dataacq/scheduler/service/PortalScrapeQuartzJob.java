package com.dataacq.scheduler.service;

import com.dataacq.common.events.ScheduleEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Quartz Job implementation — Fires a ScheduleEvent when triggered by Quartz.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PortalScrapeQuartzJob implements Job {

    private final ApplicationEventPublisher eventPublisher;

    @Override
    public void execute(JobExecutionContext context) throws JobExecutionException {
        String scheduleIdStr = context.getMergedJobDataMap().getString("scheduleId");
        String portalName = context.getMergedJobDataMap().getString("portalName");

        log.info("Quartz Job Triggered for Portal: {} (ScheduleId: {})", portalName, scheduleIdStr);

        if (scheduleIdStr != null) {
            UUID scheduleId = UUID.fromString(scheduleIdStr);
            ScheduleEvent event = new ScheduleEvent(
                    this,
                    ScheduleEvent.Type.TRIGGERED,
                    scheduleId,
                    portalName,
                    OffsetDateTime.now(),
                    "{}"
            );
            eventPublisher.publishEvent(event);
        }
    }
}
