-- Create Folders Table
CREATE TABLE IF NOT EXISTS folders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    parent_id UUID REFERENCES folders(id) ON DELETE CASCADE, -- NULL for root folders
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for folders
CREATE INDEX IF NOT EXISTS folders_user_id_idx ON folders(user_id);
CREATE INDEX IF NOT EXISTS folders_parent_id_idx ON folders(parent_id);

-- Enable RLS for folders
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

-- Governance Policies (Generic "manage own" policy)
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can manage own folders" ON folders;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

CREATE POLICY "Users can manage own folders"
    ON folders FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Add folder_id to photos (if not exists)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'photos' AND column_name = 'folder_id') THEN
        ALTER TABLE photos ADD COLUMN folder_id UUID REFERENCES folders(id) ON DELETE SET NULL;
        CREATE INDEX photos_folder_id_idx ON photos(folder_id);
    END IF;
END $$;

-- Grant permissions (Fixes 404 for API usage)
GRANT ALL ON folders TO anon;
GRANT ALL ON folders TO authenticated;
GRANT ALL ON folders TO service_role;
