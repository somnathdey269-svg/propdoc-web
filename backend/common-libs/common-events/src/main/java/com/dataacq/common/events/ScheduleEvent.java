package com.dataacq.common.events;

import lombok.Getter;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
public class ScheduleEvent extends BaseEvent {
    public enum Type { TRIGGERED, MISSED, PAUSED, RESUMED }
    private final Type type;
    private final UUID scheduleId;
    private final String portalName;
    private final OffsetDateTime triggerTime;
    private final String executionOptions;

    public ScheduleEvent(Object source, Type type, UUID scheduleId,
                          String portalName, OffsetDateTime triggerTime, String executionOptions) {
        super(source, "scheduler-service", "ScheduleEvent");
        this.type = type;
        this.scheduleId = scheduleId;
        this.portalName = portalName;
        this.triggerTime = triggerTime;
        this.executionOptions = executionOptions;
    }
}
