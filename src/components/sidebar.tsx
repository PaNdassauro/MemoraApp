"use client";

import React, { useState, useEffect, useCallback } from "react";
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
    FolderPlus,
    Users,
    LogOut
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import { InviteUserModal } from "./auth/invite-user-modal";
import { toast } from "sonner";

// You might want to pass categories as props or fetch them here
interface SidebarProps {
    categories?: { name: string; count: number }[];
    photoCount?: number;
}

export function Sidebar({ categories = [], photoCount = 0 }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, signOut } = useAuth();
    const [sharedEnvironments, setSharedEnvironments] = useState<{ email: string, id: string }[]>([]);
    const [pendingInvites, setPendingInvites] = useState<{ id: string, owner_email: string }[]>([]);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    const fetchData = useCallback(async () => {
        if (!user) return;

        // Shared accepted
        const { data: shared } = await supabase
            .from('user_invites')
            .select('owner_id, owner:owner_id(email)')
            .eq('invited_user_id', user.id)
            .eq('status', 'accepted');

        if (shared) {
            setSharedEnvironments(shared.map((item: any) => ({
                email: item.owner?.email || 'Unknown',
                id: item.owner_id
            })));
        }

        // Pending invites
        const { data: pending } = await supabase
            .from('user_invites')
            .select('id, owner:owner_id(email)')
            .eq('invited_email', user.email)
            .eq('status', 'pending');

        if (pending) {
            setPendingInvites(pending.map((item: any) => ({
                id: item.id,
                owner_email: item.owner?.email || 'Unknown'
            })));
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAcceptInvite = async (inviteId: string) => {
        if (!user) return;
        try {
            const { error } = await supabase
                .from('user_invites')
                .update({
                    status: 'accepted',
                    invited_user_id: user.id
                })
                .eq('id', inviteId);

            if (error) throw error;
            toast.success("Convite aceito!");
            fetchData();
        } catch (error: any) {
            toast.error("Erro ao aceitar convite");
        }
    };

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

                    <Link href="/forms" className="block w-full">
                        <Button
                            variant="ghost"
                            className={`w-full justify-start gap-3 transition-transform hover:translate-x-1 ${isActive('/forms') ? 'bg-amber-50/50 hover:bg-amber-50 text-[#AF8B5F]' : 'text-[#7F8C8D]'}`}
                        >
                            <Tag className="w-5 h-5" />
                            Formulários
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

                {/* Shared Environments */}
                {sharedEnvironments.length > 0 && (
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-3 px-3">
                            <h3 className="text-sm" style={{ fontFamily: 'Poppins, sans-serif', color: '#7F8C8D' }}>
                                Compartilhados ({sharedEnvironments.length})
                            </h3>
                            <Users className="w-4 h-4" style={{ color: '#AF8B5F' }} />
                        </div>
                        <div className="space-y-1">
                            {sharedEnvironments.map((env) => (
                                <Link key={env.id} href={`/shared/${env.id}`} className="block w-full">
                                    <Button
                                        variant="ghost"
                                        className={`w-full justify-start gap-3 transition-transform hover:translate-x-1 ${isActive(`/shared/${env.id}`) ? 'bg-slate-100 font-medium' : ''}`}
                                        style={{ color: '#7F8C8D' }}
                                    >
                                        <div className="w-2 h-2 rounded-full bg-green-400" />
                                        <span className="truncate">{env.email.split('@')[0]}</span>
                                    </Button>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Pending Invites */}
                {pendingInvites.length > 0 && (
                    <div className="mt-8 bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                        <h3 className="text-xs font-semibold mb-2 text-amber-800 uppercase tracking-wider">
                            Convites Pendentes
                        </h3>
                        <div className="space-y-2">
                            {pendingInvites.map((invite) => (
                                <div key={invite.id} className="text-xs space-y-2">
                                    <p className="text-slate-600 truncate">{invite.owner_email}</p>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-full h-7 bg-white text-emerald-600 border-emerald-100 hover:bg-emerald-50 hover:text-emerald-700"
                                        onClick={() => handleAcceptInvite(invite.id)}
                                    >
                                        Aceitar
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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
                <div className="flex flex-col gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start gap-2 border-[#E0C7A0] text-[#7F8C8D] hover:bg-slate-50"
                        onClick={() => setIsInviteModalOpen(true)}
                    >
                        <HeartHandshake className="w-4 h-4" />
                        Convidar Usuário
                    </Button>

                    <InviteUserModal
                        open={isInviteModalOpen}
                        onOpenChange={setIsInviteModalOpen}
                    />

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: '#AF8B5F' }}>
                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium truncate" style={{ color: '#2C3E50' }}>
                                {user?.email?.split('@')[0] || 'Usuário'}
                            </p>
                            <p className="text-xs truncate" style={{ color: '#7F8C8D' }}>
                                {user?.email}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-[#7F8C8D]"
                            onClick={() => signOut()}
                            title="Sair"
                        >
                            <Settings className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </aside>
    );
}
