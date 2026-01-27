"use client";

import { useEffect, useState } from "react";
import { WeddingForm } from "@/components/weddings/wedding-form";
import { useWeddings } from "@/hooks/use-weddings";
import { useRouter } from "next/navigation";
import { WeddingFormValues, MediaFormValues } from "@/lib/schemas/wedding";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function EditWeddingPage({ params }: { params: { id: string } }) {
    const { getWeddingDetails, updateWedding, addMedia, deleteMedia, updateMedia } = useWeddings();
    const router = useRouter();
    const [initialData, setInitialData] = useState<WeddingFormValues | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadWedding() {
            try {
                const data = await getWeddingDetails(params.id);
                if (data) {
                    // Normalize data structure for the form
                    const normalizedData = {
                        ...data,
                        vendors: data.wedding_vendors || [],
                        media: (data.media || []).map((m: any) => ({
                            ...m,
                            description: m.description || "",
                            tags: m.tags || [],
                            moment: m.moment || undefined,
                            usage_override: m.usage_override || "Liberado",
                            publication_status: m.publication_status || "Não usado"
                        }))
                    };
                    setInitialData(normalizedData);
                }
            } catch (error) {
                console.error("Failed to load wedding details", error);
            } finally {
                setLoading(false);
            }
        }
        loadWedding();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id]);

    const handleSubmit = async (data: WeddingFormValues) => {
        await updateWedding(params.id, data);
        router.push("/weddings");
    };

    // Media operations that pass the wedding ID
    const handleAddMedia = async (media: MediaFormValues) => {
        return await addMedia(params.id, media);
    };

    const handleDeleteMedia = async (mediaId: string) => {
        return await deleteMedia(mediaId);
    };

    const handleUpdateMedia = async (mediaId: string, media: Partial<MediaFormValues>) => {
        return await updateMedia(mediaId, media);
    };

    if (loading) return <div>Carregando...</div>;

    return (
        <div className="container mx-auto py-10 max-w-[95%] px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <Button
                    variant="ghost"
                    className="mb-4 pl-0 hover:bg-transparent hover:text-primary"
                    onClick={() => router.push("/weddings")}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para Casamentos
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Editar Casamento</h1>
                <p className="text-muted-foreground">Atualize as informações do evento.</p>
            </div>
            <div className="rounded-md border bg-white p-6 shadow-sm">
                {initialData && (
                    <WeddingForm
                        defaultValues={initialData}
                        onSubmit={handleSubmit}
                        weddingId={params.id}
                        onAddMedia={handleAddMedia}
                        onDeleteMedia={handleDeleteMedia}
                        onUpdateMedia={handleUpdateMedia}
                    />
                )}
            </div>
        </div>
    );
}

