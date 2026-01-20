import { useState } from "react";
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
    Edit,
    FolderPlus,
    Image as ImageIcon
} from "lucide-react";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { PhotoModal } from "@/components/PhotoModal";

// Mock data for photos
const mockPhotos = [
    {
        id: 1,
        url: "https://images.unsplash.com/photo-1627353802139-9820d31b6a7c?w=400",
        category: "Família",
        tags: ["reunião", "família", "2024"],
        description: "Reunião de família no final de semana",
        date: "2024-01-15"
    },
    {
        id: 2,
        url: "https://images.unsplash.com/photo-1722173205783-d602329f0743?w=400",
        category: "Viagem",
        tags: ["praia", "verão", "férias"],
        description: "Férias na praia durante o verão",
        date: "2024-02-20"
    },
    {
        id: 3,
        url: "https://images.unsplash.com/photo-1762449871048-9e9232cc6990?w=400",
        category: "Trabalho",
        tags: ["escritório", "reunião", "projeto"],
        description: "Reunião de equipe no escritório",
        date: "2024-03-10"
    },
    {
        id: 4,
        url: "https://images.unsplash.com/photo-1568952738892-6051f71c2689?w=400",
        category: "Natureza",
        tags: ["montanha", "paisagem", "aventura"],
        description: "Trilha nas montanhas",
        date: "2024-04-05"
    },
    {
        id: 5,
        url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
        category: "Natureza",
        tags: ["lago", "montanha", "natureza"],
        description: "Vista do lago ao entardecer",
        date: "2024-04-06"
    },
    {
        id: 6,
        url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400",
        category: "Viagem",
        tags: ["estrada", "aventura", "viagem"],
        description: "Road trip pelo interior",
        date: "2024-05-12"
    },
    {
        id: 7,
        url: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400",
        category: "Família",
        tags: ["casa", "quintal", "família"],
        description: "Churrasco em família",
        date: "2024-06-18"
    },
    {
        id: 8,
        url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400",
        category: "Viagem",
        tags: ["lago", "barco", "passeio"],
        description: "Passeio de barco no lago",
        date: "2024-07-22"
    },
    {
        id: 9,
        url: "https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=400",
        category: "Natureza",
        tags: ["floresta", "trilha", "verde"],
        description: "Caminhada na floresta",
        date: "2024-08-14"
    }
];

const categories = [
    { name: "Família", count: 45 },
    { name: "Viagem", count: 128 },
    { name: "Trabalho", count: 32 },
    { name: "Natureza", count: 67 },
    { name: "Eventos", count: 23 }
];

export function AppUI() {
    const [selectedPhoto, setSelectedPhoto] = useState<typeof mockPhotos[0] | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="h-screen flex" style={{ backgroundColor: '#F7F7F7', fontFamily: 'Inter, sans-serif' }}>
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
                        <Button variant="ghost" className="w-full justify-start gap-3" style={{ color: '#2C3E50' }}>
                            <Home className="w-5 h-5" />
                            Início
                        </Button>
                        <Button variant="ghost" className="w-full justify-start gap-3" style={{ color: '#7F8C8D' }}>
                            <Folder className="w-5 h-5" />
                            Minhas Pastas
                        </Button>
                        <Button variant="ghost" className="w-full justify-start gap-3" style={{ color: '#7F8C8D' }}>
                            <FolderPlus className="w-5 h-5" />
                            Álbuns Sugeridos
                        </Button>
                        <Button variant="ghost" className="w-full justify-start gap-3" style={{ color: '#7F8C8D' }}>
                            <Heart className="w-5 h-5" />
                            Favoritos
                        </Button>
                        <Button variant="ghost" className="w-full justify-start gap-3" style={{ color: '#7F8C8D' }}>
                            <Clock className="w-5 h-5" />
                            Recentes
                        </Button>
                        <Button variant="ghost" className="w-full justify-start gap-3" style={{ color: '#7F8C8D' }}>
                            <Trash2 className="w-5 h-5" />
                            Lixeira
                        </Button>
                    </nav>

                    {/* Categories Section */}
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-3 px-3">
                            <h3 className="text-sm" style={{ fontFamily: 'Poppins, sans-serif', color: '#7F8C8D' }}>
                                Categorias
                            </h3>
                            <Tag className="w-4 h-4" style={{ color: '#AF8B5F' }} />
                        </div>
                        <div className="space-y-1">
                            {categories.map((category) => (
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
                            ))}
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
                                usuario@email.com
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
                            placeholder="Buscar memórias..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 border-2"
                            style={{ borderColor: '#E0C7A0', backgroundColor: '#F7F7F7' }}
                        />
                    </div>

                    {/* Upload Button */}
                    <Button className="gap-2" style={{ backgroundColor: '#AF8B5F', color: 'white' }}>
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
                            {mockPhotos.length} fotos organizadas automaticamente pela IA
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {mockPhotos.map((photo) => (
                            <Card
                                key={photo.id}
                                className="group relative overflow-hidden cursor-pointer transition-all hover:shadow-lg"
                                style={{ borderColor: '#E0C7A0' }}
                                onClick={() => setSelectedPhoto(photo)}
                            >
                                <div className="aspect-square relative">
                                    <ImageWithFallback
                                        src={photo.url}
                                        alt={photo.description}
                                        className="w-full h-full object-cover"
                                    />

                                    {/* Overlay on hover */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                        <Button
                                            size="sm"
                                            className="gap-2"
                                            style={{ backgroundColor: '#AF8B5F', color: 'white' }}
                                            onClick={(e) => {
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
                                            style={{ borderColor: '#E0C7A0', backgroundColor: 'white', color: '#AF8B5F' }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Edit className="w-4 h-4" />
                                            Editar Tags
                                        </Button>
                                    </div>
                                </div>

                                {/* Photo Info */}
                                <div className="p-3" style={{ backgroundColor: 'white' }}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#E0C7A0', color: '#AF8B5F' }}>
                                            {photo.category}
                                        </span>
                                    </div>
                                    <p className="text-sm truncate" style={{ color: '#2C3E50' }}>
                                        {photo.description}
                                    </p>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Empty State */}
                    {mockPhotos.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <ImageIcon className="w-24 h-24 mb-4" style={{ color: '#E0C7A0' }} />
                            <h3 className="text-xl mb-2" style={{ fontFamily: 'Poppins, sans-serif', color: '#2C3E50' }}>
                                Nenhuma foto ainda
                            </h3>
                            <p className="mb-6" style={{ color: '#7F8C8D' }}>
                                Faça upload das suas primeiras memórias
                            </p>
                            <Button className="gap-2" style={{ backgroundColor: '#AF8B5F', color: 'white' }}>
                                <Upload className="w-5 h-5" />
                                Upload de Fotos
                            </Button>
                        </div>
                    )}
                </ScrollArea>
            </main>

            {/* Photo Modal */}
            {selectedPhoto && (
                <PhotoModal
                    photo={selectedPhoto}
                    onClose={() => setSelectedPhoto(null)}
                    onNext={() => {
                        const currentIndex = mockPhotos.findIndex(p => p.id === selectedPhoto.id);
                        const nextIndex = (currentIndex + 1) % mockPhotos.length;
                        setSelectedPhoto(mockPhotos[nextIndex]);
                    }}
                    onPrevious={() => {
                        const currentIndex = mockPhotos.findIndex(p => p.id === selectedPhoto.id);
                        const previousIndex = currentIndex === 0 ? mockPhotos.length - 1 : currentIndex - 1;
                        setSelectedPhoto(mockPhotos[previousIndex]);
                    }}
                />
            )}
        </div>
    );
}
