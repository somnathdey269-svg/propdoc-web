package com.dataacq.scheduler.controller;

import com.dataacq.common.domain.response.ApiResponse;
import com.dataacq.common.security.SecurityUser;
import com.dataacq.scheduler.domain.ScraperSchedule;
import com.dataacq.scheduler.service.QuartzScheduleManager;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/scheduler")
@RequiredArgsConstructor
public class SchedulerController {

    private final QuartzScheduleManager scheduleManager;

    @GetMapping("/schedules")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ORG_ADMIN')")
    public ResponseEntity<ApiResponse<List<ScraperSchedule>>> listSchedules() {
        return ResponseEntity.ok(ApiResponse.success(scheduleManager.listAllSchedules()));
    }

    @PostMapping("/schedules")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ORG_ADMIN')")
    public ResponseEntity<ApiResponse<ScraperSchedule>> createSchedule(
            @RequestParam String portalName,
            @RequestParam String scheduleName,
            @RequestParam String cronExpression,
            @AuthenticationPrincipal SecurityUser actor) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        scheduleManager.createSchedule(portalName, scheduleName, cronExpression, actor),
                        "Schedule created successfully"
                ));
    }

    @PatchMapping("/schedules/{id}/toggle")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ORG_ADMIN')")
    public ResponseEntity<ApiResponse<ScraperSchedule>> toggleSchedule(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(
                scheduleManager.toggleSchedule(id), "Schedule status toggled"
        ));
    }
}
