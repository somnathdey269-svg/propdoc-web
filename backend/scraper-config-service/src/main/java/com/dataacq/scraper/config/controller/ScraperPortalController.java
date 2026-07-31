package com.dataacq.scraper.config.controller;

import com.dataacq.common.domain.response.ApiResponse;
import com.dataacq.common.domain.response.PageResponse;
import com.dataacq.common.security.SecurityUser;
import com.dataacq.scraper.config.dto.*;
import com.dataacq.scraper.config.service.ScraperPortalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Portal Management API — CRUD for website/source configurations.
 * Super Admin and Org Admin can manage portals.
 */
@RestController
@RequestMapping("/api/scraper/portals")
@RequiredArgsConstructor
public class ScraperPortalController {

    private final ScraperPortalService portalService;

    /** List all portals — paginated, filterable by role and active status */
    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ORG_ADMIN','BUILDER')")
    public ResponseEntity<ApiResponse<PageResponse<ScraperPortalDto>>> listPortals(
            @RequestParam(required = false) String sourceRole,
            @RequestParam(required = false) Boolean isActive,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                portalService.listPortals(sourceRole, isActive, pageable)
        ));
    }

    /** Get single portal with full detail (URL strategy, selectors, pipeline) */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ORG_ADMIN','BUILDER')")
    public ResponseEntity<ApiResponse<ScraperPortalDetailDto>> getPortal(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(portalService.getPortalDetail(id)));
    }

    /** Create a new portal configuration */
    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ORG_ADMIN')")
    public ResponseEntity<ApiResponse<ScraperPortalDto>> createPortal(
            @Valid @RequestBody CreatePortalRequest req,
            @AuthenticationPrincipal SecurityUser actor) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(portalService.createPortal(req, actor), "Portal created successfully"));
    }

    /** Update portal basic settings */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ORG_ADMIN')")
    public ResponseEntity<ApiResponse<ScraperPortalDto>> updatePortal(
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePortalRequest req,
            @AuthenticationPrincipal SecurityUser actor) {
        return ResponseEntity.ok(ApiResponse.success(portalService.updatePortal(id, req, actor)));
    }

    /** Toggle portal active/inactive */
    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ORG_ADMIN')")
    public ResponseEntity<ApiResponse<ScraperPortalDto>> togglePortal(
            @PathVariable UUID id,
            @AuthenticationPrincipal SecurityUser actor) {
        return ResponseEntity.ok(ApiResponse.success(portalService.togglePortal(id, actor)));
    }

    /** Soft delete portal */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deletePortal(
            @PathVariable UUID id,
            @AuthenticationPrincipal SecurityUser actor) {
        portalService.deletePortal(id, actor);
        return ResponseEntity.ok(ApiResponse.success(null, "Portal deleted"));
    }

    // ===== URL STRATEGY =====

    @GetMapping("/{id}/url-strategy")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ORG_ADMIN','BUILDER')")
    public ResponseEntity<ApiResponse<UrlStrategyDto>> getUrlStrategy(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(portalService.getUrlStrategy(id)));
    }

    @PostMapping("/{id}/url-strategy")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ORG_ADMIN')")
    public ResponseEntity<ApiResponse<UrlStrategyDto>> saveUrlStrategy(
            @PathVariable UUID id,
            @Valid @RequestBody SaveUrlStrategyRequest req,
            @AuthenticationPrincipal SecurityUser actor) {
        return ResponseEntity.ok(ApiResponse.success(portalService.saveUrlStrategy(id, req, actor)));
    }

    // ===== FIELD SELECTORS =====

    @GetMapping("/{id}/selectors")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ORG_ADMIN','BUILDER')")
    public ResponseEntity<ApiResponse<java.util.List<FieldSelectorDto>>> getSelectors(
            @PathVariable UUID id,
            @RequestParam(required = false) String context) {
        return ResponseEntity.ok(ApiResponse.success(portalService.getFieldSelectors(id, context)));
    }

    @PostMapping("/{id}/selectors")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ORG_ADMIN')")
    public ResponseEntity<ApiResponse<FieldSelectorDto>> addSelector(
            @PathVariable UUID id,
            @Valid @RequestBody SaveFieldSelectorRequest req,
            @AuthenticationPrincipal SecurityUser actor) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(portalService.addFieldSelector(id, req, actor)));
    }

    @PutMapping("/{id}/selectors/{selectorId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ORG_ADMIN')")
    public ResponseEntity<ApiResponse<FieldSelectorDto>> updateSelector(
            @PathVariable UUID id,
            @PathVariable UUID selectorId,
            @Valid @RequestBody SaveFieldSelectorRequest req,
            @AuthenticationPrincipal SecurityUser actor) {
        return ResponseEntity.ok(ApiResponse.success(portalService.updateFieldSelector(id, selectorId, req, actor)));
    }

    @DeleteMapping("/{id}/selectors/{selectorId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ORG_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteSelector(
            @PathVariable UUID id,
            @PathVariable UUID selectorId,
            @AuthenticationPrincipal SecurityUser actor) {
        portalService.deleteFieldSelector(id, selectorId, actor);
        return ResponseEntity.ok(ApiResponse.success(null, "Selector removed"));
    }

    @PostMapping("/{id}/selectors/reorder")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ORG_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> reorderSelectors(
            @PathVariable UUID id,
            @RequestBody java.util.List<UUID> orderedIds,
            @AuthenticationPrincipal SecurityUser actor) {
        portalService.reorderSelectors(id, orderedIds, actor);
        return ResponseEntity.ok(ApiResponse.success(null, "Order updated"));
    }

    // ===== ACTION PIPELINE =====

    @GetMapping("/{id}/pipeline")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ORG_ADMIN','BUILDER')")
    public ResponseEntity<ApiResponse<ActionPipelineDto>> getPipeline(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(portalService.getPipeline(id)));
    }

    @PutMapping("/{id}/pipeline")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ORG_ADMIN')")
    public ResponseEntity<ApiResponse<ActionPipelineDto>> savePipeline(
            @PathVariable UUID id,
            @Valid @RequestBody SavePipelineRequest req,
            @AuthenticationPrincipal SecurityUser actor) {
        return ResponseEntity.ok(ApiResponse.success(portalService.savePipeline(id, req, actor)));
    }

    @PostMapping("/{id}/pipeline/validate")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ORG_ADMIN','BUILDER')")
    public ResponseEntity<ApiResponse<PipelineValidationResult>> validatePipeline(
            @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(portalService.validatePipeline(id)));
    }

    // ===== SCOPE =====

    @GetMapping("/{id}/scope")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ORG_ADMIN','BUILDER')")
    public ResponseEntity<ApiResponse<ScopeConfigDto>> getScope(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(portalService.getScope(id)));
    }

    @PutMapping("/{id}/scope")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ORG_ADMIN')")
    public ResponseEntity<ApiResponse<ScopeConfigDto>> updateScope(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateScopeRequest req,
            @AuthenticationPrincipal SecurityUser actor) {
        return ResponseEntity.ok(ApiResponse.success(portalService.updateScope(id, req, actor)));
    }
}
