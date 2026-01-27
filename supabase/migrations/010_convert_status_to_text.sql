-- Migration 010: Convert Status and Type to TEXT
-- Resolves "invalid enum" errors by enforcing simple TEXT types with Check Constraints.

BEGIN;

-- 1. Convert columns to TEXT (handling any existing Enum conversion automatically)
ALTER TABLE weddings ALTER COLUMN status TYPE TEXT;
ALTER TABLE weddings ALTER COLUMN status SET DEFAULT 'Em produção';

ALTER TABLE weddings ALTER COLUMN wedding_type TYPE TEXT;

-- 2. Drop the problematic Enum types if they exist (Clean up)
DROP TYPE IF EXISTS wedding_status;
DROP TYPE IF EXISTS wedding_type_enum; 

-- 3. Apply standard Check Constraints (Ensure data integrity matches App Logic)
ALTER TABLE weddings DROP CONSTRAINT IF EXISTS weddings_status_check;
ALTER TABLE weddings ADD CONSTRAINT weddings_status_check 
    CHECK (status IN ('Em produção', 'Finalizado', 'Publicado', 'Arquivado'));

ALTER TABLE weddings DROP CONSTRAINT IF EXISTS weddings_wedding_type_check;
ALTER TABLE weddings ADD CONSTRAINT weddings_wedding_type_check 
    CHECK (wedding_type IN ('Destination', 'Elopement', 'Mini-Wedding', 'Clássico', 'Outro'));

-- 4. Reload Schema Cache
NOTIFY pgrst, 'reload schema';

COMMIT;
