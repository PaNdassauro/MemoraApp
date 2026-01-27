-- Migration: Create Wedding Portfolio Schema
-- Description: Adds tables for Weddings, Couples, Consents, Vendors, Wedding Vendors, Media, and Publications with strict governance.

-- 1. Weddings
CREATE TABLE IF NOT EXISTS weddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL, -- For friendly URLs (e.g., /barbara-rodrigo)
    couple_name TEXT NOT NULL,
    wedding_date DATE NOT NULL,
    destination_country TEXT,
    destination_city TEXT,
    venue_name TEXT,
    wedding_type TEXT CHECK (wedding_type IN ('Destination', 'Elopement', 'Mini-Wedding', 'Clássico', 'Outro')),
    status TEXT DEFAULT 'Em produção' CHECK (status IN ('Em produção', 'Finalizado', 'Publicado', 'Arquivado')),
    
    -- Links (OneDrive)
    folder_raw TEXT,
    folder_selection TEXT,
    folder_finals TEXT,
    
    -- Internal Info
    internal_owners TEXT[], -- Array of names/IDs
    editorial_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Couples (People linked to a wedding)
CREATE TABLE IF NOT EXISTS couples (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    role TEXT CHECK (role IN ('Noiva', 'Noivo', 'Noive', 'Parceiro(a)')),
    instagram TEXT,
    tiktok TEXT,
    other_socials TEXT,
    contact_info TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Consents (Legal/Usage Rights)
CREATE TABLE IF NOT EXISTS consents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE NOT NULL,
    person_id UUID REFERENCES couples(id) ON DELETE SET NULL, -- Optional: link to specific person
    
    scope TEXT NOT NULL CHECK (scope IN ('Casal', 'Pessoa Específica', 'Convidados/Menores')),
    status TEXT DEFAULT 'Não solicitado' CHECK (status IN ('Não solicitado', 'Solicitado', 'Aprovado', 'Negado', 'Expirado')),
    auth_type TEXT CHECK (auth_type IN ('Termo assinado', 'Email/Whatsapp', 'Contrato')),
    
    -- Usage Permissions (Booleans for granular control)
    allow_organic BOOLEAN DEFAULT FALSE,
    allow_ads BOOLEAN DEFAULT FALSE,
    allow_pr BOOLEAN DEFAULT FALSE,
    allow_website BOOLEAN DEFAULT FALSE,
    allow_commercial BOOLEAN DEFAULT FALSE,
    
    -- Restrictions
    restriction_no_tag BOOLEAN DEFAULT FALSE,
    restriction_no_location BOOLEAN DEFAULT FALSE,
    restriction_no_face BOOLEAN DEFAULT FALSE,
    restriction_no_kids BOOLEAN DEFAULT FALSE,
    restriction_details TEXT,
    
    approved_at TIMESTAMP WITH TIME ZONE,
    proof_document_url TEXT, -- Link to PDF/Print
    validator_name TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Vendors (Master List)
CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Fotografia', 'Vídeo', 'Decor', 'Beauty', 'Venue', 'Música', 'Assessoria', 'Buffet', 'Outro')),
    instagram TEXT,
    website TEXT,
    location TEXT,
    contact_info TEXT,
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Wedding Vendors (Junction Table for "Ficha Técnica")
CREATE TABLE IF NOT EXISTS wedding_vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE NOT NULL,
    vendor_id UUID REFERENCES vendors(id) ON DELETE RESTRICT NOT NULL,
    
    role_in_event TEXT NOT NULL, -- Specific role for this event
    credit_required BOOLEAN DEFAULT TRUE,
    credit_text TEXT, -- e.g., "Foto: @fulano"
    repost_permission TEXT DEFAULT 'Sim' CHECK (repost_permission IN ('Sim', 'Não', 'Condicional')),
    notes TEXT,
    
    UNIQUE(wedding_id, vendor_id)
);

-- 6. Media (Photos/Videos with Governance)
CREATE TABLE IF NOT EXISTS media_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE NOT NULL,
    
    type TEXT NOT NULL CHECK (type IN ('Foto', 'Vídeo', 'Reel', 'Corte')),
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    
    moment TEXT CHECK (moment IN ('Cerimônia', 'Festa', 'Making of', 'Decoração', 'Ensaio', 'Outro')),
    tags TEXT[],
    is_hero BOOLEAN DEFAULT FALSE, -- Portfolio highlight
    
    -- Governance Overrides (Null means inherit from Consent)
    override_usage TEXT CHECK (override_usage IN ('Liberado', 'Bloqueado', 'Restrito')),
    
    -- Risks
    has_face BOOLEAN DEFAULT FALSE,
    has_kids BOOLEAN DEFAULT FALSE,
    has_guests BOOLEAN DEFAULT FALSE,
    is_sensitive BOOLEAN DEFAULT FALSE,
    
    publication_status TEXT DEFAULT 'Não usado' CHECK (publication_status IN ('Não usado', 'Selecionado', 'Postado orgânico', 'Ads', 'Portfólio')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Publications (Tracking)
CREATE TABLE IF NOT EXISTS publications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE NOT NULL,
    media_id UUID REFERENCES media_assets(id) ON DELETE SET NULL, -- Can be null if posting a whole album
    
    channel TEXT NOT NULL CHECK (channel IN ('Instagram Feed', 'Instagram Stories', 'Instagram Reels', 'TikTok', 'Site', 'Ads', 'Newsletter', 'Youtube', 'Imprensa')),
    publish_date DATE NOT NULL DEFAULT CURRENT_DATE,
    post_link TEXT,
    caption TEXT,
    used_credits TEXT, -- Snapshot of credits used
    performance_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_weddings_status ON weddings(status);
CREATE INDEX idx_media_wedding ON media_assets(wedding_id);
CREATE INDEX idx_media_tags ON media_assets USING GIN (tags);
CREATE INDEX idx_consents_wedding ON consents(wedding_id);

-- Enable Row Level Security (RLS)
ALTER TABLE weddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE publications ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for development (matching existing 003_dev_permissive_rls.sql pattern)
-- NOTE: In production, these should be restricted!

CREATE POLICY "Enable all access for weddings" ON weddings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for couples" ON couples FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for consents" ON consents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for vendors" ON vendors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for wedding_vendors" ON wedding_vendors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for media_assets" ON media_assets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for publications" ON publications FOR ALL USING (true) WITH CHECK (true);
