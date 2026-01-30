"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Folder,
    Plus,
    Search,
    ChevronRight,
    Loader2
} from "lucide-react";
import { useFolders } from "@/hooks/use-folders";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface FolderScreenProps {
    parentId?: string | null;
}

export function FolderScreen({ parentId = null }: FolderScreenProps) {
    const { folders, loading, error, createFolder } = useFolders(parentId);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        setIsCreating(true);
        try {
            await createFolder(newFolderName);
            setIsCreateModalOpen(false);
            setNewFolderName("");
        } catch (e) {
            console.error(e);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <header className="border-b p-6 flex items-center justify-between gap-4" style={{ backgroundColor: 'white', borderColor: '#E0C7A0' }}>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Link href="/folders" className="hover:text-primary">Minhas Pastas</Link>
                    {/* Breadcrumbs placeholder - would need full path logic */}
                    {parentId && (
                        <>
                            <ChevronRight className="w-4 h-4" />
                            <span>...</span>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Buscar pasta..."
                            className="pl-9 h-9"
                        />
                    </div>
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="gap-2"
                        style={{ backgroundColor: '#AF8B5F', color: 'white' }}
                    >
                        <Plus className="w-4 h-4" />
                        Nova Pasta
                    </Button>
                </div>
            </header>

            {/* Content */}
            <ScrollArea className="flex-1 p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : folders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Folder className="w-16 h-16 mb-4 text-slate-200" />
                        <h3 className="text-xl font-medium text-slate-700 mb-2">Nenhuma pasta ainda</h3>
                        <p className="text-slate-500 mb-6">Crie pastas para organizar suas fotos e álbuns.</p>
                        <Button
                            onClick={() => setIsCreateModalOpen(true)}
                            variant="outline"
                        >
                            Criar primeira pasta
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {folders.map(folder => (
                            <Link key={folder.id} href={`/folders/${folder.id}`}>
                                <div className="group border rounded-lg p-4 bg-white hover:shadow-md transition-all cursor-pointer flex flex-col items-center gap-3 aspect-square justify-center relative hover:-translate-y-1">
                                    <Folder className="w-12 h-12 text-amber-200 group-hover:text-amber-400 transition-colors" fill="currentColor" />
                                    <span className="text-sm font-medium text-slate-700 text-center truncate w-full px-2">
                                        {folder.name}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </ScrollArea>

            {/* Create Folder Dialog */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nova Pasta</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            placeholder="Nome da pasta"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleCreateFolder} disabled={isCreating || !newFolderName.trim()}>
                            {isCreating ? 'Criando...' : 'Criar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
