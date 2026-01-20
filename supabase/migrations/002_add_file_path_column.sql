-- Migration: Add file_path column to photos table
-- This column stores the storage path for signed URL generation (private bucket)

ALTER TABLE photos 
ADD COLUMN IF NOT EXISTS file_path TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_photos_file_path ON photos(file_path);

COMMENT ON COLUMN photos.file_path IS 'Storage path in the photos bucket, used to generate signed URLs';
