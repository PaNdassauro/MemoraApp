-- Migration 013: Fix Portfolio Media Table and Permissions
-- Description: Ensures portfolio_media exists with TEXT types (to avoid enum issues) and has proper RLS/Grants.

-- 1. Ensure Table Exists
CREATE TABLE IF NOT EXISTS portfolio_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'Foto',
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    moment TEXT, -- e.g. 'Cerimônia', 'Festa'
    tags TEXT[],
    is_hero BOOLEAN DEFAULT FALSE,
    
    -- Governance
    usage_override TEXT DEFAULT 'Liberado',
    publication_status TEXT DEFAULT 'Não usado',
    description TEXT, -- for Alt Text / IA description
    
    risk_flags TEXT[], -- Array of strings
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE portfolio_media ENABLE ROW LEVEL SECURITY;

-- 3. Grants (Fixes 404 "Not Found" in API)
GRANT ALL ON portfolio_media TO anon;
GRANT ALL ON portfolio_media TO authenticated;
GRANT ALL ON portfolio_media TO service_role;

-- 4. Policies (Permissive for Dev)
DO $$ BEGIN
    DROP POLICY IF EXISTS "Enable all access for portfolio_media" ON portfolio_media;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

CREATE POLICY "Enable all access for portfolio_media" ON portfolio_media FOR ALL USING (true) WITH CHECK (true);

-- 5. Fix potential column types if table existed but was wrong
-- Ensure columns are TEXT to match client usage and avoid Enum hell
DO $$ BEGIN
    ALTER TABLE portfolio_media ALTER COLUMN type TYPE TEXT;
    ALTER TABLE portfolio_media ALTER COLUMN moment TYPE TEXT;
    ALTER TABLE portfolio_media ALTER COLUMN usage_override TYPE TEXT;
    ALTER TABLE portfolio_media ALTER COLUMN publication_status TYPE TEXT;
EXCEPTION
    WHEN others THEN null; -- Ignore if fails
END $$;
