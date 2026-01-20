import { ImageOff, Sparkles } from 'lucide-react';
import { PhotoCard } from './PhotoCard';
import type { Photo } from '../../types';

interface PhotoGridProps {
    photos: Photo[];
    isLoading: boolean;
    onDeletePhoto?: (id: string) => void;
}

export function PhotoGrid({ photos, isLoading, onDeletePhoto }: PhotoGridProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-6">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div
                        key={i}
                        className="aspect-square rounded-2xl bg-slate-200 animate-pulse"
                    />
                ))}
            </div>
        );
    }

    if (photos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
                <div className="relative mb-6">
                    <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                        <ImageOff className="w-12 h-12 text-slate-400" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                </div>

                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                    Nenhuma foto ainda
                </h3>
                <p className="text-slate-500 text-center max-w-md mb-6">
                    Comece a construir sua biblioteca inteligente. Faça upload de suas fotos e deixe a IA organizá-las automaticamente.
                </p>

                <div className="flex items-center gap-2 text-sm text-slate-400">
                    <div className="w-8 h-0.5 bg-slate-200 rounded" />
                    <span>Arraste fotos ou use o botão +</span>
                    <div className="w-8 h-0.5 bg-slate-200 rounded" />
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-6 stagger-children">
            {photos.map((photo) => (
                <PhotoCard
                    key={photo.id}
                    photo={photo}
                    onDelete={onDeletePhoto}
                />
            ))}
        </div>
    );
}
