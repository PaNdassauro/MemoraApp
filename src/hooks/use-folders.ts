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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFolders = useCallback(async () => {
        if (!user) {
            setFolders([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            let accessibleUserIds: string[] = [];

            if (ownerId) {
                // If specific owner requested, just check if we have access
                accessibleUserIds = [ownerId];
            } else {
                // Default: get our own + all accepted shares
                const { data: sharedInvites } = await supabase
                    .from('user_invites')
                    .select('owner_id')
                    .eq('invited_user_id', user.id)
                    .eq('status', 'accepted');

                const sharedOwnerIds = sharedInvites?.map(i => i.owner_id) || [];
                accessibleUserIds = [user.id, ...sharedOwnerIds];
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
    }, [parentId, user]);

    const createFolder = async (name: string) => {
        if (!user) throw new Error("Auth session missing!");

        try {
            const { data, error } = await supabase
                .from('folders')
                .insert([
                    {
                        name,
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
        loading,
        error,
        createFolder,
        deleteFolder,
        refreshFolders: fetchFolders
    };
}
