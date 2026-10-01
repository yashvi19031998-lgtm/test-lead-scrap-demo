-- IT Lead Finder Supabase Schema

CREATE TABLE search_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    query TEXT NOT NULL,
    platform TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE search_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_id UUID REFERENCES search_queries(id),
    status TEXT NOT NULL,
    urls_found INTEGER DEFAULT 0,
    urls_processed INTEGER DEFAULT 0,
    leads_found INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE source_urls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL UNIQUE,
    platform TEXT,
    title TEXT,
    snippet TEXT,
    search_query TEXT,
    status TEXT DEFAULT 'PENDING',
    scraping_method TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT,
    company_name TEXT,
    email TEXT,
    phone TEXT,
    whatsapp TEXT,
    website TEXT,
    location TEXT,
    project_title TEXT,
    project_description TEXT,
    technologies JSONB,
    services_required JSONB,
    budget TEXT,
    currency TEXT,
    timeline TEXT,
    lead_type TEXT,
    lead_status TEXT DEFAULT 'ACTIVE',
    lead_quality TEXT,
    lead_score INTEGER,
    source_platform TEXT,
    source_url TEXT,
    source_title TEXT,
    posted_date TEXT,
    scraping_method TEXT,
    ai_reason TEXT,
    generated_email_draft TEXT,
    company_match_score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE agency_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    website_url TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    core_services JSONB DEFAULT '[]'::jsonb,
    technologies JSONB DEFAULT '[]'::jsonb,
    company_bio TEXT,
    portfolio_links JSONB DEFAULT '[]'::jsonb,
    min_project_budget TEXT, 
    preferred_email_tone TEXT DEFAULT 'Professional',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
