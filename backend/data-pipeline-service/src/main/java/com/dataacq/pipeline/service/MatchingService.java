package com.dataacq.pipeline.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * MatchingService — Java port of calculateFuzzyMatchScore() and parsePriceToINR()
 * from the original scraperEngine.ts.
 *
 * IMPORTANT: This is 100% deterministic. No AI, no ML, no probabilistic matching.
 * Algorithm: Weighted Jaccard Token Similarity + Locality Bonus.
 *
 * Score range: 0 to 100
 * ≥ 85 → AUTO_MATCHED (or if RERA ID matches → always AUTO_MATCHED)
 * 60–84 → REVIEW_QUEUED
 * < 60  → NO_MATCH
 */
@Slf4j
@Service
public class MatchingService {

    private static final int AUTO_MATCH_THRESHOLD = 85;
    private static final int REVIEW_THRESHOLD = 60;

    private static final Set<String> NOISE_WORDS = new HashSet<>(Arrays.asList(
            "pvt", "ltd", "group", "realties", "residency", "residencies",
            "heights", "sky", "developer", "builders", "construction",
            "infrastructure", "projects", "india", "limited"
    ));

    private static final Pattern CR_PATTERN  = Pattern.compile("([0-9.]+)\\s*(cr|crore)", Pattern.CASE_INSENSITIVE);
    private static final Pattern LAC_PATTERN = Pattern.compile("([0-9.]+)\\s*(lakh|lacs|lac|l)", Pattern.CASE_INSENSITIVE);
    private static final Pattern RAW_PATTERN = Pattern.compile("[0-9.]+");
    private static final Pattern RERA_PATTERN = Pattern.compile("PR/GJ/[A-Z0-9/]+");

    /**
     * Exact port of calculateFuzzyMatchScore() from scraperEngine.ts.
     *
     * @param str1      Master project name (from projects table)
     * @param str2      Candidate name from portal
     * @param locality1 Master project locality
     * @param locality2 Candidate locality from portal
     * @return Match score 0–100
     */
    public int calculateMatchScore(String str1, String str2, String locality1, String locality2) {
        String norm1 = normalize(str1);
        String norm2 = normalize(str2);

        if (norm1.equals(norm2)) return 100;

        // Jaccard token similarity
        Set<String> tokens1 = tokenize(norm1);
        Set<String> tokens2 = tokenize(norm2);

        Set<String> intersection = new HashSet<>(tokens1);
        intersection.retainAll(tokens2);

        Set<String> union = new HashSet<>(tokens1);
        union.addAll(tokens2);

        double jaccardScore = union.isEmpty() ? 0.0 : (double) intersection.size() / union.size() * 100.0;

        // Locality bonus (+15 if localities match)
        int localityBonus = 0;
        if (locality1 != null && locality2 != null
                && locality1.toLowerCase().contains(locality2.toLowerCase())) {
            localityBonus = 15;
        }

        int score = (int) Math.min(100, Math.round(jaccardScore * 0.85 + localityBonus));
        log.debug("Match score: '{}' vs '{}' = {} (jaccard={}, locality={})",
                str1, str2, score, jaccardScore, localityBonus);
        return score;
    }

    /**
     * RERA-based matching — if RERA IDs match, it's always AUTO_MATCH (100).
     * RERA is a government-assigned unique identifier — deterministic.
     */
    public MatchResult matchProjects(String masterName, String masterRera, String masterLocality,
                                      String candidateName, String candidateRera, String candidateLocality) {
        // RERA match takes priority — deterministic
        if (masterRera != null && candidateRera != null
                && masterRera.trim().equalsIgnoreCase(candidateRera.trim())) {
            return new MatchResult(100, MatchStatus.AUTO_MATCHED, "RERA_ID_EXACT");
        }

        int score = calculateMatchScore(masterName, candidateName, masterLocality, candidateLocality);

        MatchStatus status;
        String reason;

        if (score >= AUTO_MATCH_THRESHOLD) {
            status = MatchStatus.AUTO_MATCHED;
            reason = "TOKEN_SCORE_" + score;
        } else if (score >= REVIEW_THRESHOLD) {
            status = MatchStatus.REVIEW_QUEUED;
            reason = "LOW_CONFIDENCE_" + score;
        } else {
            status = MatchStatus.NO_MATCH;
            reason = "SCORE_TOO_LOW_" + score;
        }

        return new MatchResult(score, status, reason);
    }

    /**
     * Exact port of parsePriceToINR() from scraperEngine.ts.
     * Converts Indian price strings to raw INR numeric values.
     *
     * Examples:
     *   "₹ 75.5 Lacs" → 7550000
     *   "1.5 Cr"       → 15000000
     *   "₹45,00,000"   → 4500000
     */
    public BigDecimal parsePriceToINR(String priceStr) {
        if (priceStr == null || priceStr.isBlank()) return null;

        String clean = priceStr.toLowerCase()
                .replace(",", "")
                .replace("₹", "")
                .replace("inr", "")
                .trim();

        Matcher crMatcher = CR_PATTERN.matcher(clean);
        if (crMatcher.find()) {
            double val = Double.parseDouble(crMatcher.group(1));
            return BigDecimal.valueOf(val * 10_000_000);
        }

        Matcher lacMatcher = LAC_PATTERN.matcher(clean);
        if (lacMatcher.find()) {
            double val = Double.parseDouble(lacMatcher.group(1));
            return BigDecimal.valueOf(val * 100_000);
        }

        Matcher rawMatcher = RAW_PATTERN.matcher(clean);
        if (rawMatcher.find()) {
            String numStr = rawMatcher.group();
            try {
                return new BigDecimal(numStr);
            } catch (NumberFormatException e) {
                return null;
            }
        }

        return null;
    }

    /**
     * Extract RERA ID from raw text using deterministic regex.
     * Pattern: PR/GJ/[A-Z0-9/]+ (Gujarat RERA format)
     */
    public String extractReraId(String rawText) {
        if (rawText == null) return null;
        Matcher m = RERA_PATTERN.matcher(rawText);
        return m.find() ? m.group() : null;
    }

    // ===== Private helpers =====

    private String normalize(String s) {
        if (s == null) return "";
        return s.toLowerCase()
                .replaceAll("[^a-z0-9\\s]", "")
                .trim();
    }

    private Set<String> tokenize(String s) {
        Set<String> tokens = new HashSet<>();
        for (String token : s.split("\\s+")) {
            if (!token.isBlank() && !NOISE_WORDS.contains(token)) {
                tokens.add(token);
            }
        }
        return tokens;
    }

    // ===== Result types =====

    public record MatchResult(int score, MatchStatus status, String reason) {}

    public enum MatchStatus {
        AUTO_MATCHED,   // ≥ 85 or RERA exact match → upsert to portal_pricing
        REVIEW_QUEUED,  // 60–84 → added to match_review_queue
        NO_MATCH        // < 60 → discarded
    }
}
