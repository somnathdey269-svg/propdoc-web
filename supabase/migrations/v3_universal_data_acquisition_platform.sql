-- ==============================================================================
-- UNIVERSAL DETERMINISTIC DATA ACQUISITION PLATFORM (UD-DAP)
-- SCHEMA MIGRATION V3 (Non-Breaking Additions & Extensions)
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. REUSABLE PROFILES (Browser, Auth, Rate Limits)
CREATE TABLE IF NOT EXISTS public.browser_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_name VARCHAR(100) UNIQUE NOT NULL,
    viewport_width INTEGER DEFAULT 1920,
    viewport_height INTEGER DEFAULT 1080,
    user_agent_override TEXT,
    is_headless BOOLEAN DEFAULT TRUE,
    proxy_policy JSONB DEFAULT '{"use_proxy": false}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.auth_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_name VARCHAR(100) UNIQUE NOT NULL,
    auth_type VARCHAR(50) NOT NULL DEFAULT 'ANONYMOUS', -- ANONYMOUS, FORM_LOGIN, COOKIE_VAULT, OAUTH2, BEARER_TOKEN
    credentials_vault JSONB, -- Encrypted credentials or token endpoints
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rate_limit_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_name VARCHAR(100) UNIQUE NOT NULL,
    rate_limit_ms INTEGER DEFAULT 1000,
    max_concurrent_pages INTEGER DEFAULT 5,
    max_retries INTEGER DEFAULT 3,
    timeout_ms INTEGER DEFAULT 45000,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Default Profiles
INSERT INTO public.browser_profiles (profile_name, viewport_width, viewport_height, is_headless)
VALUES ('DESKTOP_STEALTH', 1920, 1080, true), ('MOBILE_RESPONSIVE', 390, 844, true)
ON CONFLICT (profile_name) DO NOTHING;

INSERT INTO public.auth_profiles (profile_name, auth_type)
VALUES ('PUBLIC_ANONYMOUS', 'ANONYMOUS')
ON CONFLICT (profile_name) DO NOTHING;

INSERT INTO public.rate_limit_profiles (profile_name, rate_limit_ms, max_concurrent_pages)
VALUES ('BALANCED_DEFAULT', 500, 5), ('CONSERVATIVE_GOVT', 2000, 2), ('AGGRESSIVE_FAST', 100, 10)
ON CONFLICT (profile_name) DO NOTHING;

-- 2. ACQUISITION TARGETS (Extends existing scraper_configs)
CREATE TABLE IF NOT EXISTS public.acquisition_targets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    industry_category VARCHAR(100) NOT NULL DEFAULT 'Real Estate', -- Real Estate, E-Commerce, Banking, Govt, etc.
    base_url TEXT NOT NULL,
    browser_profile_id UUID REFERENCES public.browser_profiles(id),
    auth_profile_id UUID REFERENCES public.auth_profiles(id),
    rate_limit_profile_id UUID REFERENCES public.rate_limit_profiles(id),
    is_active BOOLEAN DEFAULT TRUE,
    lifecycle_state VARCHAR(50) DEFAULT 'PUBLISHED', -- DRAFT, TESTING, DRY_RUN, PUBLISHED, DEPRECATED, ARCHIVED
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backfill acquisition_targets from existing scraper_configs
INSERT INTO public.acquisition_targets (target_name, display_name, base_url, industry_category)
SELECT 
    sc.portal_name,
    sc.display_name,
    COALESCE(sc.base_url, sc.search_url_template, 'https://gujrera.gujarat.gov.in'),
    'Real Estate'
FROM public.scraper_configs sc
ON CONFLICT (target_name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    base_url = EXCLUDED.base_url;

-- 3. DYNAMIC TARGET ENTITIES & FIELDS
CREATE TABLE IF NOT EXISTS public.target_entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_id UUID REFERENCES public.acquisition_targets(id) ON DELETE CASCADE,
    entity_name VARCHAR(100) NOT NULL, -- e.g., "PropertyListing", "EcommerceProduct", "BankTender"
    display_label VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(target_id, entity_name)
);

CREATE TABLE IF NOT EXISTS public.target_entity_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id UUID REFERENCES public.target_entities(id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL,
    display_label VARCHAR(255) NOT NULL,
    data_type VARCHAR(50) DEFAULT 'TEXT', -- TEXT, NUMBER, CURRENCY_INR, DATE_TIME, URL, FILE_BLOB, JSON_OBJECT
    is_primary_key BOOLEAN DEFAULT FALSE,
    is_required BOOLEAN DEFAULT FALSE,
    transformation_pipeline JSONB DEFAULT '[]'::jsonb, -- Array of transformers (TRIM, PARSE_CURRENCY, REGEX)
    validation_rules JSONB DEFAULT '{}'::jsonb, -- Quality rules
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(entity_id, field_name)
);

-- 4. ACQUISITION BLUEPRINTS & COMPILATIONS
CREATE TABLE IF NOT EXISTS public.acquisition_blueprints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_id UUID REFERENCES public.acquisition_targets(id) ON DELETE CASCADE,
    version INTEGER NOT NULL DEFAULT 1,
    lifecycle_stage VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, VALIDATED, COMPILED, PREVIEWED, PUBLISHED, ARCHIVED
    entry_node_key VARCHAR(100) NOT NULL DEFAULT 'ENTRY_PAGE',
    declarative_graph JSONB NOT NULL, -- Raw wizard graph
    compiled_execution_plan JSONB, -- CEP Bytecode emitted by Compiler
    health_score NUMERIC(5,2) DEFAULT 100.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(target_id, version)
);

