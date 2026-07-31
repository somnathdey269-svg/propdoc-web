package com.dataacq.common.events;

import lombok.Getter;
import java.util.UUID;

@Getter
public class ScraperConfigEvent extends BaseEvent {
    public enum Type { PORTAL_CREATED, PORTAL_UPDATED, PORTAL_ENABLED, PORTAL_DISABLED, PIPELINE_UPDATED }
    private final Type type;
    private final UUID portalId;
    private final String portalName;
    private final UUID actorUserId;

    public ScraperConfigEvent(Object source, Type type, UUID portalId,
                               String portalName, UUID actorUserId) {
        super(source, "scraper-config-service", "ScraperConfigEvent");
        this.type = type;
        this.portalId = portalId;
        this.portalName = portalName;
        this.actorUserId = actorUserId;
    }
}
