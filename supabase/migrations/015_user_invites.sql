-- Create User Invites Table
CREATE TABLE IF NOT EXISTS user_invites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    invited_email TEXT NOT NULL,
    invited_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Populated once accepted
    status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending' NOT NULL,
    role TEXT CHECK (role IN ('viewer', 'editor', 'admin')) DEFAULT 'viewer' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(owner_id, invited_email)
);

-- Enable RLS for invites
ALTER TABLE user_invites ENABLE ROW LEVEL SECURITY;

-- Owner can manage their own invites
CREATE POLICY "Owners can manage own invites"
    ON user_invites FOR ALL
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

-- Invited users can view and update (accept/reject) their own invites
CREATE POLICY "Invited users can manage own invites"
    ON user_invites FOR SELECT
    USING (auth.uid() = invited_user_id OR auth.email() = invited_email);

CREATE POLICY "Invited users can update status"
    ON user_invites FOR UPDATE
    USING (auth.email() = invited_email)
    WITH CHECK (auth.email() = invited_email AND status IN ('accepted', 'rejected'));

-- UPDATE RLS FOR FOLDERS
-- 1. Owners can manage their own folders (Already exists)
-- 2. Add: Shared users can view folders
CREATE POLICY "Shared users can view folders"
    ON folders FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_invites
            WHERE user_invites.owner_id = folders.user_id
            AND user_invites.invited_user_id = auth.uid()
            AND user_invites.status = 'accepted'
        )
    );

-- 3. Add: Shared editors can manage folders
CREATE POLICY "Shared editors can manage folders"
    ON folders FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_invites
            WHERE user_invites.owner_id = folders.user_id
            AND user_invites.invited_user_id = auth.uid()
            AND user_invites.status = 'accepted'
            AND user_invites.role IN ('editor', 'admin')
        )
    );

-- UPDATE RLS FOR PHOTOS
-- (Assuming photos table has a user_id or folder_id)
-- If photos are in a folder, they inherit access.
-- If they have a user_id:
CREATE POLICY "Shared users can view photos"
    ON photos FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_invites
            WHERE user_invites.owner_id = photos.user_id
            AND user_invites.invited_user_id = auth.uid()
            AND user_invites.status = 'accepted'
        )
    );

GRANT ALL ON user_invites TO authenticated;
GRANT ALL ON user_invites TO service_role;
