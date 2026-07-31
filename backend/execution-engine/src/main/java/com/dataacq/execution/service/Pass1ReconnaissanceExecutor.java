package com.dataacq.execution.service;

import com.dataacq.browser.service.BrowserPoolManager;
import com.dataacq.execution.domain.ScraperJob;
import com.dataacq.scraper.config.domain.FieldSelector;
import com.dataacq.scraper.config.domain.ScraperPortal;
import com.dataacq.scraper.config.domain.UrlStrategy;
import com.dataacq.scraper.config.repository.FieldSelectorRepository;
import com.dataacq.scraper.config.repository.ScraperPortalRepository;
import com.dataacq.scraper.config.repository.UrlStrategyRepository;
import com.microsoft.playwright.BrowserContext;
import com.microsoft.playwright.ElementHandle;
import com.microsoft.playwright.Page;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Pass1ReconnaissanceExecutor — Phase 2 Pass 1 Execution Engine.
 *
 * Discovers listing records across index pages, navigates pagination,
 * extracts card summary data, and stages discovered items for Pass 2.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class Pass1ReconnaissanceExecutor {

    private final BrowserPoolManager browserPoolManager;
    private final ScraperPortalRepository portalRepository;
    private final UrlStrategyRepository urlStrategyRepository;
    private final FieldSelectorRepository fieldSelectorRepository;
    private final DataExtractionService dataExtractionService;

    @FunctionalInterface
    public interface LogConsumer {
        void log(UUID jobId, String level, String message);
    }

    @FunctionalInterface
    public interface ProgressConsumer {
        void update(UUID jobId, int total, int processed, int matched, int reviewQueued);
    }

    public List<Map<String, Object>> execute(
            ScraperJob job,
            AtomicBoolean cancelSignal,
            LogConsumer logger,
            ProgressConsumer progressTracker) {

        List<Map<String, Object>> discoveredItems = new ArrayList<>();

        Optional<ScraperPortal> portalOpt = portalRepository.findByPortalName(job.getPortalName());
        if (portalOpt.isEmpty()) {
            logger.log(job.getId(), "ERROR", "Portal config not found for: " + job.getPortalName());
            return discoveredItems;
        }

        ScraperPortal portal = portalOpt.get();
        Optional<UrlStrategy> strategyOpt = urlStrategyRepository.findByPortalId(portal.getId());
        List<FieldSelector> selectors = fieldSelectorRepository.findByPortalIdAndExtractionContext(
                portal.getId(), "LISTING_CARD");

        if (selectors.isEmpty()) {
            // Fallback: load all selectors if LISTING_CARD context is not specifically assigned
            selectors = fieldSelectorRepository.findByPortalIdOrderByDisplayOrderAsc(portal.getId());
        }

        UrlStrategy strategy = strategyOpt.orElse(null);
        String entryUrl = (strategy != null && strategy.getEntryUrl() != null)
                ? strategy.getEntryUrl()
                : portal.getBaseUrl();

        logger.log(job.getId(), "INFO", "Pass 1: Navigating entry point -> " + entryUrl);

        BrowserContext context = null;
        try {
            context = browserPoolManager.createStealthContext(portal.getUserAgentOverride(), 1920, 1080);
            Page page = context.newPage();

            // Set rate limit delay
            int delayMs = portal.getRateLimitMs() != null ? portal.getRateLimitMs() : 1000;
            int maxPages = portal.getMaxPages() != null ? portal.getMaxPages() : 10;

            page.navigate(entryUrl, new Page.NavigateOptions().setTimeout(portal.getTimeoutMs()));
            logger.log(job.getId(), "INFO", "Page loaded successfully: " + page.title());

            int currentPage = 1;

            while (currentPage <= maxPages && !cancelSignal.get()) {
                logger.log(job.getId(), "INFO", "Processing Page " + currentPage + "/" + maxPages);

                // Find listing cards
                List<ElementHandle> cards = page.querySelectorAll(".project-card, .listing-card, tr, .card-item, div[class*='card']");

                if (cards.isEmpty()) {
                    logger.log(job.getId(), "WARN", "No listing cards found on page " + currentPage);
                } else {
                    logger.log(job.getId(), "INFO", "Found " + cards.size() + " cards on page " + currentPage);
                }

                for (ElementHandle card : cards) {
                    if (cancelSignal.get()) break;

                    Map<String, Object> itemData = dataExtractionService.extractFromElement(card, selectors);
                    if (!itemData.isEmpty()) {
                        discoveredItems.add(itemData);
                    }
                }

                progressTracker.update(job.getId(), discoveredItems.size(), discoveredItems.size(), 0, 0);

                // Check pagination
                if (strategy != null && "NEXT_BUTTON".equals(strategy.getPaginationType())
                        && strategy.getNextButtonSelector() != null) {

                    ElementHandle nextBtn = page.querySelector(strategy.getNextButtonSelector());
                    if (nextBtn != null && nextBtn.isEnabled()) {
                        logger.log(job.getId(), "INFO", "Clicking next page button...");
                        nextBtn.click();
                        page.waitForTimeout(delayMs);
                        currentPage++;
                    } else {
                        logger.log(job.getId(), "INFO", "No further pages available.");
                        break;
                    }
                } else if (strategy != null && "URL_PATTERN".equals(strategy.getPaginationType())
                        && strategy.getPaginationUrlPattern() != null) {

                    currentPage++;
                    String nextPageUrl = strategy.getPaginationUrlPattern().replace("{PAGE}", String.valueOf(currentPage));
                    page.navigate(nextPageUrl);
                    page.waitForTimeout(delayMs);
                } else {
                    // Single page
                    break;
                }
            }

            logger.log(job.getId(), "SUCCESS", "Pass 1 Complete. Discovered " + discoveredItems.size() + " items.");

        } catch (Exception e) {
            log.error("Pass 1 execution error for job {}", job.getId(), e);
            logger.log(job.getId(), "ERROR", "Pass 1 failed: " + e.getMessage());
        } finally {
            if (context != null) {
                try { context.close(); } catch (Exception ignored) {}
            }
        }

        return discoveredItems;
    }
}
