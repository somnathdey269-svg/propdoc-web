package com.dataacq.identity.service;

import com.dataacq.common.domain.exception.AppException;
import com.dataacq.common.domain.exception.ErrorCode;
import com.dataacq.common.domain.response.PageResponse;
import com.dataacq.common.events.UserEvent;
import com.dataacq.common.security.JwtTokenProvider;
import com.dataacq.common.security.RoleConstants;
import com.dataacq.common.security.SecurityUser;
import com.dataacq.identity.domain.PlatformUser;
import com.dataacq.identity.dto.PlatformUserDto;
import com.dataacq.identity.dto.RoleUpdateRequest;
import com.dataacq.identity.dto.UserProfileResponse;
import com.dataacq.identity.repository.PlatformUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class IdentityService {

    private final PlatformUserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * Called on every API request — validates Supabase JWT and
     * ensures a platform_users record exists (auto-provision on first login).
     */
    @Transactional
    public UserProfileResponse verifyAndProvision(String bearerToken) {
        SecurityUser securityUser = jwtTokenProvider.validateAndExtract(bearerToken);

        PlatformUser user = userRepository.findBySupabaseUserId(securityUser.getSupabaseUserId())
                .orElseGet(() -> createPlatformUser(securityUser));

        if (user.isLocked()) {
            throw new AppException(ErrorCode.USER_LOCKED, "Account locked: " + user.getLockedReason());
        }

        // Update last login
        user.setLastLoginAt(OffsetDateTime.now());
        user.setLoginCount(user.getLoginCount() + 1);
        userRepository.save(user);

        return toProfileResponse(user);
    }

    @Transactional(readOnly = true)
    public PageResponse<PlatformUserDto> listAllUsers(Pageable pageable) {
        return PageResponse.from(
                userRepository.findByIsDeletedFalse(pageable).map(this::toDto)
        );
    }

    @Transactional(readOnly = true)
    public PlatformUserDto getUserById(UUID userId) {
        return userRepository.findById(userId)
                .filter(u -> !u.isDeleted())
                .map(this::toDto)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    @Transactional
    public PlatformUserDto updateRole(UUID userId, RoleUpdateRequest req, SecurityUser actor) {
        PlatformUser user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        String oldRole = user.getPlatformRole();
        user.setPlatformRole(req.getRole());
        user.setUpdatedBy(actor.getId());
        userRepository.save(user);

        // Publish Spring domain event
        UserEvent event = new UserEvent(this, UserEvent.Type.USER_ROLE_CHANGED, userId, user.getEmail(), oldRole, req.getRole(), actor.getId());
        eventPublisher.publishEvent(event);

        log.info("Role updated for user {} from {} to {} by {}", userId, oldRole, req.getRole(), actor.getEmail());
        return toDto(user);
    }

    @Transactional
    public PlatformUserDto lockUser(UUID userId, String reason, SecurityUser actor) {
        PlatformUser user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        user.setLocked(true);
        user.setLockedReason(reason);
        user.setUpdatedBy(actor.getId());
        userRepository.save(user);
        log.info("User {} locked by {}: {}", userId, actor.getEmail(), reason);
        return toDto(user);
    }

    @Transactional
    public PlatformUserDto unlockUser(UUID userId, SecurityUser actor) {
        PlatformUser user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        user.setLocked(false);
        user.setLockedReason(null);
        user.setUpdatedBy(actor.getId());
        userRepository.save(user);
        log.info("User {} unlocked by {}", userId, actor.getEmail());
        return toDto(user);
    }

    // ===== Private helpers =====

    private PlatformUser createPlatformUser(SecurityUser securityUser) {
        log.info("Auto-provisioning platform user for: {}", securityUser.getEmail());
        PlatformUser user = PlatformUser.builder()
                .supabaseUserId(securityUser.getSupabaseUserId())
                .email(securityUser.getEmail())
                .platformRole(RoleConstants.VIEWER)  // default — super admin promotes
                .isLocked(false)
                .loginCount(0)
                .build();

        // Hardcoded super admin bootstrap (matches existing Supabase RLS policy)
        if ("somnathdey269@gmail.com".equals(securityUser.getEmail())) {
            user.setPlatformRole(RoleConstants.SUPER_ADMIN);
        }

        return userRepository.save(user);
    }

    private PlatformUserDto toDto(PlatformUser user) {
        return PlatformUserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .platformRole(user.getPlatformRole())
                .orgId(user.getOrgId())
                .isLocked(user.isLocked())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private UserProfileResponse toProfileResponse(PlatformUser user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .platformRole(user.getPlatformRole())
                .orgId(user.getOrgId())
                .build();
    }
}
