-- Migration 011: Ensure Weddings Table Exists and Reform Schema
-- This script ensures the table exists, adds missing columns, converts Enums to TEXT, and applies RLS.

BEGIN;

-- 1. Create table if totally missing (Base structure)
CREATE TABLE IF NOT EXISTS weddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE,
    couple_name TEXT NOT NULL, -- Core required field
    wedding_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add columns if missing (Schema Evolution / Idempotency)
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS destination_country TEXT;
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS destination_city TEXT;
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS venue_name TEXT;
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS wedding_type TEXT;
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Em produção';
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS folder_raw TEXT;
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS folder_selection TEXT;
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS folder_finals TEXT;
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS internal_owners TEXT[];
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS editorial_notes TEXT;

-- 3. Ensure Types are TEXT (Fixing Enum issues if they partially exist or were Enums)
ALTER TABLE weddings ALTER COLUMN status TYPE TEXT;
ALTER TABLE weddings ALTER COLUMN wedding_type TYPE TEXT;

-- 4. Drop problematic constraints/types if they impede
DO $$ BEGIN
    -- Try to drop enum types if not used anymore (optional cleanup)
    -- DROP TYPE IF EXISTS wedding_status; -- Risky if other tables use it, skipping.
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 5. Apply Constraints
ALTER TABLE weddings DROP CONSTRAINT IF EXISTS weddings_status_check;
ALTER TABLE weddings ADD CONSTRAINT weddings_status_check 
    CHECK (status IN ('Em produção', 'Finalizado', 'Publicado', 'Arquivado'));

ALTER TABLE weddings DROP CONSTRAINT IF EXISTS weddings_wedding_type_check;
ALTER TABLE weddings ADD CONSTRAINT weddings_wedding_type_check 
    CHECK (wedding_type IN ('Destination', 'Elopement', 'Mini-Wedding', 'Clássico', 'Outro'));

-- 6. Enable RLS
ALTER TABLE weddings ENABLE ROW LEVEL SECURITY;

-- 7. Add Permissive Policy (Dev Mode)
DROP POLICY IF EXISTS "Enable all for weddings" ON weddings;
CREATE POLICY "Enable all for weddings" ON weddings FOR ALL USING (true) WITH CHECK (true);

-- 8. Reload Schema Cache
NOTIFY pgrst, 'reload schema';

COMMIT;
