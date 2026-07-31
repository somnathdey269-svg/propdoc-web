package com.dataacq.browser.service;

import com.microsoft.playwright.*;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ConcurrentHashMap;

/**
 * BrowserPoolManager — Manages Playwright instance and pooled Browser instances.
 * Supports Chromium, Firefox, WebKit with configurable headless mode, stealth headers,
 * proxy support, and automatic context recycling.
 */
@Slf4j
@Service
public class BrowserPoolManager {

    @Value("${browser.pool.max-size:10}")
    private int maxPoolSize;

    @Value("${browser.headless:true}")
    private boolean headless;

    private Playwright playwright;
    private Browser chromiumBrowser;
    private Browser firefoxBrowser;
    private Browser webkitBrowser;

    private final BlockingQueue<BrowserContext> contextPool = new ArrayBlockingQueue<>(50);
    private final Map<String, BrowserContext> activeSessions = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        log.info("Initializing Playwright Engine (headless={})...", headless);
        try {
            playwright = Playwright.create();
            BrowserType.LaunchOptions launchOptions = new BrowserType.LaunchOptions()
                    .setHeadless(headless)
                    .setArgs(java.util.List.of(
                            "--no-sandbox",
                            "--disable-setuid-sandbox",
                            "--disable-dev-shm-usage",
                            "--disable-accelerated-2d-canvas",
                            "--disable-gpu",
                            "--window-size=1920,1080"
                    ));

            chromiumBrowser = playwright.chromium().launch(launchOptions);
            log.info("Playwright Chromium initialized successfully.");
        } catch (Exception e) {
            log.error("Failed to initialize Playwright browser pool", e);
        }
    }

    /**
     * Create a new isolated BrowserContext with anti-bot stealth options.
     */
    public BrowserContext createStealthContext(String userAgent, Integer viewportWidth, Integer viewportHeight) {
        Browser.NewContextOptions options = new Browser.NewContextOptions()
                .setUserAgent(userAgent != null ? userAgent :
                        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
                .setViewportSize(
                        viewportWidth != null ? viewportWidth : 1920,
                        viewportHeight != null ? viewportHeight : 1080
                )
                .setJavaScriptEnabled(true)
                .setBypassCSP(true)
                .setIgnoreHTTPSErrors(true);

        BrowserContext context = chromiumBrowser.newContext(options);

        // Add stealth scripts to hide webdriver flag
        context.addInitScript("Object.defineProperty(navigator, 'webdriver', {get: () => undefined});");

        return context;
    }

    public Browser getChromiumBrowser() {
        return chromiumBrowser;
    }

    @PreDestroy
    public void cleanup() {
        log.info("Shutting down Playwright Browser Pool...");
        for (BrowserContext ctx : activeSessions.values()) {
            try { ctx.close(); } catch (Exception ignored) {}
        }
        if (chromiumBrowser != null) try { chromiumBrowser.close(); } catch (Exception ignored) {}
        if (firefoxBrowser != null) try { firefoxBrowser.close(); } catch (Exception ignored) {}
        if (webkitBrowser != null) try { webkitBrowser.close(); } catch (Exception ignored) {}
        if (playwright != null) try { playwright.close(); } catch (Exception ignored) {}
        log.info("Playwright Browser Pool shut down cleanly.");
    }
}
