package com.dataacq.common.security;

/**
 * Platform role constants. Stored in JWT claims and platform_users table.
 * Role hierarchy: SUPER_ADMIN > ORG_ADMIN > TEAM_LEAD > BUILDER > VIEWER
 */
public final class RoleConstants {
    public static final String SUPER_ADMIN = "SUPER_ADMIN";
    public static final String ORG_ADMIN   = "ORG_ADMIN";
    public static final String TEAM_LEAD   = "TEAM_LEAD";
    public static final String BUILDER     = "BUILDER";
    public static final String VIEWER      = "VIEWER";

    // Spring Security role prefixes
    public static final String ROLE_SUPER_ADMIN = "ROLE_SUPER_ADMIN";
    public static final String ROLE_ORG_ADMIN   = "ROLE_ORG_ADMIN";
    public static final String ROLE_TEAM_LEAD   = "ROLE_TEAM_LEAD";
    public static final String ROLE_BUILDER     = "ROLE_BUILDER";
    public static final String ROLE_VIEWER      = "ROLE_VIEWER";

    private RoleConstants() {}
}
