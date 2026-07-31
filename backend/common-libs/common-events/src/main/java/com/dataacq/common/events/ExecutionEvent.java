package com.dataacq.common.events;

import lombok.Getter;

import java.util.UUID;

/**
 * Events fired by the Execution Engine for every job lifecycle transition.
 * Consumed via @EventListener in audit-service, notification-service, etc.
 */
@Getter
public class ExecutionEvent extends BaseEvent {

    public enum Type {
        JOB_QUEUED, JOB_STARTED, JOB_STEP_COMPLETED,
        JOB_COMPLETED, JOB_FAILED, JOB_CANCELLED
    }

    private final Type type;
    private final UUID jobId;
    private final String portalName;
    private final UUID orgId;
    private final String jobStatus;
    private final Integer totalItems;
    private final Integer processedItems;
    private final String errorMessage;
    private final Long durationMs;

    private ExecutionEvent(Object source, Type type, UUID jobId, String portalName,
                           UUID orgId, String jobStatus, Integer totalItems,
                           Integer processedItems, String errorMessage, Long durationMs) {
        super(source, "execution-engine", "ExecutionEvent");
        this.type = type;
        this.jobId = jobId;
        this.portalName = portalName;
        this.orgId = orgId;
        this.jobStatus = jobStatus;
        this.totalItems = totalItems;
        this.processedItems = processedItems;
        this.errorMessage = errorMessage;
        this.durationMs = durationMs;
    }

    public static ExecutionEvent jobQueued(Object source, UUID jobId, String portalName, UUID orgId) {
        return new ExecutionEvent(source, Type.JOB_QUEUED, jobId, portalName,
                orgId, "QUEUED", null, null, null, null);
    }

    public static ExecutionEvent jobStarted(Object source, UUID jobId, String portalName) {
        return new ExecutionEvent(source, Type.JOB_STARTED, jobId, portalName,
                null, "RUNNING", null, null, null, null);
    }

    public static ExecutionEvent jobCompleted(Object source, UUID jobId, String portalName,
                                               int total, long durationMs) {
        return new ExecutionEvent(source, Type.JOB_COMPLETED, jobId, portalName,
                null, "COMPLETED", total, total, null, durationMs);
    }

    public static ExecutionEvent jobFailed(Object source, UUID jobId,
                                            String portalName, String error) {
        return new ExecutionEvent(source, Type.JOB_FAILED, jobId, portalName,
                null, "FAILED", null, null, error, null);
    }

    public static ExecutionEvent jobCancelled(Object source, UUID jobId, String portalName) {
        return new ExecutionEvent(source, Type.JOB_CANCELLED, jobId, portalName,
                null, "CANCELLED", null, null, null, null);
    }
}
