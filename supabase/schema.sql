-- ==============================================================================
-- PROPDOC SUPABASE DATABASE SCHEMA MIGRATION SCRIPT
-- Locations: Ahmedabad & Gandhinagar (200+ Localities)
-- Portals: GujRERA, 99acres, SquareYards, MagicBricks, BaankNet
-- ==============================================================================

-- Enable PostGIS / Vector extension if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. LOCALITIES DIRECTORY
CREATE TABLE IF NOT EXISTS public.localities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    city VARCHAR(100) NOT NULL DEFAULT 'Ahmedabad',
    zone VARCHAR(100) NOT NULL DEFAULT 'South & West', -- Gandhinagar, North Ahmedabad, South & West, East Ahmedabad
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    tier VARCHAR(50) NOT NULL DEFAULT 'Mid-Luxury', -- Budget-Mid, Mid-Luxury, Ultra-Luxury, SEZ-Commercial
    avg_price_per_sqft NUMERIC(10, 2) NOT NULL DEFAULT 4500.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. PROPERTY PROJECTS
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    developer VARCHAR(255) NOT NULL,
    locality_name VARCHAR(255) REFERENCES public.localities(name) ON DELETE CASCADE ON UPDATE CASCADE,
    city VARCHAR(100) NOT NULL DEFAULT 'Ahmedabad',
    category VARCHAR(100) NOT NULL DEFAULT 'Residential', -- Residential, Luxury, Villa, Commercial
    price_min_inr NUMERIC(14, 2) NOT NULL,
    price_max_inr NUMERIC(14, 2) NOT NULL,
    price_per_sqft NUMERIC(10, 2) NOT NULL,
    price_per_sqyd NUMERIC(10, 2) NOT NULL,
    valuation_tier VARCHAR(50) DEFAULT 'at-avg', -- below-avg, at-avg, above-avg, bank-auction
    is_bank_auction BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    rera_id VARCHAR(100),
    cover_image TEXT,
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    total_units INT DEFAULT 120,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. MULTI-SOURCE 5-PORTAL PRICING COMPARISON
CREATE TABLE IF NOT EXISTS public.portal_pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    gujrera_price_inr NUMERIC(14, 2),
    acres99_price_inr NUMERIC(14, 2),
    squareyards_price_inr NUMERIC(14, 2),
    magicbricks_price_inr NUMERIC(14, 2),
    baanknet_auction_price_inr NUMERIC(14, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. BUILDER LEADS & INQUIRIES
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    project_name VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_email VARCHAR(255),
    preferred_bhk VARCHAR(50),
    budget_range VARCHAR(100),
    status VARCHAR(50) DEFAULT 'NEW', -- NEW, CONTACTED, SCHEDULED, CLOSED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (Row Level Security) Policies for Public Reading & Secure Writing
ALTER TABLE public.localities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read localities" ON public.localities;
CREATE POLICY "Allow public read localities" ON public.localities FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read projects" ON public.projects;
CREATE POLICY "Allow public read projects" ON public.projects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read portal_pricing" ON public.portal_pricing;
CREATE POLICY "Allow public read portal_pricing" ON public.portal_pricing FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert leads" ON public.leads;
CREATE POLICY "Allow public insert leads" ON public.leads FOR INSERT WITH CHECK (true);

-- 5. DYNAMIC SCRAPER CONFIGURATIONS (Zero-Code Dynamic Selectors & City Scope)
CREATE TABLE IF NOT EXISTS public.scraper_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portal_name VARCHAR(100) UNIQUE NOT NULL, -- gujrera, 99acres, magicbricks, squareyards
    display_name VARCHAR(100) NOT NULL,
    search_url_template TEXT NOT NULL,
    target_cities JSONB DEFAULT '["Ahmedabad", "Gandhinagar"]'::jsonb,
    target_localities JSONB DEFAULT '["Gota", "Bodaldev", "Science City", "Bopal", "Sargasan", "GIFT City"]'::jsonb,
    primary_selectors JSONB NOT NULL,
    fallback_selectors JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. SCRAPER JOBS & SCHEDULER QUEUE
CREATE TABLE IF NOT EXISTS public.scraper_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portal_name VARCHAR(100) NOT NULL,
    job_type VARCHAR(50) DEFAULT 'MANUAL', -- MANUAL, CRON, SINGLE_PROJECT
    status VARCHAR(50) DEFAULT 'QUEUED', -- QUEUED, RUNNING, COMPLETED, FAILED
    scheduled_cron VARCHAR(100) DEFAULT '0 2 * * 0', -- Default Sunday 2 AM
    total_items INT DEFAULT 0,
    updated_items INT DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. SCRAPER EXECUTION LOGS
CREATE TABLE IF NOT EXISTS public.scraper_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES public.scraper_jobs(id) ON DELETE CASCADE,
    level VARCHAR(20) DEFAULT 'INFO', -- INFO, WARN, ERROR, SUCCESS
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. PENDING MATCH REVIEW QUEUE (HUMAN-IN-THE-LOOP APPROVAL)
CREATE TABLE IF NOT EXISTS public.match_review_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    portal_name VARCHAR(100) NOT NULL,
    candidate_name VARCHAR(255) NOT NULL,
    candidate_price_inr NUMERIC(14, 2) NOT NULL,
    candidate_url TEXT,
    confidence_score NUMERIC(5, 2) NOT NULL, -- e.g. 78.50%
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed Default Scraper Configs for GujRERA & 3 Major Listing Portals
INSERT INTO public.scraper_configs (portal_name, display_name, search_url_template, primary_selectors, fallback_selectors)
VALUES 
(
  'gujrera', 
  'GujRERA Regulatory Registry', 
  'https://gujrera.gujarat.gov.in/projectSearch.do',
  '{"table": "#GridView1", "row": "tr.gridRow", "rera_no": "td:nth-child(1)", "project_name": "td:nth-child(2)", "promoter": "td:nth-child(3)"}'::jsonb,
  '{"json_ld": "script[type=\"application/ld+json\"]", "regex_rera": "PR/GJ/[A-Z0-9/]+"}'::jsonb
),
(
  '99acres', 
  '99acres Commercial & Residential', 
  'https://www.99acres.com/api/v2/search/property/in/{city}',
  '{"card": ".projectTuple", "title": ".projectTuple__projectName", "price": ".projectTuple__price", "rera_no": "[data-rera-id]"}'::jsonb,
  '{"api_endpoint": "https://www.99acres.com/api/v2/search/", "json_ld": "script[type=\"application/ld+json\"]"}'::jsonb
),
(
  'magicbricks', 
  'MagicBricks Real Estate', 
  'https://www.magicbricks.com/new-projects-in-{city}',
  '{"card": ".projcard", "title": ".projcard__title", "price": ".projcard__price", "locality": ".projcard__locality"}'::jsonb,
  '{"json_ld": "script[type=\"application/ld+json\"]", "price_regex": "₹\\s*([0-9.]+\\s*(Lakh|Cr|L))"}'::jsonb
),
(
  'squareyards', 
  'SquareYards Marketplace', 
  'https://www.squareyards.com/new-projects-in-{city}',
  '{"card": ".projectCard", "title": ".projectCardTitle", "price": ".projectCardPrice"}'::jsonb,
  '{"json_ld": "script[type=\"application/ld+json\"]", "price_regex": "([0-9.]+\\s*L|Cr)"}'::jsonb
)
ON CONFLICT (portal_name) DO UPDATE SET 
  display_name = EXCLUDED.display_name,
  search_url_template = EXCLUDED.search_url_template;

-- RLS Security Policies for Superadmin & Scraper Tables
ALTER TABLE public.scraper_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scraper_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scraper_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_review_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read scraper_configs" ON public.scraper_configs;
CREATE POLICY "Allow public read scraper_configs" ON public.scraper_configs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read scraper_jobs" ON public.scraper_jobs;
CREATE POLICY "Allow public read scraper_jobs" ON public.scraper_jobs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read scraper_logs" ON public.scraper_logs;
CREATE POLICY "Allow public read scraper_logs" ON public.scraper_logs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read match_review_queue" ON public.match_review_queue;
CREATE POLICY "Allow public read match_review_queue" ON public.match_review_queue FOR SELECT USING (true);

-- Write/Modify policies restricted to Superadmin OR service key
DROP POLICY IF EXISTS "Superadmin write scraper_configs" ON public.scraper_configs;
CREATE POLICY "Superadmin write scraper_configs" ON public.scraper_configs FOR ALL USING (
  auth.role() = 'service_role' OR (auth.jwt() ->> 'email') = 'somnathdey269@gmail.com'
);

DROP POLICY IF EXISTS "Superadmin write scraper_jobs" ON public.scraper_jobs;
CREATE POLICY "Superadmin write scraper_jobs" ON public.scraper_jobs FOR ALL USING (
  auth.role() = 'service_role' OR (auth.jwt() ->> 'email') = 'somnathdey269@gmail.com'
);

DROP POLICY IF EXISTS "Superadmin write match_review_queue" ON public.match_review_queue;
CREATE POLICY "Superadmin write match_review_queue" ON public.match_review_queue FOR ALL USING (
  auth.role() = 'service_role' OR (auth.jwt() ->> 'email') = 'somnathdey269@gmail.com'
);

