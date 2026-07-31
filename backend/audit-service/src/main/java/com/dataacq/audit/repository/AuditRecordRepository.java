package com.dataacq.audit.repository;

import com.dataacq.audit.domain.AuditRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AuditRecordRepository extends JpaRepository<AuditRecord, UUID> {
    Page<AuditRecord> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
