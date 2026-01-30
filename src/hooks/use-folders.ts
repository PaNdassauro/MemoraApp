import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '@/contexts/auth-context';

export interface Folder {
    id: string;
    name: string;
    parent_id: string | null;
    created_at: string;
    user_id: string;
}

export function useFolders(parentId: string | null = null, ownerId?: string) {
    const { user } = useAuth();
    const [folders, setFolders] = useState<Folder[]>([]);
    const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
    const [path, setPath] = useState<Folder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFolders = useCallback(async () => {
        if (!user) {
            setFolders([]);
            setCurrentFolder(null);
            setPath([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            let accessibleUserIds: string[] = [];

            if (ownerId) {
                accessibleUserIds = [ownerId];
            } else {
                const { data: sharedInvites } = await supabase
                    .from('user_invites')
                    .select('owner_id')
                    .eq('invited_user_id', user.id)
                    .eq('status', 'accepted');

                const sharedOwnerIds = sharedInvites?.map(i => i.owner_id) || [];
                accessibleUserIds = [user.id, ...sharedOwnerIds];
            }

            // Fetch current folder and its path if parentId is provided
            if (parentId) {
                const { data: folderData, error: folderError } = await supabase
                    .from('folders')
                    .select('*')
                    .eq('id', parentId)
                    .single();

                if (folderError) throw folderError;
                setCurrentFolder(folderData);

                // Fetch path (ancestors)
                const ancestors: Folder[] = [folderData];
                let current = folderData;
                while (current.parent_id) {
                    const { data: parentData, error: parentError } = await supabase
                        .from('folders')
                        .select('*')
                        .eq('id', current.parent_id)
                        .single();

                    if (parentError) break;
                    ancestors.unshift(parentData);
                    current = parentData;
                }
                setPath(ancestors);
            } else {
                setCurrentFolder(null);
                setPath([]);
            }

            let query = supabase
                .from('folders')
                .select('*')
                .in('user_id', accessibleUserIds)
                .order('name');

            if (parentId) {
                query = query.eq('parent_id', parentId);
            } else {
                query = query.is('parent_id', null);
            }

            const { data, error } = await query;

            if (error) throw error;
            setFolders(data || []);
        } catch (err: any) {
            console.error('Error fetching folders:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [parentId, user, ownerId]);

    const createFolder = async (name: string) => {
        if (!user) throw new Error("Auth session missing!");

        try {
            // Check for existing folder with same name at this level
            let checkQuery = supabase
                .from('folders')
                .select('*')
                .eq('user_id', user.id)
                .eq('name', name.trim());

            if (parentId) {
                checkQuery = checkQuery.eq('parent_id', parentId);
            } else {
                checkQuery = checkQuery.is('parent_id', null);
            }

            const { data: existing } = await checkQuery.maybeSingle();

            if (existing) {
                return existing;
            }

            // Otherwise create new
            const { data, error } = await supabase
                .from('folders')
                .insert([
                    {
                        name: name.trim(),
                        parent_id: parentId,
                        user_id: user.id
                    }
                ])
                .select()
                .single();

            if (error) throw error;
            setFolders(prev => [...prev, data]);
            return data;
        } catch (err: any) {
            console.error('Error creating folder:', err);
            throw err;
        }
    };

    const deleteFolder = async (id: string) => {
        try {
            const { error } = await supabase
                .from('folders')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setFolders(prev => prev.filter(f => f.id !== id));
        } catch (err: any) {
            console.error('Error deleting folder:', err);
            throw err;
        }
    };

    useEffect(() => {
        fetchFolders();
    }, [fetchFolders]);

    return {
        folders,
        currentFolder,
        path,
        loading,
        error,
        createFolder,
        deleteFolder,
        refreshFolders: fetchFolders
    };
}
