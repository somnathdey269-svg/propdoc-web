package com.dataacq.identity.domain;

import com.dataacq.common.domain.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Platform user record — bridges Supabase auth.users with platform RBAC.
 * One platform_user per Supabase auth user.
 */
@Entity
@Table(name = "platform_users",
       uniqueConstraints = @UniqueConstraint(columnNames = "supabase_user_id"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PlatformUser extends BaseEntity {

    @Column(name = "supabase_user_id", nullable = false)
    private UUID supabaseUserId;

    @Column(name = "email", nullable = false, length = 255)
    private String email;

    @Column(name = "display_name", length = 255)
    private String displayName;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "platform_role", nullable = false, length = 50)
    private String platformRole;   // SUPER_ADMIN, ORG_ADMIN, TEAM_LEAD, BUILDER, VIEWER

    @Column(name = "org_id")
    private UUID orgId;

    @Column(name = "is_locked", nullable = false)
    private boolean isLocked = false;

    @Column(name = "locked_reason")
    private String lockedReason;

    @Column(name = "last_login_at")
    private OffsetDateTime lastLoginAt;

    @Column(name = "login_count")
    private Integer loginCount = 0;
}
