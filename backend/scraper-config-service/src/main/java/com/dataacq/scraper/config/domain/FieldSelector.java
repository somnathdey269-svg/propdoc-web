package com.dataacq.scraper.config.domain;

import com.dataacq.common.domain.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * FieldSelector — one row per extracted field per portal.
 * Replaces the primary_selectors/fallback_selectors JSONB blobs
 * with structured, individually manageable field configs.
 *
 * Each field has a primary selector, optional fallback, data type,
 * and transform rule — enabling fully declarative extraction.
 */
@Entity
@Table(name = "scraper_field_selectors")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FieldSelector extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "config_id", nullable = false)
    private ScraperPortal portal;

    /**
     * Which page context this field is extracted from.
     * e.g. LISTING_CARD, DETAIL_PAGE, TAB_1, TAB_2, TAB_3, TAB_4
     */
    @Column(name = "extraction_context", length = 50)
    private String extractionContext = "LISTING_CARD";

    /** Logical name of the extracted field, e.g. "project_name", "rera_id" */
    @Column(name = "field_name", nullable = false, length = 100)
    private String fieldName;

    /** Target column in destination table, e.g. "projects.name", "portal_pricing.gujrera_price_inr" */
    @Column(name = "maps_to_column", length = 100)
    private String mapsToColumn;

    /** Primary CSS selector or XPath expression */
    @Column(name = "primary_selector")
    private String primarySelector;

    /** Fallback — alternate CSS, XPath, or REGEX pattern */
    @Column(name = "fallback_selector")
    private String fallbackSelector;

    /**
     * Type of selector engine to use.
     * CSS: standard CSS selector
     * XPATH: XPath expression
     * REGEX: regex applied to page HTML
     * JSON_LD: extract from <script type="application/ld+json">
     * ATTRIBUTE: extract an HTML attribute value
     */
    @Column(name = "selector_type", length = 20)
    private String selectorType = "CSS";

    /** HTML attribute to extract. null = innerText. e.g. "href", "data-id", "content" */
    @Column(name = "extract_attribute", length = 50)
    private String extractAttribute;

    /**
     * Data type for casting extracted string value.
     * TEXT, PRICE_INR, DATE, URL, NUMBER, BOOLEAN
     */
    @Column(name = "data_type", length = 30)
    private String dataType = "TEXT";

    /**
     * Transform rule applied after extraction.
     * e.g. PARSE_PRICE_INR, TRIM, UPPERCASE, EXTRACT_RERA_ID, PARSE_DATE_DMY
     */
    @Column(name = "transform_rule", length = 100)
    private String transformRule;

    @Column(name = "is_required")
    private Boolean isRequired = false;

    /** If true, used as the upsert key (deduplication). */
    @Column(name = "is_primary_key")
    private Boolean isPrimaryKey = false;

    /** Display order in the Admin UI selector table */
    @Column(name = "display_order")
    private Integer displayOrder = 0;
}
