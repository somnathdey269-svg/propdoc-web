-- ==============================================================================
-- ENTERPRISE DATA ACQUISITION PLATFORM — SCHEMA MIGRATION V2
-- Extends existing schema.sql (non-breaking additions only)
-- All existing tables, data, and RLS policies are preserved.
-- ==============================================================================

-- ============================================================
-- 1. PLATFORM USERS (Identity Service — Supabase Auth bridge)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.platform_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supabase_user_id UUID UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    avatar_url TEXT,
    platform_role VARCHAR(50) NOT NULL DEFAULT 'VIEWER',
    -- Roles: SUPER_ADMIN, ORG_ADMIN, TEAM_LEAD, BUILDER, VIEWER
    org_id UUID,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    locked_reason TEXT,
    last_login_at TIMESTAMPTZ,
    login_count INTEGER DEFAULT 0,
    -- Audit columns
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by UUID,
    version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_platform_users_supabase_id ON public.platform_users(supabase_user_id);
CREATE INDEX IF NOT EXISTS idx_platform_users_email ON public.platform_users(email);
CREATE INDEX IF NOT EXISTS idx_platform_users_role ON public.platform_users(platform_role);

-- Bootstrap super admin (matches existing RLS policies)
INSERT INTO public.platform_users (supabase_user_id, email, platform_role)
SELECT id, email, 'SUPER_ADMIN'
FROM auth.users
WHERE email = 'somnathdey269@gmail.com'
ON CONFLICT (supabase_user_id) DO UPDATE SET platform_role = 'SUPER_ADMIN';

-- ============================================================
-- 2. EXTEND scraper_configs (non-breaking ADD COLUMN IF NOT EXISTS)
-- ============================================================
ALTER TABLE public.scraper_configs
    ADD COLUMN IF NOT EXISTS base_url TEXT,
    ADD COLUMN IF NOT EXISTS auth_type VARCHAR(20) DEFAULT 'NONE',
    -- auth_type: NONE, COOKIE, LOGIN_FORM, BEARER_TOKEN
    ADD COLUMN IF NOT EXISTS rate_limit_ms INTEGER DEFAULT 500,
    ADD COLUMN IF NOT EXISTS max_pages INTEGER DEFAULT 50,
    ADD COLUMN IF NOT EXISTS max_retries INTEGER DEFAULT 3,
    ADD COLUMN IF NOT EXISTS timeout_ms INTEGER DEFAULT 30000,
    ADD COLUMN IF NOT EXISTS requires_browser BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS browser_type VARCHAR(20) DEFAULT 'chromium',
    ADD COLUMN IF NOT EXISTS proxy_required BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS user_agent_override TEXT,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS created_by UUID,
    ADD COLUMN IF NOT EXISTS updated_by UUID,
    ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS deleted_by UUID,
    ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- Backfill base_url from existing search_url_template
UPDATE public.scraper_configs
SET base_url = CASE
    WHEN portal_name = 'gujrera'     THEN 'https://gujrera.gujarat.gov.in'
    WHEN portal_name = '99acres'     THEN 'https://www.99acres.com'
    WHEN portal_name = 'magicbricks' THEN 'https://www.magicbricks.com'
    WHEN portal_name = 'squareyards' THEN 'https://www.squareyards.com'
    ELSE NULL
END
WHERE base_url IS NULL;

