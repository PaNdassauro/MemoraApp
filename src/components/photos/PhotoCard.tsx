import { useState } from 'react';
import { Heart, Trash2, Download, MoreHorizontal, Tag } from 'lucide-react';
import type { Photo } from '../../types';

interface PhotoCardProps {
    photo: Photo;
    onDelete?: (id: string) => void;
}

export function PhotoCard({ photo, onDelete }: PhotoCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const handleFavorite = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsFavorite(!isFavorite);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onDelete) {
            onDelete(photo.id);
        }
    };

    return (
        <div
            className="photo-card relative rounded-2xl overflow-hidden bg-white shadow-sm border border-slate-100 cursor-pointer group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Image Container */}
            <div className="aspect-square relative overflow-hidden bg-slate-100">
                {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
                <img
                    src={photo.storage_url}
                    alt={photo.file_name}
                    className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'} ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setImageLoaded(true)}
                />

                {/* Overlay on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
            </div>

            {/* Quick Actions (shown on hover) */}
            <div className={`absolute top-3 right-3 flex gap-2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
                <button
                    onClick={handleFavorite}
                    className={`p-2 rounded-full backdrop-blur-md transition-all ${isFavorite ? 'bg-red-500 text-white' : 'bg-white/80 text-slate-600 hover:bg-white'}`}
                >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
                <button
                    onClick={handleDelete}
                    className="p-2 rounded-full bg-white/80 text-slate-600 hover:bg-red-500 hover:text-white backdrop-blur-md transition-all"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* Category Badge */}
            {photo.metadata?.category && (
                <div className={`absolute top-3 left-3 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
                    <span className="px-3 py-1 rounded-full bg-indigo-500/90 text-white text-xs font-medium backdrop-blur-md">
                        {photo.metadata.category}
                    </span>
                </div>
            )}

            {/* Bottom Info (shown on hover) */}
            <div className={`absolute bottom-0 left-0 right-0 p-4 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <p className="text-white text-sm font-medium truncate mb-2">{photo.file_name}</p>

                {/* Tags */}
                {photo.metadata?.tags && photo.metadata.tags.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                        <Tag className="w-3 h-3 text-white/70" />
                        {photo.metadata.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-xs text-white/80 bg-white/20 px-2 py-0.5 rounded-full">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* AI Description Tooltip */}
            {photo.metadata?.description && isHovered && (
                <div className="absolute bottom-full left-0 right-0 mb-2 p-3 bg-white rounded-lg shadow-lg mx-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <p className="text-xs text-slate-600">{photo.metadata.description}</p>
                </div>
            )}
        </div>
    );
}
