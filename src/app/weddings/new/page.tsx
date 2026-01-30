"use client";

import { WeddingForm } from "@/components/weddings/wedding-form";
import { useWeddings } from "@/hooks/use-weddings";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";

export default function NewWeddingPage() {
    const { createWedding } = useWeddings();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: any) => {
        try {
            setIsSubmitting(true);
            const wedding = await createWedding(data);
            toast.success("Casamento criado com sucesso!");
            router.push(`/weddings/${wedding.id}`);
        } catch (error: any) {
            console.error("Failed to create wedding:", error);
            toast.error(error.message || "Erro ao criar casamento. Verifique os logs.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto py-10 max-w-2xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Novo Casamento</h1>
                <p className="text-muted-foreground">Adicione um novo evento ao portfólio.</p>
            </div>
            <div className="rounded-md border bg-white p-6 shadow-sm">
                <WeddingForm onSubmit={handleSubmit} isLoading={isSubmitting} isNew />
            </div>
        </div>
    );
}
