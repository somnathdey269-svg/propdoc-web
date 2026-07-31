package com.dataacq.scraper.config.domain;

import com.dataacq.common.domain.entity.BaseEntity;
import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;

import java.util.List;

/**
 * ScraperPortal — the master record for each configured website/data source.
 * Maps to existing scraper_configs table with extended columns.
 */
@Entity
@Table(name = "scraper_configs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ScraperPortal extends BaseEntity {

    @Column(name = "portal_name", unique = true, nullable = false, length = 100)
    private String portalName;

    @Column(name = "display_name", nullable = false, length = 100)
    private String displayName;

    @Column(name = "base_url", nullable = false)
    private String baseUrl;

    @Column(name = "source_role", length = 20)
    private String sourceRole;  // PRIMARY, SECONDARY

    @Column(name = "auth_type", length = 20)
    private String authType;    // NONE, COOKIE, LOGIN_FORM, BEARER_TOKEN

    @Column(name = "rate_limit_ms")
    private Integer rateLimitMs = 500;

    @Column(name = "max_pages")
    private Integer maxPages = 50;

    @Column(name = "max_retries")
    private Integer maxRetries = 3;

    @Column(name = "timeout_ms")
    private Integer timeoutMs = 30000;

    @Column(name = "requires_browser")
    private Boolean requiresBrowser = true;

    @Column(name = "browser_type", length = 20)
    private String browserType = "chromium";

    @Column(name = "proxy_required")
    private Boolean proxyRequired = false;

    @Column(name = "user_agent_override")
    private String userAgentOverride;

    @Column(name = "is_active")
    private Boolean isActive = true;

    // Legacy JSONB columns — kept for backward compatibility, new config uses related tables
    @Type(JsonBinaryType.class)
    @Column(name = "primary_selectors", columnDefinition = "jsonb")
    private Object primarySelectors;

    @Type(JsonBinaryType.class)
    @Column(name = "fallback_selectors", columnDefinition = "jsonb")
    private Object fallbackSelectors;

    @Type(JsonBinaryType.class)
    @Column(name = "target_cities", columnDefinition = "jsonb")
    private List<String> targetCities;

    @Type(JsonBinaryType.class)
    @Column(name = "target_localities", columnDefinition = "jsonb")
    private List<String> targetLocalities;

    @Column(name = "search_url_template")
    private String searchUrlTemplate;

    // Relationships to structured tables
    @OneToOne(mappedBy = "portal", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private UrlStrategy urlStrategy;

    @OneToMany(mappedBy = "portal", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @OrderBy("displayOrder ASC")
    private List<FieldSelector> fieldSelectors;

    @OneToOne(mappedBy = "portal", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private ActionPipeline actionPipeline;
}
