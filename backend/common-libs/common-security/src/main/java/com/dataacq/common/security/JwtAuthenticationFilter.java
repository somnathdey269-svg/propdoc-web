package com.dataacq.common.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JWT authentication filter — runs on every request.
 * Validates Supabase JWT → sets SecurityUser in SecurityContext.
 */
@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        String token = jwtTokenProvider.extractBearerToken(authHeader);

        if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                SecurityUser user = jwtTokenProvider.validateAndExtract(token);
                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(auth);
                log.debug("Authenticated user: {} with role: {}", user.getEmail(), user.getPlatformRole());
            } catch (Exception ex) {
                log.warn("JWT authentication failed: {}", ex.getMessage());
                // Don't set authentication — Spring Security will handle as anonymous
            }
        }

        filterChain.doFilter(request, response);
    }
}
