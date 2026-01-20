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

            if (!data || data.length === 0) {
                setPhotos([]);
                return;
            }

            // Generate signed URLs for private bucket
            const photosWithSignedUrls = await Promise.all(
                data.map(async (photo) => {
                    // Extract file path from storage_url or use stored path
                    const filePath = photo.file_path || photo.storage_url?.split('/').pop();

                    if (filePath) {
                        const { data: signedData } = await supabase.storage
                            .from(PHOTOS_BUCKET)
                            .createSignedUrl(filePath, 3600); // 1 hour expiry

                        return {
                            ...photo,
                            storage_url: signedData?.signedUrl || photo.storage_url
                        };
                    }

                    return photo;
                })
            );

            setPhotos(photosWithSignedUrls);
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
            // Find photo to get file path
            const photoToDelete = photos.find(p => p.id === id);

            // Delete from storage first
            if (photoToDelete?.file_path) {
                await supabase.storage
                    .from(PHOTOS_BUCKET)
                    .remove([photoToDelete.file_path]);
            }

            // Delete from database
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
