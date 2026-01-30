"use client";

// Logic extracted from PhotoBrowser to avoid duplication
import { Card } from "@/components/ui/card";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, Image as ImageIcon } from "lucide-react";

export function PhotoGridContent({
    isLoading,
    filteredPhotos,
    title,
    hideHeader,
    fileInputRef,
    setSelectedPhoto,
    deletePhoto
}: any) {
    return (
        <>
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold" style={{ fontFamily: 'Poppins, sans-serif', color: '#2C3E50' }}>
                    {title}
                </h2>
                <p className="text-xs" style={{ color: '#7F8C8D' }}>
                    {isLoading ? '...' : `${filteredPhotos.length} fotos`}
                </p>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="aspect-square rounded-lg bg-slate-100 animate-pulse" />
                    ))}
                </div>
            )}

            {/* Photos Grid */}
            {!isLoading && filteredPhotos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredPhotos.map((photo: any) => (
                        <Card
                            key={photo.id}
                            className="group relative overflow-hidden cursor-pointer transition-all hover:shadow-lg border-0 bg-slate-50"
                            onClick={() => setSelectedPhoto(photo)}
                        >
                            <div className="aspect-square relative">
                                <ImageWithFallback
                                    src={photo.storage_url}
                                    alt={photo.file_name}
                                    className="w-full h-full object-cover"
                                />

                                {/* Overlay on hover */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                    <div className="flex gap-2">
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            className="h-8 w-8 rounded-full bg-white/90 hover:bg-white"
                                            onClick={(e: React.MouseEvent) => {
                                                e.stopPropagation();
                                                setSelectedPhoto(photo);
                                            }}
                                        >
                                            <Eye className="w-4 h-4 text-slate-700" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="destructive"
                                            className="h-8 w-8 rounded-full"
                                            onClick={(e: React.MouseEvent) => {
                                                e.stopPropagation();
                                                if (confirm('Deletar esta foto?')) {
                                                    deletePhoto(photo.id);
                                                }
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredPhotos.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                    <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma foto encontrada</p>
                    {hideHeader && (
                        <Button
                            variant="link"
                            className="mt-2 text-[#AF8B5F]"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            Fazer upload agora
                        </Button>
                    )}
                </div>
            )}
        </>
    );
}
