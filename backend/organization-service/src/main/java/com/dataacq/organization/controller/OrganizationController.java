package com.dataacq.organization.controller;

import com.dataacq.common.domain.exception.AppException;
import com.dataacq.common.domain.exception.ErrorCode;
import com.dataacq.common.domain.response.ApiResponse;
import com.dataacq.common.security.SecurityUser;
import com.dataacq.organization.domain.Organization;
import com.dataacq.organization.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/org")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationRepository organizationRepository;

    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<Organization>>> listOrganizations() {
        return ResponseEntity.ok(ApiResponse.success(organizationRepository.findAll()));
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Organization>> createOrganization(
            @RequestParam String name,
            @RequestParam String slug,
            @AuthenticationPrincipal SecurityUser actor) {
        if (organizationRepository.existsBySlug(slug)) {
            throw new AppException(ErrorCode.ORG_ALREADY_EXISTS);
        }

        Organization org = Organization.builder()
                .name(name)
                .slug(slug)
                .isActive(true)
                .build();
        org.setCreatedBy(actor.getId());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(organizationRepository.save(org), "Organization created"));
    }
}
