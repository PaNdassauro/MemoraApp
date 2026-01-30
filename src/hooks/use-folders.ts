import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Folder {
    id: string;
    name: string;
    parent_id: string | null;
    created_at: string;
    user_id: string;
}

export function useFolders(parentId: string | null = null) {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFolders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let query = supabase
                .from('folders')
                .select('*')
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
    }, [parentId]);

    const createFolder = async (name: string) => {
        try {
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;

            const { data, error } = await supabase
                .from('folders')
                .insert([
                    {
                        name,
                        parent_id: parentId,
                        user_id: userData.user.id
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
