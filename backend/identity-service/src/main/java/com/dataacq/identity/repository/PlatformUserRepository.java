package com.dataacq.identity.repository;

import com.dataacq.identity.domain.PlatformUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PlatformUserRepository extends JpaRepository<PlatformUser, UUID> {
    Optional<PlatformUser> findBySupabaseUserId(UUID supabaseUserId);
    Optional<PlatformUser> findByEmail(String email);
    Page<PlatformUser> findByOrgIdAndIsDeletedFalse(UUID orgId, Pageable pageable);
    Page<PlatformUser> findByIsDeletedFalse(Pageable pageable);
    boolean existsByEmail(String email);
}
