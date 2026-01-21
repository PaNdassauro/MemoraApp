import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type {
    Consent,
    ConsentInsert,
    ConsentUpdate,
    MediaUsageCheckResult
} from '../types';

interface UseConsentsReturn {
    consents: Consent[];
    loading: boolean;
    error: string | null;
    fetchConsentsByWedding: (weddingId: string) => Promise<void>;
    createConsent: (data: ConsentInsert) => Promise<Consent | null>;
    updateConsent: (id: string, data: ConsentUpdate) => Promise<Consent | null>;
    updateConsentStatus: (id: string, status: Consent['status']) => Promise<Consent | null>;
    deleteConsent: (id: string) => Promise<boolean>;
    checkMediaUsageAllowed: (mediaId: string, useType: string) => Promise<MediaUsageCheckResult | null>;
}

export function useConsents(): UseConsentsReturn {
    const [consents, setConsents] = useState<Consent[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchConsentsByWedding = useCallback(async (weddingId: string) => {
        setLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('consents')
                .select(`
                    *,
                    person:persons (id, nome, papel)
                `)
                .eq('wedding_id', weddingId)
                .order('created_at', { ascending: false });

            if (fetchError) {
                throw new Error(fetchError.message);
            }

            setConsents(data as Consent[]);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao buscar consentimentos';
            setError(message);
            console.error('[useConsents] fetchConsentsByWedding error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const createConsent = useCallback(async (data: ConsentInsert): Promise<Consent | null> => {
        setLoading(true);
        setError(null);

        try {
            const { data: newConsent, error: insertError } = await supabase
                .from('consents')
                .insert(data)
                .select()
                .single();

            if (insertError) {
                throw new Error(insertError.message);
            }

            setConsents(prev => [newConsent as Consent, ...prev]);
            return newConsent as Consent;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao criar consentimento';
            setError(message);
            console.error('[useConsents] createConsent error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateConsent = useCallback(async (id: string, data: ConsentUpdate): Promise<Consent | null> => {
        setLoading(true);
        setError(null);

        try {
            const { data: updated, error: updateError } = await supabase
                .from('consents')
                .update(data)
                .eq('id', id)
                .select()
                .single();

            if (updateError) {
                throw new Error(updateError.message);
            }

            setConsents(prev => prev.map(c => c.id === id ? (updated as Consent) : c));
            return updated as Consent;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao atualizar consentimento';
            setError(message);
            console.error('[useConsents] updateConsent error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateConsentStatus = useCallback(async (id: string, status: Consent['status']): Promise<Consent | null> => {
        const updateData: ConsentUpdate = { status };

        // Se aprovado, adiciona data de aprovação
        if (status === 'aprovado') {
            updateData.data_aprovacao = new Date().toISOString().split('T')[0];
        }

        return updateConsent(id, updateData);
    }, [updateConsent]);

    const deleteConsent = useCallback(async (id: string): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const { error: deleteError } = await supabase
                .from('consents')
                .delete()
                .eq('id', id);

            if (deleteError) {
                throw new Error(deleteError.message);
            }

            setConsents(prev => prev.filter(c => c.id !== id));
            return true;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao deletar consentimento';
            setError(message);
            console.error('[useConsents] deleteConsent error:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Verifica se uma mídia pode ser usada em um determinado contexto
     * Chama a função do banco: check_media_usage_allowed(media_id, use_type)
     * @param useType - 'organico' | 'ads' | 'pr' | 'portfolio' | 'comercial'
     */
    const checkMediaUsageAllowed = useCallback(async (
        mediaId: string,
        useType: string
    ): Promise<MediaUsageCheckResult | null> => {
        try {
            const { data, error: rpcError } = await supabase
                .rpc('check_media_usage_allowed', {
                    p_media_id: mediaId,
                    p_use_type: useType
                });

            if (rpcError) {
                throw new Error(rpcError.message);
            }

            if (data && data.length > 0) {
                return data[0] as MediaUsageCheckResult;
            }

            return null;
        } catch (err) {
            console.error('[useConsents] checkMediaUsageAllowed error:', err);
            return null;
        }
    }, []);

    return {
        consents,
        loading,
        error,
        fetchConsentsByWedding,
        createConsent,
        updateConsent,
        updateConsentStatus,
        deleteConsent,
        checkMediaUsageAllowed
    };
}
