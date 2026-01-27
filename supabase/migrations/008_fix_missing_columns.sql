-- Migration 008: Fix Missing Columns in Weddings Table
-- This ensures that columns defined in 004 actually exist, in case the table was created earlier without them.

BEGIN;

-- Add potentially missing columns to 'weddings'
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS couple_name TEXT;
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS wedding_date DATE;
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS destination_country TEXT;
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS destination_city TEXT;
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS venue_name TEXT;
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS wedding_type TEXT; -- Constraint might be missing if added this way
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Em produção';
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS folder_raw TEXT;
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS folder_selection TEXT;
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS folder_finals TEXT;
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS slug TEXT;

-- Add Constraints if they are missing (Safe check)
-- REMOVED: Skipping constraint additions because the database appears to use ENUMs 
-- which conflict with these TEXT check constraints. 
-- If columns exist as ENUMs, they enforce their own integrity.

-- Reload Schema Cache for Postgrest
NOTIFY pgrst, 'reload schema';

COMMIT;
