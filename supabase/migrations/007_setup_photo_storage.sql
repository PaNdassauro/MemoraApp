-- Migration: Setup Storage for Photos
-- Description: Creates the 'photos' bucket and adds permissive RLS policies.

-- 1. Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true) -- Using public for easier AI access and dev speed
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS on storage.objects
-- (This is usually enabled by default, but safe to ensure)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Create permissive policies for development
-- NOTE: In production, these should be restricted to authenticated users.

CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'photos' );

CREATE POLICY "Public Insert"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'photos' );

CREATE POLICY "Public Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'photos' );

CREATE POLICY "Public Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'photos' );
