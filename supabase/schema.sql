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
