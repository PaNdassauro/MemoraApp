import { useState, useCallback } from 'react';
import { supabase, PHOTOS_BUCKET } from '../lib/supabase';
import { useImageProcessor } from './useImageProcessor';
import type { UploadProgress } from '../types';

interface UseUploadReturn {
    uploadFiles: (files: File[]) => Promise<void>;
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

    const uploadFiles = useCallback(async (files: File[]) => {
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

                // Get public URL
                const { data: urlData } = supabase.storage
                    .from(PHOTOS_BUCKET)
                    .getPublicUrl(filePath);

                const storageUrl = urlData.publicUrl;

                // Update status to processing (AI)
                updateUpload(file, { status: 'processing', progress: 60 });

                // Process with AI (mock for now)
                const metadata = await processImageWithAI(storageUrl);

                updateUpload(file, { progress: 80 });

                // Save to database
                const { error: dbError } = await supabase
                    .from('photos')
                    .insert({
                        storage_url: storageUrl,
                        file_name: file.name,
                        metadata
                    });

                if (dbError) {
                    console.warn('Database error (expected if not configured):', dbError.message);
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
