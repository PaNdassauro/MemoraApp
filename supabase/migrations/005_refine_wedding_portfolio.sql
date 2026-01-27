-- Migration 005: Refine Wedding Portfolio based on Briefing
-- Includes: Granular Consents, Media Governance, Vendor Credits, Publications

BEGIN;

-- 0. CLEANUP (Drop tables/types from 004 to force strict schema update)
DROP TABLE IF EXISTS publications CASCADE;
DROP TABLE IF EXISTS media_assets CASCADE;
DROP TABLE IF EXISTS portfolio_media CASCADE;
DROP TABLE IF EXISTS wedding_vendors CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;
DROP TABLE IF EXISTS consents CASCADE;
DROP TABLE IF EXISTS couples CASCADE;

-- 1. ENUMS
-- Note: wedding_type in 004 is a text check, not an enum. We leave it as is or could migrate it.
-- For now, we skip altering it since 'Outro' is already in 004's check list.
DO $$ BEGIN
    CREATE TYPE consent_scope AS ENUM ('Casal', 'Pessoa Específica', 'Convidados/Menores');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE consent_status AS ENUM ('Não solicitado', 'Solicitado', 'Aprovado', 'Negado', 'Expirado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE auth_type AS ENUM ('Termo assinado', 'Email/Whatsapp', 'Contrato');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE usage_permission_type AS ENUM ('Orgânico', 'Ads', 'PR', 'Portfólio', 'Materiais Comerciais');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE restriction_type AS ENUM ('Não marcar casal', 'Não citar local', 'Não mostrar rosto', 'Não mostrar crianças');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Vendor & Media
DO $$ BEGIN
    CREATE TYPE vendor_category AS ENUM ('Fotografia', 'Vídeo', 'Decor', 'Beauty', 'Venue', 'Música', 'Assessoria', 'Buffet', 'Outro');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE repost_permission AS ENUM ('Sim', 'Não', 'Condicional');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE media_type AS ENUM ('Foto', 'Vídeo', 'Reel', 'Corte');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE media_moment AS ENUM ('Cerimônia', 'Festa', 'Making of', 'Decoração', 'Ensaio', 'Outro');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE usage_override AS ENUM ('Liberado', 'Bloqueado', 'Restrito');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE risk_flag AS ENUM ('Mostra rosto', 'Mostra criança', 'Mostra convidados', 'Conteúdo sensível');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE publication_status AS ENUM ('Não usado', 'Selecionado', 'Postado orgânico', 'Ads', 'Portfólio');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. COUPLES (Pessoas do casal) - Separating from main weddings table JSON if needed, or structured relation
CREATE TABLE IF NOT EXISTS couples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Noiva', 'Noivo', 'Noive', 'Parceiro(a)')),
  instagram TEXT,
  tiktok TEXT,
  other_socials TEXT,
  contact_info TEXT, -- Email/Phone if needed for consent
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CONSENTS (Granular governance)
CREATE TABLE IF NOT EXISTS consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
  person_id UUID REFERENCES couples(id) ON DELETE SET NULL, -- Null if scope is 'Casal' (both)
  scope consent_scope NOT NULL DEFAULT 'Casal',
  status consent_status NOT NULL DEFAULT 'Não solicitado',
  auth_type auth_type,
  
  -- Permissions (stored as Arrays of Enum for flexibility)
  usage_permissions usage_permission_type[] DEFAULT '{}',
  restrictions restriction_type[] DEFAULT '{}',
  restriction_details TEXT, -- Custom text
  
  approval_date TIMESTAMP WITH TIME ZONE,
  proof_link TEXT, -- Link to PDF/Email
  validator_id UUID, -- Internal user responsible
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. VENDORS (Master list)
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category vendor_category NOT NULL,
  instagram TEXT,
  site TEXT,
  city_country TEXT,
  contact_info TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. WEDDING_VENDORS (Many-to-Many with context)
CREATE TABLE IF NOT EXISTS wedding_vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  role_in_event TEXT, -- Specific role e.g. "Assessoria do dia"
  is_mandatory_credit BOOLEAN DEFAULT FALSE,
  custom_credit_text TEXT, -- "Foto: @fulano"
  repost_permission repost_permission DEFAULT 'Sim',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. MEDIA ASSETS (Enhanced)
-- Replacing/upgrading existing media table if exists, or creating new specialized one.
-- Assuming 'media_assets' might already exist or we rename/upgrade. Let's create `portfolio_media` to be distinct/safe.
CREATE TABLE IF NOT EXISTS portfolio_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
  type media_type NOT NULL DEFAULT 'Foto',
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  moment media_moment,
  tags TEXT[], -- Array of strings
  is_hero BOOLEAN DEFAULT FALSE,
  
  -- Governance
  usage_override usage_override DEFAULT 'Liberado',
  risk_flags risk_flag[] DEFAULT '{}',
  publication_status publication_status DEFAULT 'Não usado',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. PUBLICATIONS (Tracking)
CREATE TABLE IF NOT EXISTS publications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
  media_id UUID REFERENCES portfolio_media(id) ON DELETE SET NULL,
  channel TEXT NOT NULL, -- "IG Feed", "Site", etc.
  publish_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  post_link TEXT,
  caption TEXT,
  used_credits TEXT,
  performance_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_couples_wedding ON couples(wedding_id);
CREATE INDEX IF NOT EXISTS idx_consents_wedding ON consents(wedding_id);
CREATE INDEX IF NOT EXISTS idx_media_wedding ON portfolio_media(wedding_id);
CREATE INDEX IF NOT EXISTS idx_media_status ON portfolio_media(publication_status);

COMMIT;
