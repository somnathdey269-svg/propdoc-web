package com.dataacq.scheduler.service;

import com.dataacq.common.domain.exception.AppException;
import com.dataacq.common.domain.exception.ErrorCode;
import com.dataacq.common.security.SecurityUser;
import com.dataacq.scheduler.domain.ScraperSchedule;
import com.dataacq.scheduler.repository.ScraperScheduleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

/**
 * QuartzScheduleManager — Manages Quartz triggers and schedules for portals.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class QuartzScheduleManager {

    private final Scheduler scheduler;
    private final ScraperScheduleRepository scheduleRepository;

    @Transactional
    public ScraperSchedule createSchedule(String portalName, String scheduleName, String cronExpression, SecurityUser actor) {
        if (!CronExpression.isValidExpression(cronExpression)) {
            throw new AppException(ErrorCode.INVALID_CRON, "Invalid cron expression: " + cronExpression);
        }

        ScraperSchedule schedule = ScraperSchedule.builder()
                .portalName(portalName)
                .scheduleName(scheduleName)
                .cronExpression(cronExpression)
                .isActive(true)
                .triggerCount(0)
                .build();

        schedule.setCreatedBy(actor.getId());
        schedule = scheduleRepository.save(schedule);

        registerQuartzJob(schedule);
        return schedule;
    }

    @Transactional
    public ScraperSchedule toggleSchedule(UUID scheduleId) {
        ScraperSchedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new AppException(ErrorCode.SCHEDULE_NOT_FOUND));

        schedule.setIsActive(!schedule.getIsActive());
        scheduleRepository.save(schedule);

        if (schedule.getIsActive()) {
            registerQuartzJob(schedule);
        } else {
            unregisterQuartzJob(schedule);
        }

        return schedule;
    }

    public List<ScraperSchedule> listAllSchedules() {
        return scheduleRepository.findAll();
    }

    private void registerQuartzJob(ScraperSchedule schedule) {
        try {
            JobKey jobKey = JobKey.jobKey("job-" + schedule.getId(), "scraper-jobs");
            TriggerKey triggerKey = TriggerKey.triggerKey("trigger-" + schedule.getId(), "scraper-triggers");

            JobDetail jobDetail = JobBuilder.newJob(PortalScrapeQuartzJob.class)
                    .withIdentity(jobKey)
                    .usingJobData("scheduleId", schedule.getId().toString())
                    .usingJobData("portalName", schedule.getPortalName())
                    .build();

            CronTrigger trigger = TriggerBuilder.newTrigger()
                    .withIdentity(triggerKey)
                    .withSchedule(CronScheduleBuilder.cronSchedule(schedule.getCronExpression()))
                    .build();

            if (scheduler.checkExists(jobKey)) {
                scheduler.deleteJob(jobKey);
            }

            scheduler.scheduleJob(jobDetail, trigger);
            schedule.setQuartzJobKey(jobKey.toString());
            schedule.setNextTriggerAt(trigger.getNextFireTime().toInstant().atOffset(ZoneId.systemDefault().getRules().getOffset(trigger.getNextFireTime().toInstant())));
            scheduleRepository.save(schedule);

            log.info("Quartz job registered for schedule: {} with cron: {}", schedule.getId(), schedule.getCronExpression());
        } catch (Exception e) {
            log.error("Failed to register Quartz job for schedule {}", schedule.getId(), e);
        }
    }

    private void unregisterQuartzJob(ScraperSchedule schedule) {
        try {
            JobKey jobKey = JobKey.jobKey("job-" + schedule.getId(), "scraper-jobs");
            if (scheduler.checkExists(jobKey)) {
                scheduler.deleteJob(jobKey);
                log.info("Quartz job deleted for schedule: {}", schedule.getId());
            }
        } catch (Exception e) {
            log.error("Failed to unregister Quartz job for schedule {}", schedule.getId(), e);
        }
    }
}
