package com.dataacq.organization.domain;

import com.dataacq.common.domain.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

/**
 * Organization entity representing tenant organizations.
 */
@Entity
@Table(name = "organizations")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Organization extends BaseEntity {

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "slug", unique = true, nullable = false, length = 100)
    private String slug;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "max_jobs_per_day")
    private Integer maxJobsPerDay = 100;
}
