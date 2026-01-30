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
import { Trash2, Plus, AlertTriangle, Star, Wand2, Loader2, X, Upload, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { uploadMedia } from "@/app/actions/upload-media";
import { useRef, useEffect } from "react";
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
import { useState } from "react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

interface MediaFieldsProps {
    weddingId?: string;
    onAddMedia?: (media: MediaFormValues) => Promise<any>;
    onDeleteMedia?: (mediaId: string) => Promise<boolean>;
    onUpdateMedia?: (mediaId: string, media: Partial<MediaFormValues>) => Promise<any>;
}

export function MediaFields({ weddingId, onAddMedia, onDeleteMedia, onUpdateMedia }: MediaFieldsProps) {
    const { control, setValue, getValues, watch } = useFormContext<WeddingFormValues>();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "media",
    });

    const [analyzingIndex, setAnalyzingIndex] = useState<number | null>(null);
    const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
    const [savingIndex, setSavingIndex] = useState<number | null>(null);

    // Build wedding context for AI analysis
    const buildWeddingContext = (): WeddingContext => {
        const formValues = getValues();
        return {
            couple_name: formValues.couple_name,
            wedding_date: formValues.wedding_date,
            venue_name: formValues.venue_name,
            destination_city: formValues.destination_city,
            destination_country: formValues.destination_country,
            wedding_type: formValues.wedding_type,
            // Extract vendor names if available
            vendors: formValues.vendors?.map((v: { vendor_id?: string; role_in_event?: string }) =>
                v.role_in_event || v.vendor_id
            ).filter(Boolean) as string[] | undefined,
        };
    };

    const handleFileUpload = async (index: number, file: File) => {
        setUploadingIndex(index);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const uploadResult = await uploadMedia(formData);
            if (!uploadResult.success || !uploadResult.url) {
                throw new Error(uploadResult.error || "Upload falhou");
            }

            const publicUrl = uploadResult.url;
            setValue(`media.${index}.file_url`, publicUrl);

            // Auto-trigger AI analysis after upload WITH wedding context
            const analysisResult = await handleAnalyze(index, publicUrl);

            // Auto-save to database if weddingId and onAddMedia are provided
            if (weddingId && onAddMedia) {
                setSavingIndex(index);
                const currentMedia = getValues(`media.${index}`);
                const savedMedia = await onAddMedia({
                    ...currentMedia,
                    file_url: publicUrl,
                    moment: analysisResult?.moment as MediaMoment || currentMedia.moment,
                    tags: analysisResult?.tags || currentMedia.tags,
                    risk_flags: analysisResult?.risk_flags as RiskFlag[] || currentMedia.risk_flags,
                });

                // Update form with saved ID
                if (savedMedia?.id) {
                    setValue(`media.${index}.id`, savedMedia.id);
                }
                toast.success("Mídia salva com sucesso!");
                setSavingIndex(null);
            }

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Erro no upload";
            toast.error(errorMessage);
            console.error(error);
        } finally {
            setUploadingIndex(null);
        }
    };

    const handleRemoveMedia = async (index: number) => {
        const mediaItem = getValues(`media.${index}`);

        // If media has an ID and delete handler is provided, delete from database
        if (mediaItem.id && onDeleteMedia) {
            try {
                await onDeleteMedia(mediaItem.id);
                toast.success("Mídia removida!");
            } catch (error) {
                toast.error("Erro ao remover mídia");
                console.error(error);
                return;
            }
        }

        // Remove from form
        remove(index);
    };

    const handleAnalyze = async (index: number, url: string) => {
        if (!url) {
            toast.error("Adicione uma imagem primeiro");
            return;
        }

        setAnalyzingIndex(index);
        try {
            // Pass wedding context to AI for personalized analysis
            const context = buildWeddingContext();
            const result = await analyzeMedia(url, context);

            if (!result.success || !result.data) {
                throw new Error(result.error);
            }

            const { data } = result;

            toast.success("Análise concluída!");

            setValue(`media.${index}.description`, data.description);
            setValue(`media.${index}.tags`, data.tags);
            setValue(`media.${index}.moment`, data.moment as MediaMoment);
            setValue(`media.${index}.risk_flags`, data.risk_flags as RiskFlag[]);

            return data;
        } catch (error) {
            toast.error("Erro na análise IA");
            console.error(error);
            return null;
        } finally {
            setAnalyzingIndex(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Mídias & Governança</h3>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({
                        file_url: "",
                        type: "Foto",
                        moment: "Festa",
                        usage_override: "Liberado",
                        publication_status: "Selecionado",
                        risk_flags: [],
                        is_hero: false,
                        tags: []
                    })}
                >
                    <Plus className="mr-2 h-4 w-4" /> Adicionar Mídia
                </Button>
            </div>

            {fields.map((field, index) => (
                <Card key={field.id} className="relative border-l-4 border-l-transparent hover:border-l-primary transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 text-red-500 hover:text-red-600"
                        onClick={() => handleRemoveMedia(index)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    <CardHeader className="py-4 flex flex-row items-center gap-2">
                        <CardTitle className="text-base">Mídia {index + 1}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col lg:flex-row gap-6">
                            {/* Left Column: Preview & Upload */}
                            <div className="w-full lg:w-1/2 space-y-4">
                                <FormLabel>Preview & Foto</FormLabel>
                                <div className="aspect-video rounded-md overflow-hidden border bg-muted flex items-center justify-center relative group transition-all duration-500 hover:shadow-md">
                                    {getValues(`media.${index}.file_url`) ? (
                                        <img
                                            src={getValues(`media.${index}.file_url`)}
                                            alt="Preview"
                                            className="object-cover w-full h-full"
                                            onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400?text=Link+Inválido")}
                                        />
                                    ) : (
                                        <div className="text-muted-foreground text-sm flex flex-col items-center gap-2">
                                            <Upload className="w-8 h-8 opacity-20" />
                                            <span>Nenhuma imagem</span>
                                        </div>
                                    )}

                                    {/* Overlay for uploading/analyzing */}
                                    {(uploadingIndex === index || analyzingIndex === index) && (
                                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white gap-2">
                                            <Loader2 className="w-8 h-8 animate-spin" />
                                            <span className="text-xs font-medium">
                                                {uploadingIndex === index ? "Fazendo upload..." : "Analisando com IA..."}
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
                                        className="flex-1 gap-2"
                                        disabled={uploadingIndex === index || analyzingIndex === index}
                                        onClick={() => document.getElementById(`file-upload-${index}`)?.click()}
                                    >
                                        <Upload className="w-4 h-4" />
                                        Selecionar Foto
                                    </Button>

                                    {getValues(`media.${index}.file_url`) && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                            disabled={analyzingIndex === index || uploadingIndex === index}
                                            onClick={() => handleAnalyze(index, getValues(`media.${index}.file_url`))}
                                        >
                                            <Wand2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Right Column: Key Fields */}
                            <div className="flex-1 space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <FormField
                                        control={control}
                                        name={`media.${index}.file_url`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>URL da Foto (Supabase)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Upload pendente..." readOnly {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={control}
                                        name={`media.${index}.moment`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Momento</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecione..." />
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
                                                <FormLabel className={cn(
                                                    field.value === 'Bloqueado' ? "text-red-600 font-bold" : ""
                                                )}>
                                                    Governança (Uso)
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className={cn(
                                                            field.value === 'Bloqueado' ? "border-red-500 bg-red-50" : ""
                                                        )}>
                                                            <SelectValue placeholder="Selecione..." />
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
                                        name={`media.${index}.publication_status`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Status Pub.</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecione..." />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {PublicationStatusEnum.options.map((option) => (
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
                                                <FormLabel>Descrição (IA / Alt Text)</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Descrição gerada pela IA..."
                                                        className="h-20"
                                                        {...field}
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
                                                <FormLabel>Tags / Palavras-chave</FormLabel>
                                                <div className="flex flex-wrap gap-2 mb-2 min-h-[32px] p-2 border rounded-md bg-muted/30">
                                                    {field.value?.map((tag: string, tagIdx: number) => (
                                                        <Badge key={tagIdx} variant="secondary" className="gap-1 px-2 py-1">
                                                            {tag}
                                                            <button
                                                                type="button"
                                                                onClick={() => field.onChange(field.value.filter((_: any, i: number) => i !== tagIdx))}
                                                                className="hover:text-destructive"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </Badge>
                                                    ))}
                                                    {(!field.value || field.value.length === 0) && (
                                                        <span className="text-xs text-muted-foreground italic">Nenhuma tag...</span>
                                                    )}
                                                </div>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Adicione tags e aperte Enter..."
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                const val = e.currentTarget.value.trim();
                                                                if (val) {
                                                                    const newTags = val.split(',').map(t => t.trim()).filter(Boolean);
                                                                    field.onChange([...(field.value || []), ...newTags]);
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

                        {/* Flags */}
                        <div className="flex flex-col gap-4 p-4 bg-muted/20 rounded-md">
                            <FormField
                                control={control}
                                name={`media.${index}.is_hero`}
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormLabel className="font-semibold text-primary flex items-center gap-2">
                                            <Star className="w-4 h-4 fill-primary" />
                                            Hero (Destaque Portfólio)
                                        </FormLabel>
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-2">
                                <FormLabel className="flex items-center gap-2 text-amber-600">
                                    <AlertTriangle className="w-4 h-4" />
                                    Riscos & Restrições
                                </FormLabel>
                                <div className="grid grid-cols-2 gap-2">
                                    <FormField
                                        control={control}
                                        name={`media.${index}.risk_flags`}
                                        render={({ field }) => (
                                            <>
                                                {RiskFlagEnum.options.map((option) => (
                                                    <FormItem
                                                        key={option}
                                                        className="flex flex-row items-start space-x-3 space-y-0"
                                                    >
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value?.includes(option)}
                                                                onCheckedChange={(checked) => {
                                                                    return checked
                                                                        ? field.onChange([...(field.value || []), option])
                                                                        : field.onChange(
                                                                            field.value?.filter(
                                                                                (value: string) => value !== option
                                                                            )
                                                                        )
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="font-normal text-sm">
                                                            {option}
                                                        </FormLabel>
                                                    </FormItem>
                                                ))}
                                            </>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
            {fields.length === 0 && (
                <div className="text-center p-4 border rounded-md border-dashed text-muted-foreground">
                    Nenhuma mídia cadastrada neste casamento.
                </div>
            )}
        </div>
    );
}
