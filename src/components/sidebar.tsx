"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Home,
    Folder,
    Heart,
    Clock,
    Trash2,
    HeartHandshake,
    Settings,
    Tag,
    FolderPlus
} from "lucide-react";

// You might want to pass categories as props or fetch them here
interface SidebarProps {
    categories?: { name: string; count: number }[];
    photoCount?: number;
}

export function Sidebar({ categories = [], photoCount = 0 }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const isActive = (path: string) => pathname === path || pathname?.startsWith(path + "/");

    return (
        <aside className="w-64 border-r flex flex-col h-full bg-white" style={{ borderColor: '#E0C7A0' }}>
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
                    <Link href="/" className="block w-full">
                        <Button
                            variant="ghost"
                            className={`w-full justify-start gap-3 transition-transform hover:translate-x-1 ${isActive('/') && pathname === '/' ? 'bg-slate-100 font-medium' : ''}`}
                            style={{ color: '#2C3E50' }}
                        >
                            <Home className="w-5 h-5" />
                            Início
                        </Button>
                    </Link>

                    <Link href="/weddings" className="block w-full">
                        <Button
                            variant="ghost"
                            className={`w-full justify-start gap-3 transition-transform hover:translate-x-1 ${isActive('/weddings') ? 'bg-amber-50/50 hover:bg-amber-50' : ''}`}
                            style={{ color: isActive('/weddings') ? '#AF8B5F' : '#7F8C8D' }}
                        >
                            <HeartHandshake className="w-5 h-5" />
                            Casamentos
                        </Button>
                    </Link>

                    <Link href="/folders" className="block w-full">
                        <Button
                            variant="ghost"
                            className={`w-full justify-start gap-3 transition-transform hover:translate-x-1 ${isActive('/folders') ? 'bg-slate-100 font-medium' : ''}`}
                            style={{ color: '#7F8C8D' }}
                        >
                            <Folder className="w-5 h-5" />
                            Minhas Pastas
                        </Button>
                    </Link>

                    <Link href="/favorites" className="block w-full">
                        <Button variant="ghost" className="w-full justify-start gap-3 transition-transform hover:translate-x-1" style={{ color: '#7F8C8D' }}>
                            <Heart className="w-5 h-5" />
                            Favoritos
                        </Button>
                    </Link>

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
                            {photoCount} fotos
                        </p>
                    </div>
                    <Settings className="w-5 h-5 cursor-pointer" style={{ color: '#7F8C8D' }} />
                </div>
            </div>
        </aside>
    );
}
