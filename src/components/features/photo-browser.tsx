"use client";

import React, { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Search,
    Upload,
    X,
    Loader2,
    CheckCircle
} from "lucide-react";
import { PhotoModal } from "@/components/PhotoModal";
import { usePhotos } from "@/hooks/usePhotos";
import { useUpload } from "@/hooks/useUpload";
import type { Photo } from "@/types";
import { PhotoGridContent } from "./photo-grid-content";

interface PhotoBrowserProps {
    folderId?: string | null;
    hideHeader?: boolean;
    title?: string;
    scrollable?: boolean;
    ownerId?: string;
}

export function PhotoBrowser({
    folderId,
    hideHeader = false,
    title = "Fotos",
    scrollable = true,
    ownerId
}: PhotoBrowserProps) {
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Hooks
    const { photos, isLoading, refetch, deletePhoto } = usePhotos(folderId, ownerId);
    const { uploadFiles, uploads, isUploading, clearCompleted } = useUpload();

    // Filter photos based on search
    const filteredPhotos = photos.filter(photo => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            photo.file_name.toLowerCase().includes(query) ||
            photo.metadata?.category?.toLowerCase().includes(query) ||
            photo.metadata?.tags?.some((tag: string) => tag.toLowerCase().includes(query)) ||
            photo.metadata?.description?.toLowerCase().includes(query)
        );
    });

    // Handle file selection
    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/'));
        if (files.length > 0) {
            const newPreviews = files.map(file => ({
                file,
                url: URL.createObjectURL(file)
            }));
            setPreviews(prev => [...prev, ...newPreviews]);
            setShowUploadModal(true);
        }
    }, []);

    // Handle upload
    const handleUpload = async () => {
        if (previews.length === 0) return;

        const files = previews.map(p => p.file);
        // Pass folderId to uploadFiles
        await uploadFiles(files, folderId);

        // Clean up previews
        previews.forEach(p => URL.revokeObjectURL(p.url));
        setPreviews([]);

        // Refetch photos
        setTimeout(() => refetch(), 1500);
    };

    // Remove preview
    const removePreview = (index: number) => {
        setPreviews(prev => {
            const newPreviews = [...prev];
            URL.revokeObjectURL(newPreviews[index].url);
            newPreviews.splice(index, 1);
            return newPreviews;
        });
    };

    // Close upload modal
    const closeUploadModal = () => {
        if (!isUploading) {
            previews.forEach(p => URL.revokeObjectURL(p.url));
            setPreviews([]);
            clearCompleted();
            setShowUploadModal(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Header */}
            {!hideHeader && (
                <div className="border-b p-4 flex items-center gap-4 bg-white/50 backdrop-blur-sm sticky top-0 z-10" style={{ borderColor: '#E0C7A0' }}>
                    {/* Search Bar */}
                    <div className="flex-1 relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#7F8C8D' }} />
                        <Input
                            placeholder="Buscar fotos..."
                            value={searchQuery}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                            className="pl-9 h-9 border-slate-200"
                        />
                    </div>

                    {/* Upload Button */}
                    <Button
                        size="sm"
                        className="gap-2"
                        style={{ backgroundColor: '#AF8B5F', color: 'white' }}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload className="w-4 h-4" />
                        Upload Foto
                    </Button>
                </div>
            )}

            {/* Photo Grid */}
            {scrollable ? (
                <ScrollArea className="flex-1 p-6">
                    <PhotoGridContent
                        isLoading={isLoading}
                        filteredPhotos={filteredPhotos}
                        title={title}
                        hideHeader={hideHeader}
                        fileInputRef={fileInputRef}
                        setSelectedPhoto={setSelectedPhoto}
                        deletePhoto={deletePhoto}
                    />
                </ScrollArea>
            ) : (
                <div className="p-6">
                    <PhotoGridContent
                        isLoading={isLoading}
                        filteredPhotos={filteredPhotos}
                        title={title}
                        hideHeader={hideHeader}
                        fileInputRef={fileInputRef}
                        setSelectedPhoto={setSelectedPhoto}
                        deletePhoto={deletePhoto}
                    />
                </div>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden shadow-2xl">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#E0C7A0' }}>
                            <div>
                                <h2 className="text-xl" style={{ fontFamily: 'Poppins, sans-serif', color: '#2C3E50' }}>
                                    Upload de Fotos
                                </h2>
                                <p className="text-sm" style={{ color: '#7F8C8D' }}>
                                    {folderId ? 'Adicionando à pasta selecionada' : 'Adicionando à raiz'}
                                </p>
                            </div>
                            <button
                                onClick={closeUploadModal}
                                disabled={isUploading}
                                className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50"
                            >
                                <X className="w-5 h-5" style={{ color: '#7F8C8D' }} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 max-h-[50vh] overflow-y-auto">
                            {/* Previews */}
                            {previews.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="text-sm font-medium mb-3" style={{ color: '#2C3E50' }}>
                                        Selecionadas ({previews.length})
                                    </h3>
                                    <div className="grid grid-cols-3 gap-2">
                                        {previews.map((preview, index) => (
                                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                                                <img src={preview.url} alt="" className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => removePreview(index)}
                                                    className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white hover:bg-red-500 transition-colors"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Upload Progress */}
                            {uploads.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium mb-3" style={{ color: '#2C3E50' }}>
                                        Progresso
                                    </h3>
                                    {uploads.map((upload, index) => (
                                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: '#F7F7F7' }}>
                                            {upload.status === 'complete' ? (
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                            ) : upload.status === 'error' ? (
                                                <X className="w-5 h-5 text-red-500" />
                                            ) : (
                                                <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#AF8B5F' }} />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm truncate" style={{ color: '#2C3E50' }}>{upload.file.name}</p>
                                                <div className="w-full h-1 mt-1 rounded-full" style={{ backgroundColor: '#E0C7A0' }}>
                                                    <div
                                                        className="h-full rounded-full transition-all"
                                                        style={{
                                                            width: `${upload.progress}%`,
                                                            backgroundColor: upload.status === 'error' ? '#D35400' : '#AF8B5F'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <span className="text-xs" style={{ color: '#7F8C8D' }}>{upload.progress}%</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t" style={{ borderColor: '#E0C7A0' }}>
                            <Button
                                variant="ghost"
                                onClick={closeUploadModal}
                                disabled={isUploading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleUpload}
                                disabled={previews.length === 0 || isUploading}
                                className="gap-2"
                                style={{ backgroundColor: '#AF8B5F', color: 'white' }}
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Processando...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4" />
                                        Confirmar Upload
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Photo Modal */}
            {selectedPhoto && (
                <PhotoModal
                    photo={selectedPhoto}
                    onClose={() => setSelectedPhoto(null)}
                    onNext={() => {
                        const currentIndex = filteredPhotos.findIndex(p => p.id === selectedPhoto.id);
                        const nextIndex = (currentIndex + 1) % filteredPhotos.length;
                        setSelectedPhoto(filteredPhotos[nextIndex]);
                    }}
                    onPrevious={() => {
                        const currentIndex = filteredPhotos.findIndex(p => p.id === selectedPhoto.id);
                        const previousIndex = currentIndex === 0 ? filteredPhotos.length - 1 : currentIndex - 1;
                        setSelectedPhoto(filteredPhotos[previousIndex]);
                    }}
                />
            )}
        </div>
    );
}
