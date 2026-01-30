"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    HeartHandshake,
    ChevronRight,
    ArrowLeft,
    FileText,
    ClipboardList,
    Users,
    Settings
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const FORM_TYPES = [
    {
        id: "weddings",
        title: "Casamentos",
        description: "Criar novo projeto de casamento e organizar mídias.",
        icon: HeartHandshake,
        href: "/weddings/new",
        color: "bg-amber-50 text-amber-600 border-amber-200"
    },
    {
        id: "internal",
        title: "Relatórios Internos",
        description: "Formulários para controle de produção e status de projetos.",
        icon: FileText,
        href: "#",
        disabled: true,
        color: "bg-slate-50 text-slate-400 border-slate-200"
    },
    {
        id: "feedback",
        title: "Feedback de Clientes",
        description: "Coleta de depoimentos e avaliação de satisfação.",
        icon: ClipboardList,
        href: "#",
        disabled: true,
        color: "bg-slate-50 text-slate-400 border-slate-200"
    }
];

export default function FormsPage() {
    return (
        <div className="container mx-auto py-10 max-w-5xl">
            <div className="flex flex-col gap-4 mb-10">
                <Link href="/">
                    <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary mb-2">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Início
                    </Button>
                </Link>
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-[#2C3E50]">Formulários</h1>
                        <p className="text-muted-foreground mt-2 text-lg">
                            Selecione um formulário para gerenciar dados e mídias do sistema.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {FORM_TYPES.map((form) => {
                    const Icon = form.icon;
                    return (
                        <Link key={form.id} href={form.href} className={form.disabled ? "cursor-not-allowed" : ""}>
                            <Card className={`h-full transition-all duration-300 ${form.disabled ? "opacity-60 bg-slate-50 border-dashed" : "hover:shadow-lg hover:-translate-y-1 group"}`}>
                                <CardHeader>
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${form.color}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <CardTitle className="flex items-center justify-between">
                                        {form.title}
                                        {!form.disabled && <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                    </CardTitle>
                                    <CardDescription className="text-sm mt-2 leading-relaxed">
                                        {form.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {form.disabled ? (
                                        <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded uppercase font-bold text-slate-500">
                                            Em breve
                                        </span>
                                    ) : (
                                        <span className="text-[10px] bg-amber-100 px-2 py-0.5 rounded uppercase font-bold text-amber-700">
                                            Disponível
                                        </span>
                                    )}
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
