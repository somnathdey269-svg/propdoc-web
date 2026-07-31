package com.dataacq.common.security;

import com.dataacq.common.domain.exception.AppException;
import com.dataacq.common.domain.exception.ErrorCode;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Validates Supabase JWTs and extracts platform user claims.
 *
 * Supabase JWTs are signed with the project's JWT_SECRET (found in
 * Supabase Dashboard → Settings → API → JWT Secret).
 *
 * The JWT contains standard claims plus Supabase-specific ones:
 *   - sub: Supabase user UUID
 *   - email: user email
 *   - app_metadata.platform_role: injected after platform_users lookup
 *   - app_metadata.org_id: injected after platform_users lookup
 */
@Slf4j
@Component
public class JwtTokenProvider {

    @Value("${supabase.jwt.secret}")
    private String supabaseJwtSecret;

    /**
     * Parse and validate a Supabase JWT bearer token.
     * Returns a populated SecurityUser or throws AppException.INVALID_TOKEN.
     */
    public SecurityUser validateAndExtract(String token) {
        try {
            Claims claims = Jwts.parser()
                    .setSigningKey(supabaseJwtSecret.getBytes())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            String supabaseUserId = claims.getSubject();
            String email = claims.get("email", String.class);

            // app_metadata contains platform-specific role injected during sign-in
            @SuppressWarnings("unchecked")
            var appMeta = (java.util.Map<String, Object>) claims.get("app_metadata");
            String role = appMeta != null
                    ? (String) appMeta.getOrDefault("platform_role", RoleConstants.VIEWER)
                    : RoleConstants.VIEWER;

            String orgIdStr = appMeta != null ? (String) appMeta.get("org_id") : null;

            return SecurityUser.builder()
                    .supabaseUserId(UUID.fromString(supabaseUserId))
                    .email(email)
                    .platformRole(role)
                    .orgId(orgIdStr != null ? UUID.fromString(orgIdStr) : null)
                    .locked(false)
                    .build();

        } catch (JwtException | IllegalArgumentException ex) {
            log.warn("JWT validation failed: {}", ex.getMessage());
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }
    }

    /**
     * Extract bearer token from Authorization header value.
     * Returns null if header is missing or malformed.
     */
    public String extractBearerToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
}
