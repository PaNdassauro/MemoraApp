-- Migration 012: Force Convert Status Enum to TEXT
-- This migration properly converts enum columns to TEXT using explicit casting.

BEGIN;

-- 1. Convert status column from enum to TEXT (with explicit USING clause)
DO $$ 
BEGIN
    -- Check if the column type is not already text
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'weddings' 
        AND column_name = 'status' 
        AND data_type != 'text'
    ) THEN
        ALTER TABLE weddings 
            ALTER COLUMN status TYPE TEXT 
            USING status::TEXT;
    END IF;
END $$;

-- 2. Set default for status
ALTER TABLE weddings ALTER COLUMN status SET DEFAULT 'Em produção';

-- 3. Convert wedding_type column from enum to TEXT (with explicit USING clause)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'weddings' 
        AND column_name = 'wedding_type' 
        AND data_type != 'text'
    ) THEN
        ALTER TABLE weddings 
            ALTER COLUMN wedding_type TYPE TEXT 
            USING wedding_type::TEXT;
    END IF;
END $$;

-- 4. Drop the old enum types if they exist
DROP TYPE IF EXISTS wedding_status CASCADE;
DROP TYPE IF EXISTS wedding_type_enum CASCADE;

-- 5. Re-apply check constraints
ALTER TABLE weddings DROP CONSTRAINT IF EXISTS weddings_status_check;
ALTER TABLE weddings ADD CONSTRAINT weddings_status_check 
    CHECK (status IN ('Em produção', 'Finalizado', 'Publicado', 'Arquivado'));

ALTER TABLE weddings DROP CONSTRAINT IF EXISTS weddings_wedding_type_check;
ALTER TABLE weddings ADD CONSTRAINT weddings_wedding_type_check 
    CHECK (wedding_type IN ('Destination', 'Elopement', 'Mini-Wedding', 'Clássico', 'Outro'));

COMMIT;

-- Reload Schema Cache
NOTIFY pgrst, 'reload schema';
