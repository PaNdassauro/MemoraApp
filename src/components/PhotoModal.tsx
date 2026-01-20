import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
    X,
    ChevronLeft,
    ChevronRight,
    Download,
    Trash2,
    FolderPlus,
    Share2,
    Calendar,
    Tag,
    FileText,
    Palette,
    Sparkles
} from "lucide-react";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import type { Photo, AIMetadata } from "@/types";

interface PhotoModalProps {
    photo: Photo;
    onClose: () => void;
    onNext: () => void;
    onPrevious: () => void;
}

export function PhotoModal({ photo, onClose, onNext, onPrevious }: PhotoModalProps) {
    const metadata: AIMetadata = photo.metadata || {
        category: "Sem categoria",
        tags: [],
        description: photo.file_name
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="w-full max-w-7xl h-[90vh] flex gap-4">
                {/* Main Photo Area */}
                <div className="flex-1 flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="rounded-full"
                                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white' }}
                            >
                                <X className="w-6 h-6" />
                            </Button>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full"
                                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white' }}
                                onClick={() => window.open(photo.storage_url, '_blank')}
                            >
                                <Download className="w-5 h-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full"
                                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white' }}
                            >
                                <Share2 className="w-5 h-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full"
                                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white' }}
                            >
                                <FolderPlus className="w-5 h-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full"
                                style={{ backgroundColor: 'rgba(211, 84, 0, 0.2)', color: '#D35400' }}
                            >
                                <Trash2 className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Photo Display */}
                    <div className="flex-1 relative flex items-center justify-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onPrevious}
                            className="absolute left-4 z-10 rounded-full"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white' }}
                        >
                            <ChevronLeft className="w-8 h-8" />
                        </Button>

                        <div className="max-h-full max-w-full flex items-center justify-center">
                            <ImageWithFallback
                                src={photo.storage_url}
                                alt={photo.file_name}
                                className="max-h-[calc(90vh-120px)] max-w-full object-contain rounded-lg"
                            />
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onNext}
                            className="absolute right-4 z-10 rounded-full"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white' }}
                        >
                            <ChevronRight className="w-8 h-8" />
                        </Button>
                    </div>
                </div>

                {/* Sidebar with Metadata */}
                <Card className="w-96 flex flex-col" style={{ backgroundColor: 'white' }}>
                    {/* Header */}
                    <div className="p-6 border-b" style={{ borderColor: '#E0C7A0' }}>
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-5 h-5" style={{ color: '#AF8B5F' }} />
                            <h3 className="text-xl" style={{ fontFamily: 'Poppins, sans-serif', color: '#2C3E50' }}>
                                Metadados da IA
                            </h3>
                        </div>
                        <p className="text-sm" style={{ color: '#7F8C8D' }}>
                            {photo.file_name}
                        </p>
                    </div>

                    {/* Metadata Content */}
                    <ScrollArea className="flex-1 p-6">
                        <div className="space-y-6">
                            {/* Category */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Tag className="w-4 h-4" style={{ color: '#AF8B5F' }} />
                                    <h4 className="text-sm font-medium" style={{ color: '#2C3E50' }}>
                                        Categoria
                                    </h4>
                                </div>
                                <Badge
                                    className="text-sm px-3 py-1"
                                    style={{ backgroundColor: '#E0C7A0', color: '#AF8B5F' }}
                                >
                                    {metadata.category}
                                </Badge>
                            </div>

                            {/* Tags */}
                            {metadata.tags && metadata.tags.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Tag className="w-4 h-4" style={{ color: '#AF8B5F' }} />
                                        <h4 className="text-sm font-medium" style={{ color: '#2C3E50' }}>
                                            Tags
                                        </h4>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {metadata.tags.map((tag, index) => (
                                            <Badge
                                                key={index}
                                                variant="outline"
                                                className="text-sm"
                                                style={{ borderColor: '#AF8B5F', color: '#AF8B5F' }}
                                            >
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Description */}
                            {metadata.description && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <FileText className="w-4 h-4" style={{ color: '#AF8B5F' }} />
                                        <h4 className="text-sm font-medium" style={{ color: '#2C3E50' }}>
                                            Descrição
                                        </h4>
                                    </div>
                                    <p className="text-sm" style={{ color: '#7F8C8D', lineHeight: '1.6' }}>
                                        {metadata.description}
                                    </p>
                                </div>
                            )}

                            {/* Colors */}
                            {metadata.colors && metadata.colors.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Palette className="w-4 h-4" style={{ color: '#AF8B5F' }} />
                                        <h4 className="text-sm font-medium" style={{ color: '#2C3E50' }}>
                                            Cores Dominantes
                                        </h4>
                                    </div>
                                    <div className="flex gap-2">
                                        {metadata.colors.map((color, index) => (
                                            <div
                                                key={index}
                                                className="w-8 h-8 rounded-lg shadow-sm border"
                                                style={{ backgroundColor: color, borderColor: '#E0C7A0' }}
                                                title={color}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Date */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Calendar className="w-4 h-4" style={{ color: '#AF8B5F' }} />
                                    <h4 className="text-sm font-medium" style={{ color: '#2C3E50' }}>
                                        Data de Upload
                                    </h4>
                                </div>
                                <p className="text-sm" style={{ color: '#7F8C8D' }}>
                                    {new Date(photo.created_at).toLocaleDateString('pt-BR', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>

                            {/* Confidence */}
                            {metadata.confidence !== undefined && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Sparkles className="w-4 h-4" style={{ color: '#AF8B5F' }} />
                                        <h4 className="text-sm font-medium" style={{ color: '#2C3E50' }}>
                                            Confiança da IA
                                        </h4>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: '#E0C7A0' }}>
                                            <div
                                                className="h-full rounded-full"
                                                style={{
                                                    width: `${Math.round(metadata.confidence * 100)}%`,
                                                    backgroundColor: '#AF8B5F'
                                                }}
                                            />
                                        </div>
                                        <span className="text-sm font-medium" style={{ color: '#AF8B5F' }}>
                                            {Math.round(metadata.confidence * 100)}%
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Raw JSON */}
                            <div>
                                <h4 className="text-sm font-medium mb-3" style={{ color: '#2C3E50' }}>
                                    JSON Completo
                                </h4>
                                <div className="p-4 rounded-lg text-xs font-mono overflow-x-auto" style={{ backgroundColor: '#F7F7F7' }}>
                                    <pre style={{ color: '#2C3E50', whiteSpace: 'pre-wrap' }}>
                                        {JSON.stringify(metadata, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>

                    {/* Footer Actions */}
                    <div className="p-4 border-t" style={{ borderColor: '#E0C7A0' }}>
                        <Button
                            className="w-full"
                            style={{ backgroundColor: '#AF8B5F', color: 'white' }}
                        >
                            Editar Metadados
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