-- 5. ACQUISITION RUNS & CHECKPOINTS (Extends scraper_jobs)
CREATE TABLE IF NOT EXISTS public.acquisition_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_id UUID REFERENCES public.acquisition_targets(id) ON DELETE CASCADE,
    blueprint_id UUID REFERENCES public.acquisition_blueprints(id),
    run_mode VARCHAR(50) DEFAULT 'FULL', -- FULL, DELTA, SINGLE_ITEM
    status VARCHAR(50) DEFAULT 'QUEUED', -- QUEUED, RUNNING, COMPLETED, FAILED, CANCELLED
    items_extracted INTEGER DEFAULT 0,
    assets_downloaded INTEGER DEFAULT 0,
    quality_score NUMERIC(5,2) DEFAULT 100.00,
    error_summary TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    trace_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.acquisition_run_checkpoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    run_id UUID REFERENCES public.acquisition_runs(id) ON DELETE CASCADE,
    current_node_key VARCHAR(100) NOT NULL,
    navigation_stack_snapshot JSONB NOT NULL,
    processed_item_keys JSONB NOT NULL,
    metrics_snapshot JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. EXTRACTED RECORDS & ASSETS VAULT
CREATE TABLE IF NOT EXISTS public.extracted_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    run_id UUID REFERENCES public.acquisition_runs(id) ON DELETE CASCADE,
    target_id UUID REFERENCES public.acquisition_targets(id) ON DELETE CASCADE,
    entity_id UUID REFERENCES public.target_entities(id),
    blueprint_version INTEGER DEFAULT 1,
    source_url TEXT NOT NULL,
    parent_record_id UUID REFERENCES public.extracted_records(id) ON DELETE SET NULL,
    depth_level INTEGER DEFAULT 0,
    record_hash VARCHAR(64) NOT NULL,
    payload JSONB NOT NULL,
    quality_status VARCHAR(50) DEFAULT 'PASSED', -- PASSED, REVIEW_REQUIRED, REJECTED
    quality_score NUMERIC(5,2) DEFAULT 100.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_extracted_records_hash ON public.extracted_records(target_id, record_hash);
CREATE INDEX IF NOT EXISTS idx_extracted_records_run ON public.extracted_records(run_id);
CREATE INDEX IF NOT EXISTS idx_extracted_records_entity ON public.extracted_records(entity_id);

CREATE TABLE IF NOT EXISTS public.extracted_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    record_id UUID REFERENCES public.extracted_records(id) ON DELETE CASCADE,
    asset_type VARCHAR(50) NOT NULL, -- PDF, IMAGE, CSV, DOCX
    original_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_size_bytes BIGINT,
    mime_type VARCHAR(100),
    sha256_checksum VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. MARKETPLACE & PLUGIN REGISTRY
CREATE TABLE IF NOT EXISTS public.marketplace_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    author VARCHAR(255) NOT NULL,
    package_manifest JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Security Policies for Service Role & Superadmin Access
ALTER TABLE public.browser_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acquisition_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.target_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.target_entity_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acquisition_blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acquisition_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acquisition_run_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extracted_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extracted_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_packages ENABLE ROW LEVEL SECURITY;

-- Allow public reading for targets, profiles, blueprints
CREATE POLICY "Allow public read browser_profiles" ON public.browser_profiles FOR SELECT USING (true);
CREATE POLICY "Allow public read auth_profiles" ON public.auth_profiles FOR SELECT USING (true);
CREATE POLICY "Allow public read rate_limit_profiles" ON public.rate_limit_profiles FOR SELECT USING (true);
CREATE POLICY "Allow public read acquisition_targets" ON public.acquisition_targets FOR SELECT USING (true);
CREATE POLICY "Allow public read target_entities" ON public.target_entities FOR SELECT USING (true);
CREATE POLICY "Allow public read target_entity_fields" ON public.target_entity_fields FOR SELECT USING (true);
CREATE POLICY "Allow public read acquisition_blueprints" ON public.acquisition_blueprints FOR SELECT USING (true);
CREATE POLICY "Allow public read acquisition_runs" ON public.acquisition_runs FOR SELECT USING (true);
CREATE POLICY "Allow public read extracted_records" ON public.extracted_records FOR SELECT USING (true);
CREATE POLICY "Allow public read extracted_assets" ON public.extracted_assets FOR SELECT USING (true);

-- Service role & Super Admin full write access
CREATE POLICY "Superadmin write acquisition_targets" ON public.acquisition_targets FOR ALL USING (
    auth.role() = 'service_role' OR (auth.jwt() ->> 'email') = 'somnathdey269@gmail.com'
);
CREATE POLICY "Superadmin write acquisition_blueprints" ON public.acquisition_blueprints FOR ALL USING (
    auth.role() = 'service_role' OR (auth.jwt() ->> 'email') = 'somnathdey269@gmail.com'
);
CREATE POLICY "Superadmin write acquisition_runs" ON public.acquisition_runs FOR ALL USING (
    auth.role() = 'service_role' OR (auth.jwt() ->> 'email') = 'somnathdey269@gmail.com'
);
CREATE POLICY "Superadmin write extracted_records" ON public.extracted_records FOR ALL USING (
    auth.role() = 'service_role' OR (auth.jwt() ->> 'email') = 'somnathdey269@gmail.com'
);
