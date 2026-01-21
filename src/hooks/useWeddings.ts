import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type {
    Wedding,
    WeddingInsert,
    WeddingUpdate,
    Person,
    Consent,
    WeddingVendor
} from '../types';

interface UseWeddingsReturn {
    weddings: Wedding[];
    loading: boolean;
    error: string | null;
    fetchWeddings: (filters?: WeddingFilters) => Promise<void>;
    fetchWeddingById: (id: string) => Promise<Wedding | null>;
    createWedding: (data: WeddingInsert) => Promise<Wedding | null>;
    updateWedding: (id: string, data: WeddingUpdate) => Promise<Wedding | null>;
    deleteWedding: (id: string) => Promise<boolean>;
}

interface WeddingFilters {
    status?: Wedding['status'];
    tipo?: Wedding['tipo'];
    search?: string;
}

export function useWeddings(): UseWeddingsReturn {
    const [weddings, setWeddings] = useState<Wedding[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchWeddings = useCallback(async (filters?: WeddingFilters) => {
        setLoading(true);
        setError(null);

        try {
            let query = supabase
                .from('weddings')
                .select('*')
                .order('data_casamento', { ascending: false, nullsFirst: false });

            if (filters?.status) {
                query = query.eq('status', filters.status);
            }
            if (filters?.tipo) {
                query = query.eq('tipo', filters.tipo);
            }
            if (filters?.search) {
                query = query.ilike('nome_casal', `%${filters.search}%`);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) {
                throw new Error(fetchError.message);
            }

            setWeddings(data as Wedding[]);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao buscar casamentos';
            setError(message);
            console.error('[useWeddings] fetchWeddings error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchWeddingById = useCallback(async (id: string): Promise<Wedding | null> => {
        setLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('weddings')
                .select(`
                    *,
                    persons (*),
                    consents (*),
                    wedding_vendors (
                        *,
                        vendor:vendors (*)
                    )
                `)
                .eq('id', id)
                .single();

            if (fetchError) {
                throw new Error(fetchError.message);
            }

            return data as Wedding;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao buscar casamento';
            setError(message);
            console.error('[useWeddings] fetchWeddingById error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const createWedding = useCallback(async (data: WeddingInsert): Promise<Wedding | null> => {
        setLoading(true);
        setError(null);

        try {
            const { data: newWedding, error: insertError } = await supabase
                .from('weddings')
                .insert(data)
                .select()
                .single();

            if (insertError) {
                throw new Error(insertError.message);
            }

            // Atualiza lista local
            setWeddings(prev => [newWedding as Wedding, ...prev]);

            return newWedding as Wedding;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao criar casamento';
            setError(message);
            console.error('[useWeddings] createWedding error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateWedding = useCallback(async (id: string, data: WeddingUpdate): Promise<Wedding | null> => {
        setLoading(true);
        setError(null);

        try {
            const { data: updated, error: updateError } = await supabase
                .from('weddings')
                .update(data)
                .eq('id', id)
                .select()
                .single();

            if (updateError) {
                throw new Error(updateError.message);
            }

            // Atualiza lista local
            setWeddings(prev =>
                prev.map(w => w.id === id ? (updated as Wedding) : w)
            );

            return updated as Wedding;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao atualizar casamento';
            setError(message);
            console.error('[useWeddings] updateWedding error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteWedding = useCallback(async (id: string): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const { error: deleteError } = await supabase
                .from('weddings')
                .delete()
                .eq('id', id);

            if (deleteError) {
                throw new Error(deleteError.message);
            }

            // Remove da lista local
            setWeddings(prev => prev.filter(w => w.id !== id));

            return true;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao deletar casamento';
            setError(message);
            console.error('[useWeddings] deleteWedding error:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        weddings,
        loading,
        error,
        fetchWeddings,
        fetchWeddingById,
        createWedding,
        updateWedding,
        deleteWedding
    };
}

// =============================================================================
// PERSONS CRUD (Sub-hook para pessoas do casal)
// =============================================================================

interface UsePersonsReturn {
    persons: Person[];
    loading: boolean;
    error: string | null;
    fetchPersonsByWedding: (weddingId: string) => Promise<void>;
    createPerson: (data: Omit<Person, 'id' | 'created_at' | 'wedding'>) => Promise<Person | null>;
    updatePerson: (id: string, data: Partial<Person>) => Promise<Person | null>;
    deletePerson: (id: string) => Promise<boolean>;
}

export function usePersons(): UsePersonsReturn {
    const [persons, setPersons] = useState<Person[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPersonsByWedding = useCallback(async (weddingId: string) => {
        setLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('persons')
                .select('*')
                .eq('wedding_id', weddingId)
                .order('papel');

            if (fetchError) {
                throw new Error(fetchError.message);
            }

            setPersons(data as Person[]);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao buscar pessoas';
            setError(message);
            console.error('[usePersons] fetchPersonsByWedding error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const createPerson = useCallback(async (data: Omit<Person, 'id' | 'created_at' | 'wedding'>): Promise<Person | null> => {
        setLoading(true);
        setError(null);

        try {
            const { data: newPerson, error: insertError } = await supabase
                .from('persons')
                .insert(data)
                .select()
                .single();

            if (insertError) {
                throw new Error(insertError.message);
            }

            setPersons(prev => [...prev, newPerson as Person]);
            return newPerson as Person;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao criar pessoa';
            setError(message);
            console.error('[usePersons] createPerson error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const updatePerson = useCallback(async (id: string, data: Partial<Person>): Promise<Person | null> => {
        setLoading(true);
        setError(null);

        try {
            const { data: updated, error: updateError } = await supabase
                .from('persons')
                .update(data)
                .eq('id', id)
                .select()
                .single();

            if (updateError) {
                throw new Error(updateError.message);
            }

            setPersons(prev => prev.map(p => p.id === id ? (updated as Person) : p));
            return updated as Person;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao atualizar pessoa';
            setError(message);
            console.error('[usePersons] updatePerson error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const deletePerson = useCallback(async (id: string): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const { error: deleteError } = await supabase
                .from('persons')
                .delete()
                .eq('id', id);

            if (deleteError) {
                throw new Error(deleteError.message);
            }

            setPersons(prev => prev.filter(p => p.id !== id));
            return true;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao deletar pessoa';
            setError(message);
            console.error('[usePersons] deletePerson error:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        persons,
        loading,
        error,
        fetchPersonsByWedding,
        createPerson,
        updatePerson,
        deletePerson
    };
}
