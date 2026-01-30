"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, AlertTriangle, Star, Wand2, Loader2, X, Upload, Clock, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { uploadMedia } from "@/app/actions/upload-media";
import { useRef, useState } from "react";
import {
    MediaMomentEnum,
    UsageOverrideEnum,
    RiskFlagEnum,
    PublicationStatusEnum,
    MediaMoment,
    RiskFlag,
    WeddingFormValues,
    MediaFormValues,
} from "@/lib/schemas/wedding";
import { cn } from "@/lib/utils";
import { analyzeMedia, WeddingContext } from "@/app/actions/analyze-media";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { FolderService } from "@/lib/services/folder-service";
import { Badge } from "@/components/ui/badge";

interface MediaFieldsProps {
    weddingId?: string;
    onAddMedia?: (media: MediaFormValues) => Promise<any>;
    onDeleteMedia?: (mediaId: string) => Promise<boolean>;
    onUpdateMedia?: (mediaId: string, media: Partial<MediaFormValues>) => Promise<any>;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function MediaFields({ weddingId, onAddMedia, onDeleteMedia, onUpdateMedia }: MediaFieldsProps) {
    const { control, setValue, getValues } = useFormContext<WeddingFormValues>();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "media",
    });

    // Tracking states
    const [uploadingIndices, setUploadingIndices] = useState<Set<number>>(new Set());
    const [analyzingIndices, setAnalyzingIndices] = useState<Set<number>>(new Set());
    const [savingIndices, setSavingIndices] = useState<Set<number>>(new Set());
    const [queuedIndices, setQueuedIndices] = useState<Set<number>>(new Set());
    const [completedIndices, setCompletedIndices] = useState<Set<number>>(new Set());
    const bulkFileInputRef = useRef<HTMLInputElement>(null);

    const toggleIndex = (setter: React.Dispatch<React.SetStateAction<Set<number>>>, index: number, active: boolean) => {
        setter(prev => {
            const next = new Set(prev);
            if (active) next.add(index);
            else next.delete(index);
            return next;
        });
    };

    const buildWeddingContext = (): WeddingContext => {
        const formValues = getValues();
        return {
            couple_name: formValues.couple_name || "",
            wedding_date: formValues.wedding_date || "",
            venue_name: formValues.venue_name || "",
            destination_city: formValues.destination_city || "",
            destination_country: formValues.destination_country || "",
            wedding_type: formValues.wedding_type || "",
            vendors: formValues.vendors?.map((v: any) => v.role_in_event || v.vendor_id).filter(Boolean) as string[] | undefined,
        };
    };

    const handleFileUpload = async (index: number, file: File) => {
        toggleIndex(setQueuedIndices, index, false);
        toggleIndex(setUploadingIndices, index, true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            // 1. UPLOAD
            const uploadResult = await uploadMedia(formData);
            if (!uploadResult.success || !uploadResult.url) {
                throw new Error(uploadResult.error || "Upload falhou");
            }

            const publicUrl = uploadResult.url;
            setValue(`media.${index}.file_url`, publicUrl);
            toggleIndex(setUploadingIndices, index, false);

            // 2. FOLDER ORGANIZATION
            let targetFolderId = null;
            try {
                const values = getValues();
                const pathComponents = [
                    "Weddings",
                    values.destination_country,
                    values.destination_city,
                    values.venue_name,
                    values.hotel_name,
                    values.couple_name
                ].filter(Boolean) as string[];

                if (pathComponents.length > 0) {
                    targetFolderId = await FolderService.ensurePath(pathComponents);
                    setValue(`media.${index}.folder_id`, targetFolderId);
                }
            } catch (err) {
                console.error("Folder error:", err);
            }

            // 3. AI ANALYSIS (WITH LONGER DELAY & RETRY)
            // Wait 3 seconds to ensure storage propagation
            await sleep(3000);
            const analysisResult = await handleAnalyzeResilient(index, publicUrl);

            // 4. PERSISTENCE
            if (weddingId && onAddMedia) {
                toggleIndex(setSavingIndices, index, true);
                const currentMedia = getValues(`media.${index}`);
                const savedMedia = await onAddMedia({
                    ...currentMedia,
                    file_url: publicUrl,
                    moment: (analysisResult?.moment as MediaMoment) || currentMedia.moment || "Outro",
                    tags: analysisResult?.tags || currentMedia.tags || [],
                    risk_flags: (analysisResult?.risk_flags as RiskFlag[]) || currentMedia.risk_flags || [],
                    folder_id: targetFolderId || currentMedia.folder_id || ""
                });

                if (savedMedia?.id) {
                    setValue(`media.${index}.id`, savedMedia.id);
                }
                toggleIndex(setSavingIndices, index, false);
            }

            toggleIndex(setCompletedIndices, index, true);
            toast.success(`Mídia ${index + 1} concluída!`);

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
            toast.error(`Falha na mídia ${index + 1}: ${errorMessage}`);
            console.error(error);
            toggleIndex(setUploadingIndices, index, false);
            toggleIndex(setSavingIndices, index, false);
            toggleIndex(setAnalyzingIndices, index, false);
        }
    };

    const handleBulkUpload = async (files: FileList) => {
        const startIndex = fields.length;
        const fileArray = Array.from(files);

        // STABLE PRE-ALLOCATION
        fileArray.forEach((_, i) => {
            append({
                file_url: "",
                type: "Foto",
                moment: "Festa",
                usage_override: "Liberado",
                publication_status: "Selecionado",
                risk_flags: [],
                is_hero: false,
                tags: [],
                description: "",
                folder_id: ""
            });
            toggleIndex(setQueuedIndices, startIndex + i, true);
        });

        // SEQUENTIAL PROCESSING
        for (let i = 0; i < fileArray.length; i++) {
            await handleFileUpload(startIndex + i, fileArray[i]);
        }
    };

    const handleRemoveMedia = async (index: number) => {
        const mediaItem = getValues(`media.${index}`);
        if (mediaItem.id && onDeleteMedia) {
            try {
                await onDeleteMedia(mediaItem.id);
                toast.success("Removido.");
            } catch (error) {
                toast.error("Erro ao remover.");
                console.error(error);
                return;
            }
        }
        remove(index);
    };

    const handleAnalyzeResilient = async (index: number, url: string, retries = 2) => {
        if (!url) return null;
        toggleIndex(setAnalyzingIndices, index, true);

        try {
            const context = buildWeddingContext();
            const result = await analyzeMedia(url, context);

            if (!result.success || !result.data) {
                // Check if it's a fetch/timeout error (OpenAI status 400 with invalid_image_url often means it's not ready)
                const isFetchError = result.error?.toLowerCase().includes("timeout") ||
                    result.error?.toLowerCase().includes("download") ||
                    result.error?.toLowerCase().includes("400");

                if (retries > 0 && isFetchError) {
                    console.log(`Retrying AI analysis for index ${index} (${retries} left)...`);
                    await sleep(4000); // 4s extra wait
                    toggleIndex(setAnalyzingIndices, index, false);
                    return handleAnalyzeResilient(index, url, retries - 1);
                }
                throw new Error(result.error);
            }

            const { data } = result;
            setValue(`media.${index}.description`, data.description || "");
            setValue(`media.${index}.tags`, data.tags || []);
            setValue(`media.${index}.moment`, (data.moment as MediaMoment) || "Outro");
            setValue(`media.${index}.risk_flags`, (data.risk_flags as RiskFlag[]) || []);

            return data;
        } catch (error) {
            console.error("AI Error:", error);
            return null;
        } finally {
            toggleIndex(setAnalyzingIndices, index, false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Mídias & Governança</h3>
                <div className="flex gap-2">
                    {queuedIndices.size > 0 && (
                        <div className="flex items-center gap-2 text-amber-600 animate-pulse text-sm font-medium">
                            <Clock className="w-4 h-4" />
                            {queuedIndices.size} na fila...
                        </div>
                    )}
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        ref={bulkFileInputRef}
                        onChange={(e) => {
                            if (e.target.files?.length) {
                                handleBulkUpload(e.target.files);
                            }
                        }}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shadow-sm"
                        onClick={() => bulkFileInputRef.current?.click()}
                    >
                        <Plus className="mr-2 h-4 w-4" /> Adicionar Mídia
                    </Button>
                </div>
            </div>

            {fields.map((field, index) => {
                const isQueued = queuedIndices.has(index);
                const isUploading = uploadingIndices.has(index);
                const isAnalyzing = analyzingIndices.has(index);
                const isSaving = savingIndices.has(index);
                const isCompleted = completedIndices.has(index);
                const isProcessing = isUploading || isAnalyzing || isSaving;

                return (
                    <Card key={field.id} className={cn(
                        "relative border-l-4 transition-all duration-300",
                        isQueued ? "opacity-60 border-l-slate-300 bg-slate-50/50" :
                            isCompleted ? "border-l-green-500 shadow-sm" :
                                isProcessing ? "border-l-primary shadow-md" : "border-l-transparent hover:border-l-primary"
                    )}>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-2 text-red-500 hover:text-red-700 z-10"
                            onClick={() => handleRemoveMedia(index)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        <CardHeader className="py-2 px-4 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                Mídia {index + 1}
                                {isQueued && <Badge variant="secondary" className="text-[9px] uppercase tracking-tighter h-4">Fila</Badge>}
                                {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 px-4 pb-4">
                            <div className="flex flex-col lg:flex-row gap-6">
                                <div className="w-full lg:w-1/2 space-y-4">
                                    <div className="aspect-video rounded-md overflow-hidden border bg-muted flex items-center justify-center relative group">
                                        {getValues(`media.${index}.file_url`) ? (
                                            <img
                                                src={getValues(`media.${index}.file_url`)}
                                                alt="Preview"
                                                className="object-cover w-full h-full"
                                                onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400?text=Preview+Loading")}
                                            />
                                        ) : (
                                            <div className="text-muted-foreground text-sm flex flex-col items-center gap-2">
                                                <Upload className="w-6 h-6 opacity-20" />
                                                <span className="text-[10px] uppercase font-bold tracking-tighter">
                                                    {isQueued ? "Aguardando..." : "Sem imagem"}
                                                </span>
                                            </div>
                                        )}

                                        {isProcessing && (
                                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white gap-2 z-20 backdrop-blur-[2px]">
                                                <Loader2 className="w-7 h-7 animate-spin text-white" />
                                                <span className="text-[9px] font-bold uppercase tracking-widest animate-pulse text-center px-4">
                                                    {isUploading ? "Fazendo Upload..." :
                                                        isAnalyzing ? "IA Lendo a Foto..." :
                                                            "Salvando no Banco..."}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            id={`file-upload-${index}`}
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleFileUpload(index, file);
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 text-[11px] h-8"
                                            disabled={isProcessing || isQueued}
                                            onClick={() => document.getElementById(`file-upload-${index}`)?.click()}
                                        >
                                            <Upload className="w-3 h-3 mr-1" /> Trocar
                                        </Button>

                                        {getValues(`media.${index}.file_url`) && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 h-8"
                                                disabled={isProcessing || isQueued}
                                                onClick={() => handleAnalyzeResilient(index, getValues(`media.${index}.file_url`))}
                                            >
                                                <Wand2 className="w-3.5 h-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1 space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <FormField
                                            control={control}
                                            name={`media.${index}.moment`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Momento</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value || "Outro"}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-8 text-xs bg-muted/20">
                                                                <SelectValue placeholder="Momento..." />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {MediaMomentEnum.options.map((option) => (
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
                                            control={control}
                                            name={`media.${index}.usage_override`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className={cn("text-[10px] uppercase font-black tracking-widest text-muted-foreground", field.value === 'Bloqueado' ? "text-red-500" : "")}>
                                                        Governança
                                                    </FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value || "Liberado"}>
                                                        <FormControl>
                                                            <SelectTrigger className={cn("h-8 text-xs bg-muted/20", field.value === 'Bloqueado' ? "border-red-500 bg-red-50" : "")}>
                                                                <SelectValue placeholder="Uso..." />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {UsageOverrideEnum.options.map((option) => (
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
                                            control={control}
                                            name={`media.${index}.description`}
                                            render={({ field }) => (
                                                <FormItem className="col-span-2">
                                                    <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Descrição Portfólio (IA)</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Aguardando análise da IA..."
                                                            className="h-14 text-xs resize-none bg-muted/10 italic"
                                                            {...field}
                                                            value={field.value || ""}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={control}
                                            name={`media.${index}.tags`}
                                            render={({ field }) => (
                                                <FormItem className="col-span-2">
                                                    <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Tags SEO</FormLabel>
                                                    <div className="flex flex-wrap gap-1 mb-1.5">
                                                        {(field.value || []).map((tag: string, tagIdx: number) => (
                                                            <Badge key={tagIdx} variant="secondary" className="text-[9px] gap-1 px-1.5 py-0 font-medium">
                                                                {tag}
                                                                <button type="button" onClick={() => field.onChange(field.value.filter((_: any, i: number) => i !== tagIdx))}>
                                                                    <X className="w-2.5 h-2.5" />
                                                                </button>
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Add tag + Enter..."
                                                            className="h-7 text-xs bg-muted/20"
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    const val = e.currentTarget.value.trim();
                                                                    if (val) {
                                                                        field.onChange([...(field.value || []), val]);
                                                                        e.currentTarget.value = '';
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-2.5 bg-muted/20 border border-dashed rounded-md">
                                <FormField
                                    control={control}
                                    name={`media.${index}.is_hero`}
                                    render={({ field }) => (
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl>
                                                <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                            <FormLabel className="text-[11px] font-bold text-primary cursor-pointer flex items-center gap-1 uppercase tracking-tight">
                                                <Star className="w-3 h-3 fill-primary" /> Capa
                                            </FormLabel>
                                        </FormItem>
                                    )}
                                />

                                <div className="flex gap-4">
                                    <FormField
                                        control={control}
                                        name={`media.${index}.risk_flags`}
                                        render={({ field }) => (
                                            <div className="flex gap-3">
                                                {RiskFlagEnum.options.map((option) => (
                                                    <FormItem key={option} className="flex items-center space-x-1 space-y-0">
                                                        <FormControl>
                                                            <Checkbox
                                                                className="scale-75"
                                                                checked={(field.value || []).includes(option)}
                                                                onCheckedChange={(checked) => {
                                                                    return checked
                                                                        ? field.onChange([...(field.value || []), option])
                                                                        : field.onChange((field.value || []).filter((v: string) => v !== option))
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="text-[9px] font-bold text-amber-900 uppercase tracking-tighter cursor-pointer opacity-70 hover:opacity-100">
                                                            {option.split(' ')[1] || option}
                                                        </FormLabel>
                                                    </FormItem>
                                                ))}
                                            </div>
                                        )}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
