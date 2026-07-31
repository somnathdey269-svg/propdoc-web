package com.dataacq.common.domain.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * Canonical error code registry for the entire platform.
 * Every error has a unique code, message, and HTTP status.
 */
@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // ===================== AUTH & IDENTITY =====================
    UNAUTHORIZED("AUTH_001", "Authentication required", 401),
    FORBIDDEN("AUTH_002", "You do not have permission to perform this action", 403),
    INVALID_TOKEN("AUTH_003", "Invalid or expired authentication token", 401),
    USER_NOT_FOUND("AUTH_004", "User not found", 404),
    USER_LOCKED("AUTH_005", "User account is locked", 403),
    ROLE_NOT_FOUND("AUTH_006", "Role not found", 404),

    // ===================== ORGANIZATION =====================
    ORG_NOT_FOUND("ORG_001", "Organization not found", 404),
    ORG_SUSPENDED("ORG_002", "Organization is suspended", 403),
    ORG_ALREADY_EXISTS("ORG_003", "Organization with this slug already exists", 409),
    TEAM_NOT_FOUND("ORG_004", "Team not found", 404),

    // ===================== SCRAPER CONFIG =====================
    PORTAL_NOT_FOUND("SCRAPER_001", "Scraper portal configuration not found", 404),
    PORTAL_ALREADY_EXISTS("SCRAPER_002", "A portal with this name already exists", 409),
    URL_STRATEGY_NOT_FOUND("SCRAPER_003", "URL strategy not found for this portal", 404),
    FIELD_SELECTOR_NOT_FOUND("SCRAPER_004", "Field selector not found", 404),
    PIPELINE_NOT_FOUND("SCRAPER_005", "Action pipeline not found for this portal", 404),
    INVALID_SELECTOR("SCRAPER_006", "Invalid CSS selector or XPath expression", 422),
    INVALID_URL_PATTERN("SCRAPER_007", "Invalid URL pattern — check variable placeholders", 422),

    // ===================== EXECUTION =====================
    JOB_NOT_FOUND("EXEC_001", "Scraper job not found", 404),
    JOB_ALREADY_RUNNING("EXEC_002", "A job is already running for this portal", 409),
    JOB_CANNOT_CANCEL("EXEC_003", "Job cannot be cancelled in its current state", 422),
    JOB_CANNOT_RETRY("EXEC_004", "Only FAILED jobs can be retried", 422),
    EXECUTION_LIMIT_EXCEEDED("EXEC_005", "Organization execution quota exceeded", 429),

    // ===================== BROWSER SERVICE =====================
    BROWSER_POOL_EXHAUSTED("BROWSER_001", "Browser pool is at capacity. Try again later.", 503),
    SESSION_NOT_FOUND("BROWSER_002", "Browser session not found or expired", 404),
    NAVIGATION_FAILED("BROWSER_003", "Failed to navigate to the specified URL", 502),
    ELEMENT_NOT_FOUND("BROWSER_004", "Element not found using the configured selector", 422),
    SCREENSHOT_FAILED("BROWSER_005", "Failed to capture screenshot", 500),

    // ===================== DATA PIPELINE =====================
    SCHEMA_NOT_FOUND("DATA_001", "Output schema not found", 404),
    VALIDATION_FAILED("DATA_002", "Extracted data failed schema validation", 422),
    EXPORT_FAILED("DATA_003", "Data export failed", 500),
    REVIEW_ITEM_NOT_FOUND("DATA_004", "Review queue item not found", 404),

    // ===================== SCHEDULER =====================
    SCHEDULE_NOT_FOUND("SCHED_001", "Schedule not found", 404),
    INVALID_CRON("SCHED_002", "Invalid cron expression", 422),
    SCHEDULE_ALREADY_EXISTS("SCHED_003", "A schedule already exists for this portal", 409),

    // ===================== WORKFLOW =====================
    WORKFLOW_NOT_FOUND("WF_001", "Workflow not found", 404),
    WORKFLOW_VERSION_NOT_FOUND("WF_002", "Workflow version not found", 404),
    CYCLIC_DEPENDENCY("WF_003", "Workflow contains a cyclic dependency between steps", 422),
    STEP_TYPE_NOT_FOUND("WF_004", "Step type not found in registry", 404),

    // ===================== GENERIC =====================
    RESOURCE_NOT_FOUND("GEN_001", "Resource not found", 404),
    VALIDATION_ERROR("GEN_002", "Request validation failed", 422),
    CONFLICT("GEN_003", "Resource conflict", 409),
    INTERNAL_ERROR("GEN_999", "An internal server error occurred", 500);

    private final String code;
    private final String message;
    private final int httpStatus;
}
