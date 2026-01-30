"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Folder,
    Plus,
    Search,
    ChevronRight,
    Loader2,
    Calendar,
    Users,
    Info,
    MoreHorizontal,
    Star,
    Share2,
    CheckCircle2,
    Clock,
    LayoutGrid,
    List,
    HeartHandshake,
    MapPin,
    Hotel,
    Building2,
    ExternalLink
} from "lucide-react";
import { useFolders } from "@/hooks/use-folders";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { PhotoBrowser } from "./photo-browser";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { WeddingForm } from "@/components/weddings/wedding-form";
import { useWeddings } from "@/hooks/use-weddings";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";

interface FolderScreenProps {
    parentId?: string | null;
    ownerId?: string;
}

export function FolderScreen({ parentId = null, ownerId }: FolderScreenProps) {
    const { folders, currentFolder, path, loading, error, createFolder } = useFolders(parentId, ownerId);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [folderSearchQuery, setFolderSearchQuery] = useState("");
    const [linkedWedding, setLinkedWedding] = useState<any>(null);
    const [isEditFormOpen, setIsEditFormOpen] = useState(false);
    const { updateWedding, getWeddingDetails } = useWeddings();
    const [fullWeddingData, setFullWeddingData] = useState<any>(null);

    // Fetch linked wedding metadata
    React.useEffect(() => {
        const fetchLinkedWedding = async () => {
            if (!parentId) {
                setLinkedWedding(null);
                return;
            }

            // 1. Try to fetch by folder_id
            const { data, error } = await supabase
                .from('weddings')
                .select('*')
                .eq('folder_id', parentId)
                .maybeSingle();

            if (data && !error) {
                setLinkedWedding(data);
            } else if (!error) {
                // 2. Self-healing: If no direct link, try matching by name if we're in the "Weddings" path
                const currentFolder = path.find(f => f.id === parentId);
                const isUnderWeddings = path.some(f => f.name.toLowerCase() === 'weddings');

                if (currentFolder && isUnderWeddings) {
                    const { data: matchedWedding } = await supabase
                        .from('weddings')
                        .select('*')
                        .eq('couple_name', currentFolder.name)
                        .is('folder_id', null) // Only auto-link if not already linked elsewhere
                        .maybeSingle();

                    if (matchedWedding) {
                        // Auto-link established!
                        await supabase
                            .from('weddings')
                            .update({ folder_id: parentId })
                            .eq('id', matchedWedding.id);

                        setLinkedWedding({ ...matchedWedding, folder_id: parentId });
                        toast.success(`Projeto vinculado automaticamente a esta pasta: ${matchedWedding.couple_name}`);
                    } else {
                        setLinkedWedding(null);
                    }
                } else {
                    setLinkedWedding(null);
                }
            } else {
                setLinkedWedding(null);
            }
        };

        fetchLinkedWedding();
    }, [parentId, path]);

    const filteredFolders = folders.filter(f =>
        f.name.toLowerCase().includes(folderSearchQuery.toLowerCase())
    );

    const handleOpenEdit = async () => {
        if (!linkedWedding) return;
        setIsEditFormOpen(true);
        try {
            const details = await getWeddingDetails(linkedWedding.id);
            setFullWeddingData(details);
        } catch (err) {
            console.error("Error fetching detailed wedding data:", err);
            toast.error("Erro ao carregar dados detalhados");
        }
    };

    const handleFormSubmit = async (data: any) => {
        try {
            await updateWedding(linkedWedding.id, data);
            toast.success("Informações atualizadas com sucesso!");
            setIsEditFormOpen(false);
            // Refresh local linked wedding data
            setLinkedWedding({ ...linkedWedding, ...data });
        } catch (err) {
            console.error("Error updating wedding:", err);
            toast.error("Erro ao atualizar informações");
        }
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        setIsCreating(true);
        try {
            await createFolder(newFolderName);
            setIsCreateModalOpen(false);
            setNewFolderName("");
            toast.success("Pasta criada com sucesso!");
        } catch (e: any) {
            console.error(e);
            toast.error("Erro ao criar pasta: " + (e.message || "Erro desconhecido"));
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <header className="border-b p-6 flex items-center justify-between gap-4" style={{ backgroundColor: 'white', borderColor: '#E0C7A0' }}>
                <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
                    {ownerId ? (
                        <span className="text-[#AF8B5F]">Ambiente Compartilhado</span>
                    ) : (
                        <Link href="/folders" className="text-slate-500 hover:text-primary transition-colors">Meus arquivos</Link>
                    )}
                    {path.length > 0 && path.map((folder) => (
                        <React.Fragment key={folder.id}>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-300 stroke-[1.5px]" />
                            {folder.id === parentId ? (
                                <span className="text-[#1A1A1A] font-medium">{folder.name}</span>
                            ) : (
                                <Link
                                    href={`/folders/${folder.id}`}
                                    className="text-slate-500 hover:text-primary transition-colors whitespace-nowrap"
                                >
                                    {folder.name}
                                </Link>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-slate-100 p-1 rounded-md border mr-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`w-7 h-7 rounded-sm ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                            onClick={() => setViewMode('grid')}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`w-7 h-7 rounded-sm ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                            onClick={() => setViewMode('list')}
                        >
                            <List className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Buscar pasta..."
                            className="pl-9 h-9"
                            value={folderSearchQuery}
                            onChange={(e) => setFolderSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="gap-2"
                        variant="outline"
                        style={{ borderColor: '#E0C7A0', color: '#AF8B5F' }}
                    >
                        <Plus className="w-4 h-4" />
                        Nova Pasta
                    </Button>
                </div>
            </header>

            {/* Folder Metadata Banner (if linked to wedding) */}
            {
                linkedWedding && (
                    <div className="bg-amber-50/40 border-b border-amber-100/60 p-6 flex flex-col md:flex-row items-center gap-6 animate-in fade-in slide-in-from-top duration-500">
                        <div className="w-16 h-16 rounded-2xl bg-white border border-amber-200 flex items-center justify-center shadow-sm shrink-0">
                            <HeartHandshake className="w-8 h-8 text-amber-600" />
                        </div>

                        <div className="flex-1 space-y-1 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-2">
                                <h2 className="text-xl font-bold text-slate-800">{linkedWedding.couple_name}</h2>
                                <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-2 py-0 text-[10px] uppercase font-bold tracking-wider">
                                    Projeto Vinculado
                                </Badge>
                            </div>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-y-2 gap-x-4 text-sm text-slate-600">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    <span>{format(new Date(linkedWedding.wedding_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                                </div>

                                {(linkedWedding.destination_city || linkedWedding.destination_country) && (
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4 text-slate-400" />
                                        <span>{[linkedWedding.destination_city, linkedWedding.destination_country].filter(Boolean).join(', ')}</span>
                                    </div>
                                )}

                                {linkedWedding.venue_name && (
                                    <div className="flex items-center gap-1.5">
                                        <Building2 className="w-4 h-4 text-slate-400" />
                                        <span>{linkedWedding.venue_name}</span>
                                    </div>
                                )}

                                {linkedWedding.hotel_name && (
                                    <div className="flex items-center gap-1.5">
                                        <Hotel className="w-4 h-4 text-slate-400" />
                                        <span>{linkedWedding.hotel_name}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Button
                            onClick={handleOpenEdit}
                            className="bg-[#AF8B5F] hover:bg-[#96764d] text-white gap-2 shadow-md hover:shadow-lg transition-all group"
                        >
                            <ExternalLink className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                            Editar Informações
                        </Button>
                    </div>
                )
            }

            {/* Edit Wedding Form Sheet */}
            <Sheet open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
                <SheetContent side="right" className="sm:max-w-[800px] h-full p-0 overflow-hidden flex flex-col">
                    <SheetHeader className="p-6 border-b bg-slate-50 shrink-0">
                        <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                            <HeartHandshake className="w-6 h-6 text-amber-600" />
                            Editar Dados do Projeto
                        </SheetTitle>
                        <SheetDescription>
                            Altere as informações do casamento e as pastas serão atualizadas automaticamente se necessário.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto min-h-0 bg-white">
                        <div className="p-6 pb-12">
                            {fullWeddingData ? (
                                <WeddingForm
                                    defaultValues={fullWeddingData}
                                    onSubmit={handleFormSubmit}
                                    weddingId={linkedWedding?.id}
                                    onAddMedia={async (media) => {
                                        const { data } = await supabase.from('portfolio_media').insert({
                                            ...media,
                                            wedding_id: linkedWedding.id,
                                            user_id: linkedWedding.user_id,
                                            folder_id: parentId // Crucial: Link to current folder
                                        }).select().single();
                                        return data;
                                    }}
                                    onDeleteMedia={async (mediaId) => {
                                        const { error } = await supabase.from('portfolio_media').delete().eq('id', mediaId);
                                        return !error;
                                    }}
                                    onUpdateMedia={async (mediaId, media) => {
                                        const { data } = await supabase.from('portfolio_media').update(media).eq('id', mediaId).select().single();
                                        return data;
                                    }}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-64">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                </div>
                            )}
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Content - Native Scroll */}
            <div className="flex-1 overflow-y-auto p-6">
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
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {filteredFolders.map(folder => (
                            <Link key={folder.id} href={`/folders/${folder.id}`}>
                                <div className="group border rounded-lg p-4 bg-white hover:shadow-md transition-all cursor-pointer flex flex-col items-center gap-3 aspect-square justify-center relative hover:-translate-y-1">
                                    <Folder className="w-12 h-12 text-amber-300 fill-amber-300/10 group-hover:text-amber-400 group-hover:fill-amber-400/20 transition-all" />
                                    <span className="text-sm font-medium text-slate-700 text-center truncate w-full px-2">
                                        {folder.name}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        {/* Table Header */}
                        <div className="grid grid-cols-[48px_1fr_200px_140px_140px_100px] items-center px-4 py-3 border-b bg-slate-50/30 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                            <div className="flex justify-center">
                                <div className="w-4 h-4 rounded-full border border-slate-300"></div>
                            </div>
                            <div className="flex items-center gap-1 cursor-pointer hover:text-slate-600 transition-colors">
                                Nome <ChevronRight className="w-3 h-3 rotate-90" />
                            </div>
                            <div className="flex items-center gap-1 cursor-pointer hover:text-slate-600 transition-colors">
                                Modificado <ChevronRight className="w-3 h-3 rotate-90" />
                            </div>
                            <div className="flex items-center gap-1 cursor-pointer hover:text-slate-600 transition-colors">
                                Tamanho do arquivo <ChevronRight className="w-3 h-3 rotate-90" />
                            </div>
                            <div className="flex items-center gap-1 cursor-pointer hover:text-slate-600 transition-colors">
                                Compartilhamento
                            </div>
                            <div className="text-right pr-4">Atividade</div>
                        </div>

                        {/* Table Body */}
                        <div className="divide-y divide-slate-100">
                            {filteredFolders.map(folder => (
                                <div
                                    key={folder.id}
                                    className="grid grid-cols-[48px_1fr_200px_140px_140px_100px] items-center px-4 py-3.5 hover:bg-slate-50/80 transition-all group cursor-pointer"
                                >
                                    <div className="flex justify-center">
                                        <div className="w-4 h-4 rounded-full border border-slate-300 group-hover:border-primary transition-colors flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-primary opacity-0 group-hover:opacity-10 transition-opacity"></div>
                                        </div>
                                    </div>

                                    <Link
                                        href={`/folders/${folder.id}`}
                                        className="flex items-center gap-3.5 min-w-0"
                                    >
                                        <Folder className="w-5 h-5 text-amber-400 fill-amber-400/20" />
                                        <span className="text-[14px] font-medium text-slate-700 truncate group-hover:text-primary transition-colors">
                                            {folder.name}
                                        </span>

                                        {/* Hover Actions */}
                                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 ml-auto mr-4 transition-all transform translate-x-2 group-hover:translate-x-0">
                                            <Button variant="ghost" size="icon" className="w-8 h-8 text-slate-400 hover:bg-slate-200/50">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="w-8 h-8 text-slate-400 hover:text-[#AF8B5F] hover:bg-slate-200/50">
                                                <Share2 className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="w-8 h-8 text-slate-400 hover:text-amber-500 hover:bg-slate-200/50">
                                                <Star className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </Link>

                                    <div className="text-[13px] text-slate-500 flex flex-col gap-0.5">
                                        <span className="font-medium">{format(new Date(folder.created_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                                        <span className="text-[11px] text-slate-400 tracking-tight">System Account</span>
                                    </div>

                                    <div className="text-[13px] text-slate-500 font-medium whitespace-nowrap">
                                        0 itens
                                    </div>

                                    <div className="flex items-center gap-2 text-[13px] text-slate-500">
                                        <span className={`w-1.5 h-1.5 rounded-full ${ownerId ? 'bg-blue-400' : 'bg-slate-300'}`}></span>
                                        {ownerId ? "Compartilhado" : "Particular"}
                                    </div>

                                    <div className="flex justify-end pr-4 opacity-0 group-hover:opacity-100 transition-all mr-1">
                                        <Clock className="w-4 h-4 text-slate-300" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-8 border-t pt-8">
                    <PhotoBrowser
                        folderId={parentId}
                        hideHeader={false}
                        title="Arquivos nesta pasta"
                        scrollable={false}
                    />
                </div>
            </div>

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
        </div >
    );
}
