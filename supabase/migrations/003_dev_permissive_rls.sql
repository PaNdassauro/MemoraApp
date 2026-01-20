-- Migration: Temporary permissive RLS for development (no auth)
-- IMPORTANT: Replace with proper auth-based policies before production!

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own photos" ON photos;
DROP POLICY IF EXISTS "Users can insert own photos" ON photos;
DROP POLICY IF EXISTS "Users can update own photos" ON photos;
DROP POLICY IF EXISTS "Users can delete own photos" ON photos;

-- Create permissive policies for development (allows any operation)
CREATE POLICY "Allow all operations for development" ON photos
FOR ALL
USING (true)
WITH CHECK (true);

-- Make user_id nullable for anonymous uploads
ALTER TABLE photos ALTER COLUMN user_id DROP NOT NULL;

-- Also need to set up storage policies
-- Run this in Supabase Dashboard > Storage > photos bucket > Policies:
-- INSERT: Allow anonymous uploads
-- SELECT: Allow anonymous reads
-- DELETE: Allow anonymous deletes

COMMENT ON POLICY "Allow all operations for development" ON photos IS 
'TEMPORARY: Remove this policy and add proper auth before production';
