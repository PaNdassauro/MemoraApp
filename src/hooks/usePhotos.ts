import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Photo } from '../types';

interface UsePhotosReturn {
    photos: Photo[];
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    deletePhoto: (id: string) => Promise<void>;
}

export function usePhotos(): UsePhotosReturn {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPhotos = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('photos')
                .select('*')
                .order('created_at', { ascending: false });

            if (fetchError) {
                // Expected error if database not configured yet
                console.warn('Fetch error (expected if not configured):', fetchError.message);
                setPhotos([]);
                return;
            }

            setPhotos(data || []);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar fotos';
            setError(errorMessage);
            console.error('Error fetching photos:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const deletePhoto = useCallback(async (id: string) => {
        try {
            const { error: deleteError } = await supabase
                .from('photos')
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
    }, []);

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
