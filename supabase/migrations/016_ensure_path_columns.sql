    -- Migration 016: Add hotel_name to Weddings
    BEGIN;

    ALTER TABLE weddings ADD COLUMN IF NOT EXISTS hotel_name TEXT;
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES folders(id) ON DELETE SET NULL;
ALTER TABLE portfolio_media ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES folders(id) ON DELETE SET NULL;

    -- Reload Schema Cache
    NOTIFY pgrst, 'reload schema';

    COMMIT;
