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
    FormDescription
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import {
    ConsentScopeEnum,
    ConsentStatusEnum,
    AuthTypeEnum,
    UsagePermissionEnum,
    RestrictionEnum
} from "@/lib/schemas/wedding";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ConsentFields() {
    const { control } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "consents",
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Consentimentos e Direitos</h3>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({
                        scope: "Casal",
                        status: "Não solicitado",
                        usage_permissions: [],
                        restrictions: []
                    })}
                >
                    <Plus className="mr-2 h-4 w-4" /> Adicionar Consentimento
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
                        <CardTitle className="text-base">Autorização {index + 1}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                                control={control}
                                name={`consents.${index}.scope`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Escopo</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {ConsentScopeEnum.options.map((option) => (
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
                                name={`consents.${index}.status`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {ConsentStatusEnum.options.map((option) => (
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
                                name={`consents.${index}.auth_type`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de Autorização</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {AuthTypeEnum.options.map((option) => (
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
                                name={`consents.${index}.proof_link`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Link da Prova (PDF/Print)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Permissões */}
                        <div>
                            <FormLabel className="mb-2 block">Uso Permitido</FormLabel>
                            <div className="grid grid-cols-2 gap-2">
                                <FormField
                                    control={control}
                                    name={`consents.${index}.usage_permissions`}
                                    render={({ field }) => (
                                        <>
                                            {UsagePermissionEnum.options.map((option) => (
                                                <FormItem
                                                    key={option}
                                                    className="flex flex-row items-start space-x-3 space-y-0"
                                                >
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value?.includes(option)}
                                                            onCheckedChange={(checked) => {
                                                                return checked
                                                                    ? field.onChange([...field.value, option])
                                                                    : field.onChange(
                                                                        field.value?.filter(
                                                                            (value: string) => value !== option
                                                                        )
                                                                    )
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                        {option}
                                                    </FormLabel>
                                                </FormItem>
                                            ))}
                                        </>
                                    )}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
            {fields.length === 0 && (
                <div className="text-center p-4 border rounded-md border-dashed text-muted-foreground">
                    Nenhuma autorização registrada.
                </div>
            )}
        </div>
    );
}
