import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type {
    Vendor,
    VendorInsert,
    VendorUpdate,
    WeddingVendor,
    WeddingVendorInsert,
    VendorCategory
} from '../types';

interface UseVendorsReturn {
    vendors: Vendor[];
    loading: boolean;
    error: string | null;
    fetchVendors: (filters?: VendorFilters) => Promise<void>;
    fetchVendorById: (id: string) => Promise<Vendor | null>;
    createVendor: (data: VendorInsert) => Promise<Vendor | null>;
    updateVendor: (id: string, data: VendorUpdate) => Promise<Vendor | null>;
    deleteVendor: (id: string) => Promise<boolean>;
    linkVendorToWedding: (data: WeddingVendorInsert) => Promise<WeddingVendor | null>;
    unlinkVendorFromWedding: (weddingId: string, vendorId: string) => Promise<boolean>;
    fetchVendorsByWedding: (weddingId: string) => Promise<WeddingVendor[]>;
    generateWeddingCredits: (weddingId: string) => Promise<string | null>;
}

interface VendorFilters {
    categoria?: VendorCategory;
    search?: string;
    cidade_pais?: string;
}

export function useVendors(): UseVendorsReturn {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchVendors = useCallback(async (filters?: VendorFilters) => {
        setLoading(true);
        setError(null);

        try {
            let query = supabase
                .from('vendors')
                .select('*')
                .order('nome');

            if (filters?.categoria) {
                query = query.eq('categoria', filters.categoria);
            }
            if (filters?.search) {
                query = query.ilike('nome', `%${filters.search}%`);
            }
            if (filters?.cidade_pais) {
                query = query.ilike('cidade_pais', `%${filters.cidade_pais}%`);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) {
                throw new Error(fetchError.message);
            }

            setVendors(data as Vendor[]);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao buscar fornecedores';
            setError(message);
            console.error('[useVendors] fetchVendors error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchVendorById = useCallback(async (id: string): Promise<Vendor | null> => {
        try {
            const { data, error: fetchError } = await supabase
                .from('vendors')
                .select('*')
                .eq('id', id)
                .single();

            if (fetchError) {
                throw new Error(fetchError.message);
            }

            return data as Vendor;
        } catch (err) {
            console.error('[useVendors] fetchVendorById error:', err);
            return null;
        }
    }, []);

    const createVendor = useCallback(async (data: VendorInsert): Promise<Vendor | null> => {
        setLoading(true);
        setError(null);

        try {
            const { data: newVendor, error: insertError } = await supabase
                .from('vendors')
                .insert(data)
                .select()
                .single();

            if (insertError) {
                throw new Error(insertError.message);
            }

            setVendors(prev => [...prev, newVendor as Vendor].sort((a, b) => a.nome.localeCompare(b.nome)));
            return newVendor as Vendor;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao criar fornecedor';
            setError(message);
            console.error('[useVendors] createVendor error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateVendor = useCallback(async (id: string, data: VendorUpdate): Promise<Vendor | null> => {
        setLoading(true);
        setError(null);

        try {
            const { data: updated, error: updateError } = await supabase
                .from('vendors')
                .update(data)
                .eq('id', id)
                .select()
                .single();

            if (updateError) {
                throw new Error(updateError.message);
            }

            setVendors(prev => prev.map(v => v.id === id ? (updated as Vendor) : v));
            return updated as Vendor;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao atualizar fornecedor';
            setError(message);
            console.error('[useVendors] updateVendor error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteVendor = useCallback(async (id: string): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const { error: deleteError } = await supabase
                .from('vendors')
                .delete()
                .eq('id', id);

            if (deleteError) {
                throw new Error(deleteError.message);
            }

            setVendors(prev => prev.filter(v => v.id !== id));
            return true;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao deletar fornecedor';
            setError(message);
            console.error('[useVendors] deleteVendor error:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const linkVendorToWedding = useCallback(async (data: WeddingVendorInsert): Promise<WeddingVendor | null> => {
        try {
            const { data: link, error: insertError } = await supabase
                .from('wedding_vendors')
                .insert(data)
                .select(`
                    *,
                    vendor:vendors (*)
                `)
                .single();

            if (insertError) {
                throw new Error(insertError.message);
            }

            return link as WeddingVendor;
        } catch (err) {
            console.error('[useVendors] linkVendorToWedding error:', err);
            return null;
        }
    }, []);

    const unlinkVendorFromWedding = useCallback(async (weddingId: string, vendorId: string): Promise<boolean> => {
        try {
            const { error: deleteError } = await supabase
                .from('wedding_vendors')
                .delete()
                .eq('wedding_id', weddingId)
                .eq('vendor_id', vendorId);

            if (deleteError) {
                throw new Error(deleteError.message);
            }

            return true;
        } catch (err) {
            console.error('[useVendors] unlinkVendorFromWedding error:', err);
            return false;
        }
    }, []);

    const fetchVendorsByWedding = useCallback(async (weddingId: string): Promise<WeddingVendor[]> => {
        try {
            const { data, error: fetchError } = await supabase
                .from('wedding_vendors')
                .select(`
                    *,
                    vendor:vendors (*)
                `)
                .eq('wedding_id', weddingId)
                .order('funcao_evento');

            if (fetchError) {
                throw new Error(fetchError.message);
            }

            return data as WeddingVendor[];
        } catch (err) {
            console.error('[useVendors] fetchVendorsByWedding error:', err);
            return [];
        }
    }, []);

    /**
     * Gera créditos automáticos para um casamento baseado nos fornecedores
     * Chama a função do banco: generate_wedding_credits(wedding_id)
     */
    const generateWeddingCredits = useCallback(async (weddingId: string): Promise<string | null> => {
        try {
            const { data, error: rpcError } = await supabase
                .rpc('generate_wedding_credits', {
                    p_wedding_id: weddingId
                });

            if (rpcError) {
                throw new Error(rpcError.message);
            }

            return data as string;
        } catch (err) {
            console.error('[useVendors] generateWeddingCredits error:', err);
            return null;
        }
    }, []);

    return {
        vendors,
        loading,
        error,
        fetchVendors,
        fetchVendorById,
        createVendor,
        updateVendor,
        deleteVendor,
        linkVendorToWedding,
        unlinkVendorFromWedding,
        fetchVendorsByWedding,
        generateWeddingCredits
    };
}
