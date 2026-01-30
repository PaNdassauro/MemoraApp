import { useState, useCallback } from 'react';
import { supabase, PHOTOS_BUCKET } from '../lib/supabase';
import { useImageProcessor } from './useImageProcessor';
import type { UploadProgress } from '../types';

interface UseUploadReturn {
    uploadFiles: (files: File[], folderId?: string | null) => Promise<void>;
    uploads: UploadProgress[];
    isUploading: boolean;
    clearCompleted: () => void;
}

export function useUpload(): UseUploadReturn {
    const [uploads, setUploads] = useState<UploadProgress[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const { processImageWithAI } = useImageProcessor();

    const updateUpload = useCallback((file: File, updates: Partial<UploadProgress>) => {
        setUploads(prev =>
            prev.map(u => u.file === file ? { ...u, ...updates } : u)
        );
    }, []);

    const uploadFiles = useCallback(async (files: File[], folderId: string | null = null) => {
        if (files.length === 0) return;

        setIsUploading(true);

        // Initialize upload states
        const initialUploads: UploadProgress[] = files.map(file => ({
            file,
            progress: 0,
            status: 'pending'
        }));
        setUploads(prev => [...prev, ...initialUploads]);

        // Process each file
        for (const file of files) {
            try {
                // Update status to uploading
                updateUpload(file, { status: 'uploading', progress: 10 });

                // Generate unique file path
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                const filePath = `uploads/${fileName}`;

                // Upload to Supabase Storage
                const { error: uploadError } = await supabase.storage
                    .from(PHOTOS_BUCKET)
                    .upload(filePath, file, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (uploadError) {
                    throw new Error(uploadError.message);
                }

                updateUpload(file, { progress: 50 });

                // Get Public URL (consistent with portfolio_media)
                const { data: { publicUrl } } = supabase.storage
                    .from(PHOTOS_BUCKET)
                    .getPublicUrl(filePath);

                const storageUrl = publicUrl;

                // Update status to processing (AI)
                updateUpload(file, { status: 'processing', progress: 60 });

                // Process with AI (mock for now)
                const metadata = await processImageWithAI(storageUrl);

                updateUpload(file, { progress: 80 });

                // Save to portfolio_media (Unified table)
                const { error: dbError } = await supabase
                    .from('portfolio_media')
                    .insert({
                        file_url: storageUrl,
                        moment: metadata?.category || 'Outro',
                        tags: metadata?.tags || [],
                        description: metadata?.description || '',
                        folder_id: folderId,
                        type: 'Foto',
                        usage_override: 'Liberado',
                        publication_status: 'Não usado',
                        is_hero: false
                    });

                if (dbError) {
                    console.error('Database error:', dbError.message);
                    throw new Error(dbError.message);
                }

                // Complete
                updateUpload(file, { status: 'complete', progress: 100 });

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Erro no upload';
                updateUpload(file, { status: 'error', error: errorMessage });
                console.error(`Upload failed for ${file.name}:`, err);
            }
        }

        setIsUploading(false);
    }, [processImageWithAI, updateUpload]);

    const clearCompleted = useCallback(() => {
        setUploads(prev => prev.filter(u => u.status !== 'complete'));
    }, []);

    return {
        uploadFiles,
        uploads,
        isUploading,
        clearCompleted
    };
}
