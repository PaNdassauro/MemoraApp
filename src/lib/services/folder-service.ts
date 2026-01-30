import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export interface Folder {
    id: string;
    parent_id: string | null;
    user_id: string;
    name: string;
    created_at: string;
}

export const FolderService = {
    /**
     * Ensures a hierarchical path of folders exists.
     * Example: ['Weddings', 'Argentina', 'Mendoza', 'Vineyard']
     * Returns the ID of the leaf folder ('Vineyard').
     */
    async ensurePath(path: string[]): Promise<string> {
        const supabase = createClientComponentClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) throw new Error("User not authenticated");

        let currentParentId: string | null = null;

        for (const folderName of path) {
            if (!folderName || !folderName.trim()) continue;

            // Check if folder exists at this level
            let query = supabase
                .from('folders')
                .select('id')
                .eq('user_id', user.id)
                .eq('name', folderName.trim());

            if (currentParentId) {
                query = query.eq('parent_id', currentParentId);
            } else {
                query = query.is('parent_id', null);
            }

            const { data: existingFolder } = await query.maybeSingle();

            if (existingFolder) {
                currentParentId = existingFolder.id;
            } else {
                // Create new folder
                const { data: newFolder, error: createError } = await supabase
                    .from('folders')
                    .insert({
                        name: folderName.trim(),
                        parent_id: currentParentId,
                        user_id: user.id
                    })
                    .select('id')
                    .single();

                if (createError) {
                    // Handle race condition: if duplicate was created between check and insert
                    if (createError.code === '23505') {
                        let retryQuery = supabase
                            .from('folders')
                            .select('id')
                            .eq('user_id', user.id)
                            .eq('name', folderName.trim());

                        if (currentParentId) {
                            retryQuery = retryQuery.eq('parent_id', currentParentId);
                        } else {
                            retryQuery = retryQuery.is('parent_id', null);
                        }

                        const { data: retriedFolder } = await retryQuery.maybeSingle();
                        if (retriedFolder) {
                            currentParentId = retriedFolder.id;
                            continue;
                        }
                    }
                    console.error(`Error creating folder "${folderName}":`, createError);
                    throw createError;
                }

                currentParentId = newFolder.id;
            }
        }

        if (!currentParentId) throw new Error("Empty path provided");
        return currentParentId;
    }
};
