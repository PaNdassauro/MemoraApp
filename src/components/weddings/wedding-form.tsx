"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FolderService } from "@/lib/services/folder-service";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

import { weddingSchema, WeddingFormValues, WeddingTypeEnum, WeddingStatusEnum, MediaFormValues } from "@/lib/schemas/wedding";
import { CoupleFields } from "./couple-fields";
import { ConsentFields } from "./consent-fields";
import { VendorFields } from "./vendor-fields";
import { MediaFields } from "./media-fields";

interface WeddingFormProps {
    defaultValues?: Partial<WeddingFormValues>;
    onSubmit: (data: WeddingFormValues) => Promise<void>;
    isLoading?: boolean;
    isNew?: boolean;
    weddingId?: string;
    onAddMedia?: (media: MediaFormValues) => Promise<any>;
    onDeleteMedia?: (mediaId: string) => Promise<boolean>;
    onUpdateMedia?: (mediaId: string, media: Partial<MediaFormValues>) => Promise<any>;
}

export function WeddingForm({ defaultValues, onSubmit, isLoading, isNew, weddingId, onAddMedia, onDeleteMedia, onUpdateMedia }: WeddingFormProps) {
    const form = useForm<WeddingFormValues>({
        resolver: zodResolver(weddingSchema) as any,
        defaultValues: {
            couple_name: "",
            wedding_date: "",
            wedding_type: "Clássico",
            status: "Em produção",
            couples: [],
            consents: [],
            vendors: [],
            media: [],
            folder_raw: "",
            folder_selection: "",
            folder_finals: "",
            hotel_name: "",
            folder_id: null,
            ...defaultValues
        },
    });

    // Helper to handle form submission with debugging
    const handleSubmit = async (data: WeddingFormValues) => {
        console.log("Submitting form data:", data);

        // AUTO-ORGANIZE: Ensure folder path exists before saving wedding
        let updatedData = { ...data };
        try {
            const pathComponents = [
                "Weddings",
                data.destination_country,
                data.destination_city,
                data.venue_name,
                data.hotel_name,
                data.couple_name
            ].filter(Boolean) as string[];

            if (pathComponents.length > 0) {
                const targetFolderId = await FolderService.ensurePath(pathComponents);
                updatedData.folder_id = targetFolderId;
            }
        } catch (err) {
            console.error("Failed to organize folders during submission:", err);
            // We continue anyway, but maybe log this
        }

        await onSubmit(updatedData);
    };

    const handleErrors = (errors: any) => {
        console.error("Form Validation Errors:", errors);
        toast.error("Verifique os campos obrigatórios (marcados em vermelho)");
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit, handleErrors)} className="space-y-8">
                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="general">Geral & Links</TabsTrigger>
                        <TabsTrigger value="governance">Pessoas & Consentimento</TabsTrigger>
                        <TabsTrigger value="vendors">Ficha Técnica</TabsTrigger>
                        <TabsTrigger value="media">
                            Mídias
                        </TabsTrigger>
                    </TabsList>

                    {/* TAB 1: GERAL */}
                    <TabsContent value="general" className="space-y-6 mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="couple_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome do Casal</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Bárbara & Rodrigo" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="wedding_date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Data do Casamento</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                {...field}
                                                value={field.value ? new Date(field.value).toISOString().split('T')[0] : ""}
                                                onChange={(e) => field.onChange(e.target.value)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="wedding_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o tipo" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {WeddingTypeEnum.options.map((option) => (
                                                    <SelectItem key={option} value={option}>
                                                        {option}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {WeddingStatusEnum.options.map((option) => (
                                                    <SelectItem key={option} value={option}>
                                                        {option}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Separator />
                        <h3 className="text-lg font-medium">Localização</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="destination_city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cidade</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Cidade" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="destination_country"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>País</FormLabel>
                                        <FormControl>
                                            <Input placeholder="País" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="venue_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Venue / Local</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nome do local" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="hotel_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Hotel (Opcional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nome do hotel" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Separator />
                        <h3 className="text-lg font-medium flex items-center gap-2">
                            Caminho de Organização
                            <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">Automático</Badge>
                        </h3>
                        <div className="bg-slate-50 p-4 rounded-lg border border-dashed border-slate-200">
                            <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium overflow-x-auto whitespace-nowrap pb-1">
                                <span className="text-slate-400">Meus arquivos</span>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                                <span>Weddings</span>
                                {form.watch("destination_country") && (
                                    <>
                                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                                        <span className="text-primary/70">{form.watch("destination_country")}</span>
                                    </>
                                )}
                                {form.watch("destination_city") && (
                                    <>
                                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                                        <span className="text-primary/70">{form.watch("destination_city")}</span>
                                    </>
                                )}
                                {form.watch("venue_name") && (
                                    <>
                                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                                        <span className="text-primary/70">{form.watch("venue_name")}</span>
                                    </>
                                )}
                                {form.watch("hotel_name") && (
                                    <>
                                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                                        <span className="text-primary/70">{form.watch("hotel_name")}</span>
                                    </>
                                )}
                                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                                <span className="text-[#AF8B5F] font-bold">{form.watch("couple_name") || "Novo Casamento"}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-2 italic">
                                * As mídias enviadas serão organizadas automaticamente nesta estrutura de pastas.
                            </p>
                        </div>

                        <Separator />
                        <h3 className="text-lg font-medium">Links (OneDrive)</h3>
                        <div className="grid grid-cols-1 gap-6">
                            <FormField
                                control={form.control}
                                name="folder_raw"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Pasta RAW</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="folder_selection"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Pasta SELEÇÃO</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="folder_finals"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Pasta FINAIS</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </TabsContent>

                    {/* TAB 2: GOVERNANCE */}
                    <TabsContent value="governance" className="space-y-8 mt-6">
                        <CoupleFields />
                        <Separator />
                        <ConsentFields />
                    </TabsContent>

                    {/* TAB 3: VENDORS */}
                    <TabsContent value="vendors" className="space-y-6 mt-6">
                        <VendorFields />
                    </TabsContent>

                    {/* TAB 4: MEDIA */}
                    <TabsContent value="media" className="space-y-6 mt-6">
                        <MediaFields
                            weddingId={weddingId}
                            onAddMedia={onAddMedia}
                            onDeleteMedia={onDeleteMedia}
                            onUpdateMedia={onUpdateMedia}
                        />
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end pt-6">
                    <Button type="submit" disabled={isLoading} size="lg">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Casamento
                    </Button>
                </div>
            </form>
        </Form>
    );
}
