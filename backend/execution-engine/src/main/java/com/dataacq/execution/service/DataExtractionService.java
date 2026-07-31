package com.dataacq.execution.service;

import com.dataacq.pipeline.service.MatchingService;
import com.dataacq.scraper.config.domain.FieldSelector;
import com.microsoft.playwright.ElementHandle;
import com.microsoft.playwright.Page;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * DataExtractionService — Declarative Playwright DOM extraction engine.
 *
 * Given a Playwright Page or ElementHandle and a list of FieldSelector definitions,
 * extracts field values using CSS, XPath, Attribute, Regex, or JSON-LD,
 * and transforms them into cleaned, typed values (TEXT, PRICE_INR, RERA_ID, DATE, etc.).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DataExtractionService {

    private final MatchingService matchingService;

    /**
     * Extract fields from a single container element (e.g. listing card in Pass 1).
     */
    public Map<String, Object> extractFromElement(ElementHandle element, List<FieldSelector> selectors) {
        Map<String, Object> result = new HashMap<>();

        for (FieldSelector selector : selectors) {
            try {
                String rawValue = extractRawValue(element, selector);
                Object transformedValue = applyTransform(rawValue, selector);
                result.put(selector.getFieldName(), transformedValue);
            } catch (Exception e) {
                log.warn("Failed to extract field '{}' from element: {}", selector.getFieldName(), e.getMessage());
                result.put(selector.getFieldName(), null);
            }
        }

        return result;
    }

    /**
     * Extract fields from an entire page (e.g. Detail Page in Pass 2).
     */
    public Map<String, Object> extractFromPage(Page page, List<FieldSelector> selectors) {
        Map<String, Object> result = new HashMap<>();

        for (FieldSelector selector : selectors) {
            try {
                String rawValue = extractRawValueFromPage(page, selector);
                Object transformedValue = applyTransform(rawValue, selector);
                result.put(selector.getFieldName(), transformedValue);
            } catch (Exception e) {
                log.warn("Failed to extract field '{}' from page: {}", selector.getFieldName(), e.getMessage());
                result.put(selector.getFieldName(), null);
            }
        }

        return result;
    }

    // ===== Raw Extraction Logic =====

    private String extractRawValue(ElementHandle container, FieldSelector selector) {
        String selType = selector.getSelectorType() != null ? selector.getSelectorType().toUpperCase() : "CSS";
        String cssOrXpath = selector.getPrimarySelector();

        if (cssOrXpath == null || cssOrXpath.isBlank()) {
            return null;
        }

        ElementHandle targetElement = null;

        if ("XPATH".equals(selType)) {
            List<ElementHandle> matches = container.querySelectorAll("xpath=" + cssOrXpath);
            if (!matches.isEmpty()) targetElement = matches.get(0);
        } else {
            targetElement = container.querySelector(cssOrXpath);
        }

        // Try fallback selector if primary returned null
        if (targetElement == null && selector.getFallbackSelector() != null && !selector.getFallbackSelector().isBlank()) {
            targetElement = container.querySelector(selector.getFallbackSelector());
        }

        if (targetElement == null) {
            return null;
        }

        if (selector.getExtractAttribute() != null && !selector.getExtractAttribute().isBlank()) {
            return targetElement.getAttribute(selector.getExtractAttribute());
        }

        return targetElement.innerText();
    }

    private String extractRawValueFromPage(Page page, FieldSelector selector) {
        String selType = selector.getSelectorType() != null ? selector.getSelectorType().toUpperCase() : "CSS";
        String primary = selector.getPrimarySelector();

        if (primary == null || primary.isBlank()) {
            return null;
        }

        if ("JSON_LD".equals(selType)) {
            // Extract from script[type="application/ld+json"]
            List<String> scripts = page.locator("script[type=\"application/ld+json\"]").allInnerTexts();
            for (String json : scripts) {
                if (json.contains(selector.getFieldName())) {
                    return json; // Or parse JSON
                }
            }
            return null;
        }

        ElementHandle targetElement = null;
        if ("XPATH".equals(selType)) {
            List<ElementHandle> matches = page.querySelectorAll("xpath=" + primary);
            if (!matches.isEmpty()) targetElement = matches.get(0);
        } else {
            List<ElementHandle> matches = page.querySelectorAll(primary);
            if (!matches.isEmpty()) targetElement = matches.get(0);
        }

        if (targetElement == null && selector.getFallbackSelector() != null) {
            List<ElementHandle> matches = page.querySelectorAll(selector.getFallbackSelector());
            if (!matches.isEmpty()) targetElement = matches.get(0);
        }

        if (targetElement == null) return null;

        if (selector.getExtractAttribute() != null && !selector.getExtractAttribute().isBlank()) {
            return targetElement.getAttribute(selector.getExtractAttribute());
        }

        return targetElement.innerText();
    }

    // ===== Transformation Logic =====

    private Object applyTransform(String rawValue, FieldSelector selector) {
        if (rawValue == null || rawValue.isBlank()) return null;

        String rule = selector.getTransformRule() != null ? selector.getTransformRule().toUpperCase() : "";
        String dataType = selector.getDataType() != null ? selector.getDataType().toUpperCase() : "TEXT";

        String text = rawValue.trim();

        if ("TRIM".equals(rule)) text = text.trim();
        if ("UPPERCASE".equals(rule)) text = text.toUpperCase();

        if ("PRICE_INR".equals(dataType) || "PARSE_PRICE_INR".equals(rule)) {
            return matchingService.parsePriceToINR(text);
        }

        if ("EXTRACT_RERA_ID".equals(rule)) {
            return matchingService.extractReraId(text);
        }

        if ("NUMBER".equals(dataType)) {
            try {
                return Double.parseDouble(text.replaceAll("[^0-9.]", ""));
            } catch (Exception e) {
                return null;
            }
        }

        if ("BOOLEAN".equals(dataType)) {
            return "true".equalsIgnoreCase(text) || "yes".equalsIgnoreCase(text) || "1".equals(text);
        }

        return text;
    }
}
