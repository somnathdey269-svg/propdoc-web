package com.dataacq.common.security;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

/**
 * Authenticated user principal — populated from Supabase JWT claims.
 * Available in any controller via @AuthenticationPrincipal SecurityUser user.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SecurityUser implements UserDetails {

    private UUID id;
    private String email;
    private UUID supabaseUserId;
    private String platformRole;  // SUPER_ADMIN, ORG_ADMIN, BUILDER, VIEWER
    private UUID orgId;
    private boolean locked;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + platformRole));
    }

    @Override
    public String getPassword() { return null; }

    @Override
    public String getUsername() { return email; }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return !locked; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return !locked; }

    public boolean isSuperAdmin() {
        return RoleConstants.SUPER_ADMIN.equals(platformRole);
    }

    public boolean isOrgAdmin() {
        return RoleConstants.ORG_ADMIN.equals(platformRole);
    }
}
