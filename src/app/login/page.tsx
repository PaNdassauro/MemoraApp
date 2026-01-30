"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            router.push("/");
        }
    }, [user, router]);

    if (user) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            toast.success("Login realizado com sucesso!");
            router.push("/");
        } catch (error: any) {
            toast.error(error.message || "Erro ao fazer login");
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
            toast.success("Cadastro realizado! Verifique seu e-mail.");
        } catch (error: any) {
            toast.error(error.message || "Erro ao criar conta");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#F7F7F7] p-4 font-sans">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-[#2C3E50]">Memora</h1>
                    <p className="mt-2 text-slate-500">Gerenciador Inteligente de Ativos</p>
                </div>

                <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1">
                        <TabsTrigger value="login" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Login</TabsTrigger>
                        <TabsTrigger value="signup" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Cadastro</TabsTrigger>
                    </TabsList>

                    <TabsContent value="login" className="mt-4">
                        <Card className="border-[#E0C7A0] shadow-xl">
                            <CardHeader>
                                <CardTitle className="text-2xl text-[#2C3E50]">Bem-vindo de volta</CardTitle>
                                <CardDescription>Acesse sua conta para gerenciar seus ativos.</CardDescription>
                            </CardHeader>
                            <form onSubmit={handleSignIn}>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">E-mail</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="seu@email.com"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password">Senha</Label>
                                            <Button variant="link" className="h-auto p-0 text-xs text-[#AF8B5F]">Esqueceu a senha?</Button>
                                        </div>
                                        <Input
                                            id="password"
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        className="w-full bg-[#2C3E50] hover:bg-[#1A252F] text-white"
                                        type="submit"
                                        disabled={loading}
                                    >
                                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Entrar"}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </TabsContent>

                    <TabsContent value="signup" className="mt-4">
                        <Card className="border-[#E0C7A0] shadow-xl">
                            <CardHeader>
                                <CardTitle className="text-2xl text-[#2C3E50]">Criar Conta</CardTitle>
                                <CardDescription>Comece a organizar seus ativos hoje mesmo.</CardDescription>
                            </CardHeader>
                            <form onSubmit={handleSignUp}>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-email">E-mail</Label>
                                        <Input
                                            id="signup-email"
                                            type="email"
                                            placeholder="seu@email.com"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-password">Senha</Label>
                                        <Input
                                            id="signup-password"
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        className="w-full bg-[#AF8B5F] hover:bg-[#8F6B3F] text-white"
                                        type="submit"
                                        disabled={loading}
                                    >
                                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Criar Conta"}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </TabsContent>
                </Tabs>

                <p className="text-center text-xs text-slate-400">
                    Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade.
                </p>
            </div>
        </div>
    );
}
