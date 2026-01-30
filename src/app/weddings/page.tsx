"use client";

import { useState } from "react";
import { useWeddings } from "@/hooks/use-weddings";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { WeddingStatus } from "@/lib/schemas/wedding";
import { WeddingStatusBadge } from "@/components/weddings/wedding-status-badge";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";

export default function WeddingsPage() {
    const { weddings, loading } = useWeddings();
    const [searchTerm, setSearchTerm] = useState("");

    const filteredWeddings = weddings.filter(w =>
        w.couple_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.destination_city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.wedding_type?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mx-auto py-10 max-w-[95%] px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 mb-8">
                <div>
                    <Link href="/">
                        <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary mb-2">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar
                        </Button>
                    </Link>
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Casamentos</h1>
                            <p className="text-muted-foreground">Gerencie o portfólio de eventos.</p>
                        </div>
                        <Link href="/weddings/new">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Novo Casamento
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="flex items-center py-4">
                <Input
                    placeholder="Buscar por casal, cidade ou tipo..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="max-w-sm"
                />
            </div>

            <div className="rounded-md border bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Casal</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Destino</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    Carregando...
                                </TableCell>
                            </TableRow>
                        ) : filteredWeddings.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    Nenhum casamento encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredWeddings.map((wedding) => (
                                <TableRow key={wedding.id}>
                                    <TableCell className="font-medium">{wedding.couple_name}</TableCell>
                                    <TableCell>{format(new Date(wedding.wedding_date), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell>{wedding.destination_city || '-'} {wedding.destination_country ? `(${wedding.destination_country})` : ''}</TableCell>
                                    <TableCell>{wedding.wedding_type}</TableCell>
                                    <TableCell>
                                        <WeddingStatusBadge status={(wedding.status as WeddingStatus) || "Em produção"} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/weddings/${wedding.id}`}>
                                            <Button variant="ghost" size="sm">Editar</Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
