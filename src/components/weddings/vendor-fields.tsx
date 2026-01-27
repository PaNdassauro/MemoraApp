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
import { Trash2, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RepostPermissionEnum } from "@/lib/schemas/wedding";

// Note: In a real app, this would likely select from the Master Vendor list (table 4). 
// For this form, we are treating it as "Wedding Vendors" (table 5), 
// but simplifying to allow free-text input or a mock selection for now.
// To fully implement table 5, we'd need a separate Vendor Management page to populate the master list first.
// Here we assume "vendor_id" is just a text field for the name or ID for simplicity in this iteration, 
// unless we build the full Vendor Picker. 
// Given the briefing, let's allow typing the Name and Role directly for the "Ficha Técnica".

export function VendorFields() {
    const { control } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "vendors",
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Ficha Técnica</h3>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({
                        vendor_id: "temp-id", // Placeholder 
                        role_in_event: "",
                        is_mandatory_credit: false,
                        repost_permission: "Sim"
                    })}
                >
                    <Plus className="mr-2 h-4 w-4" /> Adicionar Fornecedor
                </Button>
            </div>

            {fields.map((field, index) => (
                <Card key={field.id} className="relative">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 text-red-500 hover:text-red-600"
                        onClick={() => remove(index)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    <CardHeader className="py-4">
                        <CardTitle className="text-base">Fornecedor {index + 1}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            {/* In a real app, this is a Search/Select */}
                            <FormField
                                control={control}
                                name={`vendors.${index}.vendor_id`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome do Fornecedor</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nome da empresa/profissional" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={control}
                                name={`vendors.${index}.role_in_event`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Função/Categoria</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Fotografia, Buffet" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={control}
                                name={`vendors.${index}.custom_credit_text`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Texto de Crédito</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Foto: @fulano" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name={`vendors.${index}.repost_permission`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Repost</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {RepostPermissionEnum.options.map((option) => (
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

                        <FormField
                            control={control}
                            name={`vendors.${index}.is_mandatory_credit`}
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Crédito Obrigatório
                                        </FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>
            ))}
            {fields.length === 0 && (
                <div className="text-center p-4 border rounded-md border-dashed text-muted-foreground">
                    Nenhum fornecedor na ficha técnica.
                </div>
            )}
        </div>
    );
}
