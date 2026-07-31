package com.dataacq.common.events;

import lombok.Getter;
import java.util.UUID;

@Getter
public class UserEvent extends BaseEvent {
    public enum Type { USER_CREATED, USER_ROLE_CHANGED, USER_LOCKED, USER_UNLOCKED, USER_LOGGED_IN }
    private final Type type;
    private final UUID userId;
    private final String email;
    private final String oldRole;
    private final String newRole;
    private final UUID actorUserId;

    public UserEvent(Object source, Type type, UUID userId, String email, String oldRole, String newRole, UUID actorUserId) {
        super(source, "identity-service", "UserEvent");
        this.type = type;
        this.userId = userId;
        this.email = email;
        this.oldRole = oldRole;
        this.newRole = newRole;
        this.actorUserId = actorUserId;
    }
}
