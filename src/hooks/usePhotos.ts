import { useState, useEffect, useCallback } from 'react';
import { supabase, PHOTOS_BUCKET } from '../lib/supabase';
import type { Photo } from '../types';

interface UsePhotosReturn {
    photos: Photo[];
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    deletePhoto: (id: string) => Promise<void>;
}

export function usePhotos(folderId?: string | null, ownerId?: string): UsePhotosReturn {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPhotos = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // SWITCH TO portfolio_media (The correct table for weddings)
            let query = supabase
                .from('portfolio_media')
                .select('*')
                .order('created_at', { ascending: false });

            // Note: portfolio_media relies on RLS for user filtering, or wedding_id relationship
            // We use folderId for filtering
            if (folderId !== undefined) {
                if (folderId === null) {
                    query = query.is('folder_id', null);
                } else {
                    query = query.eq('folder_id', folderId);
                }
            }

            const { data, error: fetchError } = await query;

            if (fetchError) {
                console.warn('Fetch error:', fetchError.message);
                setPhotos([]);
                return;
            }

            if (!data || data.length === 0) {
                setPhotos([]);
                return;
            }

            // Map portfolio_media to Photo interface
            const mappedPhotos: Photo[] = data.map((item: any) => ({
                id: item.id,
                created_at: item.created_at,
                user_id: item.user_id || "", // Fallback if column missing (usually handled by RLS)
                storage_url: item.file_url, // Using public URL directly
                file_path: item.file_url,   // Using URL as path/ID reference
                file_name: item.file_url.split('/').pop() || 'image.jpg',
                metadata: {
                    category: item.moment || 'Geral',
                    tags: item.tags || [],
                    description: item.description || '',
                    colors: [],
                    objects: [],
                    confidence: 1
                },
                embedding: null
            }));

            setPhotos(mappedPhotos);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar fotos';
            setError(errorMessage);
            console.error('Error fetching photos:', err);
        } finally {
            setIsLoading(false);
        }
    }, [folderId]);

    const deletePhoto = useCallback(async (id: string) => {
        try {
            // Delete from database (Cascade should handle storage if configured, but let's be safe)
            // For now, we only delete the DB record. Storage cleanup should be a separate trigger/job 
            // or we'd need to parse the URL to get the storage path.

            const { error: deleteError } = await supabase
                .from('portfolio_media')
                .delete()
                .eq('id', id);

            if (deleteError) {
                throw new Error(deleteError.message);
            }

            setPhotos(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar foto';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, [photos]);

    useEffect(() => {
        fetchPhotos();
    }, [fetchPhotos]);

    return {
        photos,
        isLoading,
        error,
        refetch: fetchPhotos,
        deletePhoto
    };
}
