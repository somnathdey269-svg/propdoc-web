package com.dataacq.audit.controller;

import com.dataacq.audit.domain.AuditRecord;
import com.dataacq.audit.repository.AuditRecordRepository;
import com.dataacq.common.domain.response.ApiResponse;
import com.dataacq.common.domain.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditRecordRepository auditRecordRepository;

    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<AuditRecord>>> getAuditLogs(
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                PageResponse.from(auditRecordRepository.findAllByOrderByCreatedAtDesc(pageable))
        ));
    }
}
