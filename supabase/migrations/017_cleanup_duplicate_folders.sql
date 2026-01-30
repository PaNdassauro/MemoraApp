-- Migration to clean up duplicate folders and enforce uniqueness
BEGIN;

-- 1. Identify and delete duplicates (keeping the one with the earliest created_at)
DELETE FROM folders f1
USING folders f2
WHERE f1.id > f2.id
  AND f1.user_id = f2.user_id
  AND f1.name = f2.name
  AND (f1.parent_id = f2.parent_id OR (f1.parent_id IS NULL AND f2.parent_id IS NULL));

-- 2. Add unique constraint for root folders (parent_id IS NULL)
CREATE UNIQUE INDEX IF NOT EXISTS folders_user_name_root_idx ON folders (user_id, name) WHERE parent_id IS NULL;

-- 3. Add unique constraint for subfolders (parent_id IS NOT NULL)
CREATE UNIQUE INDEX IF NOT EXISTS folders_user_name_parent_idx ON folders (user_id, parent_id, name) WHERE parent_id IS NOT NULL;

-- Reload Schema Cache
NOTIFY pgrst, 'reload schema';

COMMIT;