-- ============================================================
-- 3. SCRAPER URL STRATEGIES (structured 3-tier URL hierarchy)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.scraper_url_strategies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_id UUID REFERENCES public.scraper_configs(id) ON DELETE CASCADE,

    -- TIER 1: Entry point
    entry_url TEXT NOT NULL,
    entry_method VARCHAR(10) DEFAULT 'GET',

    -- TIER 2: Pagination
    pagination_type VARCHAR(30),
    -- URL_PATTERN, NEXT_BUTTON, INFINITE_SCROLL, LOAD_MORE, NONE
    pagination_url_pattern TEXT,
    pagination_start INTEGER DEFAULT 1,
    pagination_max INTEGER DEFAULT 50,
    next_button_selector TEXT,
    load_more_selector TEXT,

    -- TIER 3: Detail pages
    has_detail_pages BOOLEAN DEFAULT FALSE,
    detail_url_pattern TEXT,
    detail_link_selector TEXT,
    detail_link_attribute VARCHAR(50) DEFAULT 'href',

    -- Sub-tabs
    has_sub_tabs BOOLEAN DEFAULT FALSE,
    tab_selectors JSONB,
    -- Format: [{label, selector, waitSelector}]

    -- URL variable bindings
    url_variables JSONB,
    -- Format: [{name: "DISTRICT", source: "target_locality"}, {name: "PAGE", source: "auto_increment"}]

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    is_deleted BOOLEAN DEFAULT FALSE,
    version INTEGER DEFAULT 1,

    UNIQUE(config_id)
);

-- Seed URL strategies from existing action pipeline data
INSERT INTO public.scraper_url_strategies (config_id, entry_url, pagination_type, has_detail_pages, detail_url_pattern, has_sub_tabs)
SELECT
    sc.id,
    CASE sc.portal_name
        WHEN 'gujrera'     THEN 'https://gujrera.gujarat.gov.in/#/home-p/registered-project-listing'
        WHEN '99acres'     THEN 'https://www.99acres.com/api/v2/search/property/in/{CITY}'
        WHEN 'magicbricks' THEN 'https://www.magicbricks.com/new-projects-in-{CITY}'
        WHEN 'squareyards' THEN 'https://www.squareyards.com/new-projects-in-{CITY}'
    END AS entry_url,
    CASE sc.portal_name
        WHEN 'gujrera' THEN 'NEXT_BUTTON'
        ELSE 'URL_PATTERN'
    END AS pagination_type,
    CASE sc.portal_name
        WHEN 'gujrera' THEN TRUE
        ELSE FALSE
    END AS has_detail_pages,
    CASE sc.portal_name
        WHEN 'gujrera' THEN '/#/project-preview?id={ID}'
        ELSE NULL
    END AS detail_url_pattern,
    CASE sc.portal_name WHEN 'gujrera' THEN TRUE ELSE FALSE END AS has_sub_tabs
FROM public.scraper_configs sc
WHERE NOT EXISTS (
    SELECT 1 FROM public.scraper_url_strategies sus WHERE sus.config_id = sc.id
);

-- ============================================================
-- 4. SCRAPER FIELD SELECTORS (structured field extraction config)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.scraper_field_selectors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_id UUID REFERENCES public.scraper_configs(id) ON DELETE CASCADE,
    extraction_context VARCHAR(50) DEFAULT 'LISTING_CARD',
    -- Contexts: LISTING_CARD, DETAIL_PAGE, TAB_1, TAB_2, TAB_3, TAB_4
    field_name VARCHAR(100) NOT NULL,
    maps_to_column VARCHAR(100),
    primary_selector TEXT,
    fallback_selector TEXT,
    selector_type VARCHAR(20) DEFAULT 'CSS',
    -- Types: CSS, XPATH, REGEX, JSON_LD, ATTRIBUTE
    extract_attribute VARCHAR(50),
    data_type VARCHAR(30) DEFAULT 'TEXT',
    -- Types: TEXT, PRICE_INR, DATE, URL, NUMBER, BOOLEAN
    transform_rule VARCHAR(100),
    -- Rules: PARSE_PRICE_INR, TRIM, UPPERCASE, EXTRACT_RERA_ID, PARSE_DATE_DMY
    is_required BOOLEAN DEFAULT FALSE,
    is_primary_key BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    is_deleted BOOLEAN DEFAULT FALSE,
    version INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_field_selectors_config_context
    ON public.scraper_field_selectors(config_id, extraction_context);

-- Seed GujRERA field selectors from existing primary_selectors JSONB
INSERT INTO public.scraper_field_selectors
    (config_id, extraction_context, field_name, maps_to_column, primary_selector, selector_type, is_required, is_primary_key, display_order)
