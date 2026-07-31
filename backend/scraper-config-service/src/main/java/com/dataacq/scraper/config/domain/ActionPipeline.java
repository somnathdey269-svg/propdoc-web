package com.dataacq.scraper.config.domain;

import com.dataacq.common.domain.entity.BaseEntity;
import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;

import java.util.List;
import java.util.Map;

/**
 * ActionPipeline — ordered list of action nodes defining HOW to execute
 * a scrape on a portal. This is the runtime execution blueprint.
 *
 * Ports the scraper_action_pipelines table to a structured Java domain.
 * pipeline_nodes is kept as JSONB for flexibility but each node type
 * is validated against ActionNodeType enum at save time.
 */
@Entity
@Table(name = "scraper_action_pipelines")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ActionPipeline extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portal_name", referencedColumnName = "portal_name")
    private ScraperPortal portal;

    @Column(name = "display_name", nullable = false, length = 100)
    private String displayName;

    /**
     * Array of action nodes. Each node represents one step in the pipeline.
     * Validated node types: NAVIGATE, INTERACT, DISCOVER_INDEX,
     *   TAB_DRILLDOWN, SCHEMA_EXTRACT, VALIDATE, UPSERT,
     *   WAIT, PAGINATE, CONDITION, LOG
     */
    @Type(JsonBinaryType.class)
    @Column(name = "pipeline_nodes", columnDefinition = "jsonb", nullable = false)
    private List<Map<String, Object>> pipelineNodes;

    @Column(name = "version", nullable = false)
    private Integer pipelineVersion = 1;

    public enum NodeType {
        NAVIGATE, INTERACT, DISCOVER_INDEX, TAB_DRILLDOWN,
        SCHEMA_EXTRACT, VALIDATE, UPSERT, WAIT, PAGINATE,
        CONDITION, LOG, SET_VARIABLE
    }
}
