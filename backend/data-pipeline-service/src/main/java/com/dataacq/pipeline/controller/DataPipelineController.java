package com.dataacq.pipeline.controller;

import com.dataacq.common.domain.response.ApiResponse;
import com.dataacq.common.domain.response.PageResponse;
import com.dataacq.common.security.SecurityUser;
import com.dataacq.pipeline.domain.MatchReviewItem;
import com.dataacq.pipeline.service.ReviewQueueService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * DataPipelineController — REST API for Match Review Queue & Data Pipeline operations.
 */
@RestController
@RequestMapping("/api/data")
@RequiredArgsConstructor
public class DataPipelineController {

    private final ReviewQueueService reviewQueueService;

    @GetMapping("/review-queue")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ORG_ADMIN','BUILDER')")
    public ResponseEntity<ApiResponse<PageResponse<MatchReviewItem>>> getPendingReviews(
            @RequestParam(required = false) String portalName,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                reviewQueueService.getPendingReviews(portalName, pageable)
        ));
    }

    @PostMapping("/review-queue/{id}/approve")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ORG_ADMIN','BUILDER')")
    public ResponseEntity<ApiResponse<MatchReviewItem>> approveMatch(
            @PathVariable UUID id,
            @AuthenticationPrincipal SecurityUser actor) {
        return ResponseEntity.ok(ApiResponse.success(
                reviewQueueService.approveMatch(id, actor), "Match approved and pricing updated"
        ));
    }

    @PostMapping("/review-queue/{id}/reject")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ORG_ADMIN','BUILDER')")
    public ResponseEntity<ApiResponse<MatchReviewItem>> rejectMatch(
            @PathVariable UUID id,
            @AuthenticationPrincipal SecurityUser actor) {
        return ResponseEntity.ok(ApiResponse.success(
                reviewQueueService.rejectMatch(id, actor), "Match rejected"
        ));
    }

    @PostMapping("/review-queue/bulk-decide")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ORG_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> bulkDecide(
            @RequestBody List<UUID> ids,
            @RequestParam String decision,
            @AuthenticationPrincipal SecurityUser actor) {
        reviewQueueService.bulkDecide(ids, decision, actor);
        return ResponseEntity.ok(ApiResponse.success(null, "Bulk decision processed"));
    }
}
