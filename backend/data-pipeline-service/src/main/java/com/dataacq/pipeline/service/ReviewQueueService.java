package com.dataacq.pipeline.service;

import com.dataacq.common.domain.exception.AppException;
import com.dataacq.common.domain.exception.ErrorCode;
import com.dataacq.common.domain.response.PageResponse;
import com.dataacq.common.security.SecurityUser;
import com.dataacq.pipeline.domain.MatchReviewItem;
import com.dataacq.pipeline.dto.ReviewDecisionRequest;
import com.dataacq.pipeline.repository.MatchReviewRepository;
import com.dataacq.pipeline.repository.PortalPricingRepository;
import com.dataacq.pipeline.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * ReviewQueueService — manages the human-in-the-loop match review workflow.
 * Ports match_review_queue operations from scraperEngine.ts to Java.
 *
 * Low-confidence matches (score 60–84) are placed here for admin review.
 * Admin APPROVE → upserts portal_pricing.
 * Admin REJECT → marks as REJECTED, no data written.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewQueueService {

    private final MatchReviewRepository reviewRepository;
    private final PortalPricingRepository pricingRepository;
    private final ProjectRepository projectRepository;

    @Transactional(readOnly = true)
    public PageResponse<MatchReviewItem> getPendingReviews(String portalName, Pageable pageable) {
        if (portalName != null && !portalName.isBlank()) {
            return PageResponse.from(
                    reviewRepository.findByPortalNameAndStatusOrderByCreatedAtDesc(portalName, "PENDING", pageable)
            );
        }
        return PageResponse.from(
                reviewRepository.findByStatusOrderByCreatedAtDesc("PENDING", pageable)
        );
    }

    @Transactional
    public MatchReviewItem approveMatch(UUID reviewItemId, SecurityUser actor) {
        MatchReviewItem item = reviewRepository.findById(reviewItemId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_ITEM_NOT_FOUND));

        if (!"PENDING".equals(item.getStatus())) {
            throw new AppException(ErrorCode.CONFLICT, "Review item is already " + item.getStatus());
        }

        // Upsert the price into portal_pricing
        upsertPortalPricing(item.getProjectId(), item.getPortalName(), item.getCandidatePriceInr());

        item.setStatus("APPROVED");
        item.setReviewedBy(actor.getId());
        item.setUpdatedBy(actor.getId());
        reviewRepository.save(item);

        log.info("Match APPROVED: project={} portal={} price={} by {}",
                item.getProjectId(), item.getPortalName(),
                item.getCandidatePriceInr(), actor.getEmail());

        return item;
    }

    @Transactional
    public MatchReviewItem rejectMatch(UUID reviewItemId, SecurityUser actor) {
        MatchReviewItem item = reviewRepository.findById(reviewItemId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_ITEM_NOT_FOUND));

        if (!"PENDING".equals(item.getStatus())) {
            throw new AppException(ErrorCode.CONFLICT, "Review item is already " + item.getStatus());
        }

        item.setStatus("REJECTED");
        item.setReviewedBy(actor.getId());
        item.setUpdatedBy(actor.getId());
        reviewRepository.save(item);

        log.info("Match REJECTED: project={} portal={} by {}",
                item.getProjectId(), item.getPortalName(), actor.getEmail());

        return item;
    }

    @Transactional
    public void bulkDecide(java.util.List<UUID> reviewItemIds, String decision, SecurityUser actor) {
        for (UUID id : reviewItemIds) {
            try {
                if ("APPROVE".equals(decision)) {
                    approveMatch(id, actor);
                } else {
                    rejectMatch(id, actor);
                }
            } catch (Exception ex) {
                log.warn("Bulk decision failed for item {}: {}", id, ex.getMessage());
            }
        }
    }

    // ===== Private helpers =====

    private void upsertPortalPricing(UUID projectId, String portalName, BigDecimal price) {
        String fieldName = switch (portalName) {
            case "99acres"     -> "acres99_price_inr";
            case "magicbricks" -> "magicbricks_price_inr";
            case "squareyards" -> "squareyards_price_inr";
            case "gujrera"     -> "gujrera_price_inr";
            default            -> throw new AppException(ErrorCode.VALIDATION_ERROR,
                                        "Unknown portal: " + portalName);
        };

        pricingRepository.upsertPortalPrice(projectId, fieldName, price);
        log.debug("Upserted {} = {} for project {}", fieldName, price, projectId);
    }
}
