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
    FileText
} from "lucide-react";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";

interface Photo {
    id: number;
    url: string;
    category: string;
    tags: string[];
    description: string;
    date: string;
}

interface PhotoModalProps {
    photo: Photo;
    onClose: () => void;
    onNext: () => void;
    onPrevious: () => void;
}

export function PhotoModal({ photo, onClose, onNext, onPrevious }: PhotoModalProps) {
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
                                src={photo.url}
                                alt={photo.description}
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
                        <h3 className="text-xl mb-2" style={{ fontFamily: 'Poppins, sans-serif', color: '#2C3E50' }}>
                            Detalhes da Foto
                        </h3>
                        <p className="text-sm" style={{ color: '#7F8C8D' }}>
                            Metadados gerados pela IA
                        </p>
                    </div>

                    {/* Metadata Content */}
                    <ScrollArea className="flex-1 p-6">
                        <div className="space-y-6">
                            {/* Category */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Tag className="w-4 h-4" style={{ color: '#AF8B5F' }} />
                                    <h4 className="text-sm" style={{ fontFamily: 'Poppins, sans-serif', color: '#2C3E50' }}>
                                        Categoria
                                    </h4>
                                </div>
                                <Badge
                                    className="text-sm px-3 py-1"
                                    style={{ backgroundColor: '#E0C7A0', color: '#AF8B5F' }}
                                >
                                    {photo.category}
                                </Badge>
                            </div>

                            {/* Tags */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Tag className="w-4 h-4" style={{ color: '#AF8B5F' }} />
                                    <h4 className="text-sm" style={{ fontFamily: 'Poppins, sans-serif', color: '#2C3E50' }}>
                                        Tags
                                    </h4>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {photo.tags.map((tag, index) => (
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

                            {/* Description */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <FileText className="w-4 h-4" style={{ color: '#AF8B5F' }} />
                                    <h4 className="text-sm" style={{ fontFamily: 'Poppins, sans-serif', color: '#2C3E50' }}>
                                        Descrição
                                    </h4>
                                </div>
                                <p className="text-sm" style={{ color: '#7F8C8D', lineHeight: '1.6' }}>
                                    {photo.description}
                                </p>
                            </div>

                            {/* Date */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Calendar className="w-4 h-4" style={{ color: '#AF8B5F' }} />
                                    <h4 className="text-sm" style={{ fontFamily: 'Poppins, sans-serif', color: '#2C3E50' }}>
                                        Data
                                    </h4>
                                </div>
                                <p className="text-sm" style={{ color: '#7F8C8D' }}>
                                    {new Date(photo.date).toLocaleDateString('pt-BR', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>

                            {/* AI Metadata (JSON-like display) */}
                            <div>
                                <h4 className="text-sm mb-3" style={{ fontFamily: 'Poppins, sans-serif', color: '#2C3E50' }}>
                                    Metadados Completos
                                </h4>
                                <div className="p-4 rounded-lg text-xs font-mono" style={{ backgroundColor: '#F7F7F7' }}>
                                    <pre style={{ color: '#2C3E50', whiteSpace: 'pre-wrap' }}>
                                        {`{
  "id": ${photo.id},
  "category": "${photo.category}",
  "tags": [${photo.tags.map(t => `"${t}"`).join(', ')}],
  "description": "${photo.description}",
  "date": "${photo.date}",
  "aiConfidence": 0.95,
  "objects": ["person", "landscape"],
  "colors": ["blue", "green", "brown"],
  "location": "auto-detected",
  "faces": 0
}`}
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
