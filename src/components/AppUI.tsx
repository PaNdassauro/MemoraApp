import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Home,
    Folder,
    Heart,
    Clock,
    Trash2,
    Search,
    Upload,
    User,
    Settings,
    Tag,
    Eye,
    FolderPlus,
    Image as ImageIcon,
    X,
    Loader2,
    CheckCircle,
    HeartHandshake
} from "lucide-react";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { PhotoModal } from "@/components/PhotoModal";
import { usePhotos } from "@/hooks/usePhotos";
import { useUpload } from "@/hooks/useUpload";
import type { Photo } from "@/types";

// Category type for sidebar
interface Category {
    name: string;
    count: number;
}

export function AppUI() {
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Real hooks
    const { photos, isLoading, refetch, deletePhoto } = usePhotos();
    const { uploadFiles, uploads, isUploading, clearCompleted } = useUpload();

    // Calculate categories from real photos
    const categories: Category[] = photos.reduce((acc: Category[], photo) => {
        const category = photo.metadata?.category || "Sem Categoria";
        const existing = acc.find(c => c.name === category);
        if (existing) {
            existing.count++;
        } else {
            acc.push({ name: category, count: 1 });
        }
        return acc;
    }, []);

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
        await uploadFiles(files);

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
        <div className="h-screen flex" style={{ backgroundColor: '#F7F7F7', fontFamily: 'Inter, sans-serif' }}>
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Sidebar */}
            <aside className="w-64 border-r flex flex-col" style={{ backgroundColor: 'white', borderColor: '#E0C7A0' }}>
                {/* Logo */}
                <div className="p-6 border-b" style={{ borderColor: '#E0C7A0' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#AF8B5F' }}>
                            <Folder className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-xl" style={{ fontFamily: 'Poppins, sans-serif', color: '#2C3E50' }}>
                            Memora
                        </h1>
                    </div>
                </div>

                {/* Navigation */}
                <ScrollArea className="flex-1 p-4">
                    <nav className="space-y-2">
                        <Button variant="ghost" className="w-full justify-start gap-3 transition-transform hover:translate-x-1" style={{ color: '#2C3E50' }}>
                            <Home className="w-5 h-5" />
                            Início
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 transition-transform hover:translate-x-1"
                            style={{ color: '#7F8C8D' }}
                            onClick={() => router.push("/weddings")}
                        >
                            <HeartHandshake className="w-5 h-5" />
                            Casamentos
                        </Button>
                        <Button variant="ghost" className="w-full justify-start gap-3 transition-transform hover:translate-x-1" style={{ color: '#7F8C8D' }}>
                            <Folder className="w-5 h-5" />
                            Minhas Pastas
                        </Button>
                        <Button variant="ghost" className="w-full justify-start gap-3 transition-transform hover:translate-x-1" style={{ color: '#7F8C8D' }}>
                            <FolderPlus className="w-5 h-5" />
                            Álbuns Sugeridos
                        </Button>
                        <Button variant="ghost" className="w-full justify-start gap-3 transition-transform hover:translate-x-1" style={{ color: '#7F8C8D' }}>
                            <Heart className="w-5 h-5" />
                            Favoritos
                        </Button>
                        <Button variant="ghost" className="w-full justify-start gap-3 transition-transform hover:translate-x-1" style={{ color: '#7F8C8D' }}>
                            <Clock className="w-5 h-5" />
                            Recentes
                        </Button>
                        <Button variant="ghost" className="w-full justify-start gap-3 transition-transform hover:translate-x-1" style={{ color: '#7F8C8D' }}>
                            <Trash2 className="w-5 h-5" />
                            Lixeira
                        </Button>
                    </nav>

                    {/* Categories Section */}
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-3 px-3">
                            <h3 className="text-sm" style={{ fontFamily: 'Poppins, sans-serif', color: '#7F8C8D' }}>
                                Categorias ({categories.length})
                            </h3>
                            <Tag className="w-4 h-4" style={{ color: '#AF8B5F' }} />
                        </div>
                        <div className="space-y-1">
                            {categories.length === 0 ? (
                                <p className="text-xs text-center py-4" style={{ color: '#7F8C8D' }}>
                                    Nenhuma categoria ainda
                                </p>
                            ) : (
                                categories.map((category) => (
                                    <Button
                                        key={category.name}
                                        variant="ghost"
                                        className="w-full justify-between group"
                                        style={{ color: '#7F8C8D' }}
                                    >
                                        <span>{category.name}</span>
                                        <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#E0C7A0', color: '#AF8B5F' }}>
                                            {category.count}
                                        </span>
                                    </Button>
                                ))
                            )}
                        </div>
                    </div>
                </ScrollArea>

                {/* User Profile */}
                <div className="p-4 border-t" style={{ borderColor: '#E0C7A0' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full" style={{ backgroundColor: '#AF8B5F' }}></div>
                        <div className="flex-1">
                            <p className="text-sm" style={{ fontFamily: 'Poppins, sans-serif', color: '#2C3E50' }}>
                                Usuário
                            </p>
                            <p className="text-xs" style={{ color: '#7F8C8D' }}>
                                {photos.length} fotos
                            </p>
                        </div>
                        <Settings className="w-5 h-5 cursor-pointer" style={{ color: '#7F8C8D' }} />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="border-b p-6 flex items-center gap-4" style={{ backgroundColor: 'white', borderColor: '#E0C7A0' }}>
                    {/* Search Bar */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#7F8C8D' }} />
                        <Input
                            placeholder="Buscar por tags, categorias, descrição..."
                            value={searchQuery}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                            className="pl-10 border-2"
                            style={{ borderColor: '#E0C7A0', backgroundColor: '#F7F7F7' }}
                        />
                    </div>

                    {/* Upload Button */}
                    <Button
                        className="gap-2"
                        style={{ backgroundColor: '#AF8B5F', color: 'white' }}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload className="w-5 h-5" />
                        Upload
                    </Button>

                    {/* Profile Icon */}
                    <Button variant="ghost" className="rounded-full p-2">
                        <User className="w-6 h-6" style={{ color: '#7F8C8D' }} />
                    </Button>
                </header>

                {/* Photo Grid */}
                <ScrollArea className="flex-1 p-6">
                    <div className="mb-6">
                        <h2 className="text-2xl mb-2" style={{ fontFamily: 'Poppins, sans-serif', color: '#2C3E50' }}>
                            Todas as Fotos
                        </h2>
                        <p style={{ color: '#7F8C8D' }}>
                            {isLoading ? 'Carregando...' : `${filteredPhotos.length} foto${filteredPhotos.length !== 1 ? 's' : ''} ${searchQuery ? 'encontrada' + (filteredPhotos.length !== 1 ? 's' : '') : 'na biblioteca'}`}
                        </p>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="grid grid-cols-3 gap-4">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="aspect-square rounded-lg bg-slate-200 animate-pulse" />
                            ))}
                        </div>
                    )}

                    {/* Photos Grid */}
                    {!isLoading && filteredPhotos.length > 0 && (
                        <div className="grid grid-cols-3 gap-4">
                            {filteredPhotos.map((photo) => (
                                <Card
                                    key={photo.id}
                                    className="group relative overflow-hidden cursor-pointer transition-all hover:shadow-lg"
                                    style={{ borderColor: '#E0C7A0' }}
                                    onClick={() => setSelectedPhoto(photo)}
                                >
                                    <div className="aspect-square relative">
                                        <ImageWithFallback
                                            src={photo.storage_url}
                                            alt={photo.file_name}
                                            className="w-full h-full object-cover"
                                        />

                                        {/* Overlay on hover */}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                            <Button
                                                size="sm"
                                                className="gap-2"
                                                style={{ backgroundColor: '#AF8B5F', color: 'white' }}
                                                onClick={(e: React.MouseEvent) => {
                                                    e.stopPropagation();
                                                    setSelectedPhoto(photo);
                                                }}
                                            >
                                                <Eye className="w-4 h-4" />
                                                Visualizar
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="gap-2"
                                                style={{ borderColor: '#E0C7A0', backgroundColor: 'white', color: '#D35400' }}
                                                onClick={(e: React.MouseEvent) => {
                                                    e.stopPropagation();
                                                    if (confirm('Deletar esta foto?')) {
                                                        deletePhoto(photo.id);
                                                    }
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Deletar
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Photo Info */}
                                    <div className="p-3" style={{ backgroundColor: 'white' }}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#E0C7A0', color: '#AF8B5F' }}>
                                                {photo.metadata?.category || "Processando..."}
                                            </span>
                                        </div>
                                        <p className="text-sm truncate" style={{ color: '#2C3E50' }}>
                                            {photo.metadata?.description || photo.file_name}
                                        </p>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && filteredPhotos.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <ImageIcon className="w-24 h-24 mb-4" style={{ color: '#E0C7A0' }} />
                            <h3 className="text-xl mb-2" style={{ fontFamily: 'Poppins, sans-serif', color: '#2C3E50' }}>
                                {searchQuery ? 'Nenhuma foto encontrada' : 'Nenhuma foto ainda'}
                            </h3>
                            <p className="mb-6" style={{ color: '#7F8C8D' }}>
                                {searchQuery ? 'Tente uma busca diferente' : 'Faça upload das suas primeiras memórias'}
                            </p>
                            {!searchQuery && (
                                <Button
                                    className="gap-2"
                                    style={{ backgroundColor: '#AF8B5F', color: 'white' }}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload className="w-5 h-5" />
                                    Upload de Fotos
                                </Button>
                            )}
                        </div>
                    )}
                </ScrollArea>
            </main>

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
                                    As imagens serão processadas pela IA
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
                                        Fotos selecionadas ({previews.length})
                                    </h3>
                                    <div className="grid grid-cols-3 gap-2">
                                        {previews.map((preview, index) => (
                                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                                                <img src={preview.url} alt="" className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => removePreview(index)}
                                                    className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white"
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
                                        Fazer Upload
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
