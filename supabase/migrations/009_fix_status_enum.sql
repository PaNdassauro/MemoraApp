-- Migration 009: Fix Wedding Status Enum Values
-- The database seems to have 'wedding_status' as an ENUM, but it's missing the Portuguese values used by the app.

BEGIN;

-- Add values to the 'wedding_status' ENUM type.
-- We use IF NOT EXISTS to prevent errors if they are already there (Postgres 12+).

ALTER TYPE wedding_status ADD VALUE IF NOT EXISTS 'Em produção';
ALTER TYPE wedding_status ADD VALUE IF NOT EXISTS 'Finalizado';
ALTER TYPE wedding_status ADD VALUE IF NOT EXISTS 'Publicado';
ALTER TYPE wedding_status ADD VALUE IF NOT EXISTS 'Arquivado';

-- Commit changes
COMMIT;

-- Reload Schema Cache
NOTIFY pgrst, 'reload schema';
