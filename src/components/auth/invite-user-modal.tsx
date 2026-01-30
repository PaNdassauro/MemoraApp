"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface InviteUserModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function InviteUserModal({ open, onOpenChange }: InviteUserModalProps) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('user_invites')
                .insert([
                    {
                        owner_id: user.id,
                        invited_email: email.toLowerCase().trim(),
                        status: 'pending',
                        role: 'viewer'
                    }
                ]);

            if (error) {
                if (error.code === '23505') {
                    throw new Error("Este usuário já foi convidado.");
                }
                throw error;
            }

            toast.success(`Convite enviado para ${email}!`);
            setEmail("");
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.message || "Erro ao enviar convite");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-[#2C3E50]">Convidar Usuário</DialogTitle>
                    <DialogDescription>
                        Envie um convite para permitir que outra pessoa acesse seus arquivos e pastas.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleInvite}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="invite-email">E-mail do convidado</Label>
                            <Input
                                id="invite-email"
                                type="email"
                                placeholder="exemplo@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-[#AF8B5F] hover:bg-[#8F6B3F] text-white"
                        >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Enviar Convite"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
