package com.dataacq.scraper.config.domain;

import com.dataacq.common.domain.entity.BaseEntity;
import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;

import java.util.List;
import java.util.Map;

/**
 * UrlStrategy — defines the 3-tier URL hierarchy for a portal:
 *   Tier 1: Entry URL (index/search page)
 *   Tier 2: Pagination (how to get all listing pages)
 *   Tier 3: Detail URL (individual record page + sub-tabs)
 */
@Entity
@Table(name = "scraper_url_strategies")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UrlStrategy extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "config_id", nullable = false)
    private ScraperPortal portal;

    // === TIER 1: Entry Point ===
    @Column(name = "entry_url", nullable = false)
    private String entryUrl;

    @Column(name = "entry_method", length = 10)
    private String entryMethod = "GET";  // GET, POST

    // === TIER 2: Pagination ===
    @Column(name = "pagination_type", length = 30)
    private String paginationType;  // URL_PATTERN, NEXT_BUTTON, INFINITE_SCROLL, NONE

    @Column(name = "pagination_url_pattern")
    private String paginationUrlPattern;  // e.g. ?page={PAGE}&district={DISTRICT}

    @Column(name = "pagination_start")
    private Integer paginationStart = 1;

    @Column(name = "pagination_max")
    private Integer paginationMax = 50;

    @Column(name = "next_button_selector")
    private String nextButtonSelector;  // CSS selector for "next page" button

    @Column(name = "load_more_selector")
    private String loadMoreSelector;    // CSS selector for "load more" button

    // === TIER 3: Detail Pages ===
    @Column(name = "has_detail_pages")
    private Boolean hasDetailPages = false;

    @Column(name = "detail_url_pattern")
    private String detailUrlPattern;   // e.g. /project/{ID}

    @Column(name = "detail_link_selector")
    private String detailLinkSelector; // CSS to find the link in a listing card

    @Column(name = "detail_link_attribute", length = 50)
    private String detailLinkAttribute = "href";

    // === SUB-TABS on detail page ===
    @Column(name = "has_sub_tabs")
    private Boolean hasSubTabs = false;

    @Type(JsonBinaryType.class)
    @Column(name = "tab_selectors", columnDefinition = "jsonb")
    private List<Map<String, String>> tabSelectors;
    // Format: [{label: "Tab 1 Basic Info", selector: "#tab1-btn", waitSelector: ".tab1-content"}]

    // === URL Variable Bindings ===
    @Type(JsonBinaryType.class)
    @Column(name = "url_variables", columnDefinition = "jsonb")
    private List<Map<String, String>> urlVariables;
    // Format: [{name: "DISTRICT", source: "target_locality"}, {name: "PAGE", source: "auto_increment"}]
}