SELECT
    sc.id,
    'LISTING_CARD',
    unnested.field_name,
    unnested.maps_to,
    unnested.selector,
    'CSS',
    unnested.required,
    unnested.is_pk,
    unnested.ord
FROM public.scraper_configs sc,
LATERAL (VALUES
    ('rera_no',       'projects.rera_id',       'td:nth-child(1)', TRUE,  TRUE,  1),
    ('project_name',  'projects.name',           'td:nth-child(2)', TRUE,  FALSE, 2),
    ('promoter',      'projects.developer',      'td:nth-child(3)', FALSE, FALSE, 3)
) AS unnested(field_name, maps_to, selector, required, is_pk, ord)
WHERE sc.portal_name = 'gujrera'
AND NOT EXISTS (
    SELECT 1 FROM public.scraper_field_selectors sfs WHERE sfs.config_id = sc.id
);

-- ============================================================
-- 5. SCRAPER SCHEDULES (Quartz scheduler persistence)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.scraper_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portal_name VARCHAR(100) NOT NULL,
    schedule_name VARCHAR(255) NOT NULL,
    cron_expression VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_triggered_at TIMESTAMPTZ,
    next_trigger_at TIMESTAMPTZ,
    last_job_id UUID,
    trigger_count INTEGER DEFAULT 0,
    quartz_job_key VARCHAR(255),
    execution_options JSONB,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    is_deleted BOOLEAN DEFAULT FALSE,
    version INTEGER DEFAULT 1
);

-- Seed default schedule from scraper_jobs.scheduled_cron
INSERT INTO public.scraper_schedules (portal_name, schedule_name, cron_expression, execution_options)
SELECT
    portal_name,
    portal_name || ' Default Schedule',
    COALESCE(scheduled_cron, '0 2 * * 0'),
    '{"scrapeMode": "FULL", "maxPages": 50}'::jsonb
FROM public.scraper_jobs
WHERE scheduled_cron IS NOT NULL
GROUP BY portal_name, scheduled_cron
ON CONFLICT DO NOTHING;

-- ============================================================
-- 6. EXECUTION ENGINE — extend scraper_jobs (non-breaking)
-- ============================================================
ALTER TABLE public.scraper_jobs
    ADD COLUMN IF NOT EXISTS scrape_mode VARCHAR(20) DEFAULT 'FULL',
    ADD COLUMN IF NOT EXISTS matched_items INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS review_queued_items INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS failed_items INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS duration_ms BIGINT,
    ADD COLUMN IF NOT EXISTS worker_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS triggered_by UUID,
    ADD COLUMN IF NOT EXISTS execution_options JSONB,
    ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- ============================================================
-- 7. AUDIT LOG (immutable, append-only)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    actor_user_id UUID,
    actor_email VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    service_name VARCHAR(100),
    trace_id VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    -- NOTE: No UPDATE or DELETE allowed on this table by policy
);

CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON public.audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON public.audit_log(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON public.audit_log(created_at DESC);

-- ============================================================
-- 8. RLS POLICIES FOR NEW TABLES
-- ============================================================
ALTER TABLE public.platform_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scraper_url_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scraper_field_selectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scraper_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Service role (Spring Boot backend) has full access to all tables
CREATE POLICY "service_role_platform_users" ON public.platform_users
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_url_strategies" ON public.scraper_url_strategies
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_field_selectors" ON public.scraper_field_selectors
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_schedules" ON public.scraper_schedules
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_audit_log" ON public.audit_log
    FOR ALL USING (auth.role() = 'service_role');

-- Super admin has direct access (backward compatibility with existing email-based policy)
CREATE POLICY "superadmin_platform_users" ON public.platform_users
    FOR ALL USING (
        auth.role() = 'service_role'
        OR (auth.jwt() ->> 'email') = 'somnathdey269@gmail.com'
    );
