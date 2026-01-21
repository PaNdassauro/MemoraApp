import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type {
    Publication,
    PublicationInsert,
    PublicationChannel
} from '../types';

interface UsePublicationsReturn {
    publications: Publication[];
    loading: boolean;
    error: string | null;
    fetchPublicationsByMedia: (mediaId: string) => Promise<void>;
    fetchPublicationsByWedding: (weddingId: string) => Promise<void>;
    fetchRecentPublications: (limit?: number) => Promise<Publication[]>;
    createPublication: (data: PublicationInsert, autoGenerateCredits?: boolean) => Promise<Publication | null>;
    deletePublication: (id: string) => Promise<boolean>;
    getMediaUsageHistory: (mediaId: string) => Promise<Publication[]>;
    getPublicationsByChannel: (channel: PublicationChannel) => Promise<Publication[]>;
}

export function usePublications(): UsePublicationsReturn {
    const [publications, setPublications] = useState<Publication[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPublicationsByMedia = useCallback(async (mediaId: string) => {
        setLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('publications')
                .select('*')
                .eq('media_id', mediaId)
                .order('data_publicacao', { ascending: false });

            if (fetchError) {
                throw new Error(fetchError.message);
            }

            setPublications(data as Publication[]);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao buscar publicações';
            setError(message);
            console.error('[usePublications] fetchPublicationsByMedia error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchPublicationsByWedding = useCallback(async (weddingId: string) => {
        setLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('publications')
                .select(`
                    *,
                    media:medias (id, file_name, thumbnail_url, tipo)
                `)
                .eq('wedding_id', weddingId)
                .order('data_publicacao', { ascending: false });

            if (fetchError) {
                throw new Error(fetchError.message);
            }

            setPublications(data as Publication[]);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao buscar publicações';
            setError(message);
            console.error('[usePublications] fetchPublicationsByWedding error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchRecentPublications = useCallback(async (limit: number = 20): Promise<Publication[]> => {
        try {
            const { data, error: fetchError } = await supabase
                .from('publications')
                .select(`
                    *,
                    wedding:weddings (id, nome_casal),
                    media:medias (id, file_name, thumbnail_url)
                `)
                .order('data_publicacao', { ascending: false })
                .limit(limit);

            if (fetchError) {
                throw new Error(fetchError.message);
            }

            return data as Publication[];
        } catch (err) {
            console.error('[usePublications] fetchRecentPublications error:', err);
            return [];
        }
    }, []);

    const createPublication = useCallback(async (
        data: PublicationInsert,
        autoGenerateCredits: boolean = true
    ): Promise<Publication | null> => {
        setLoading(true);
        setError(null);

        try {
            let creditos = data.creditos_usados;

            // Gera créditos automaticamente se não fornecido
            if (autoGenerateCredits && !creditos && data.wedding_id) {
                const { data: credits } = await supabase
                    .rpc('generate_wedding_credits', {
                        p_wedding_id: data.wedding_id
                    });

                if (credits) {
                    creditos = credits as string;
                }
            }

            const publicationData: PublicationInsert = {
                ...data,
                creditos_usados: creditos ?? null
            };

            const { data: newPublication, error: insertError } = await supabase
                .from('publications')
                .insert(publicationData)
                .select()
                .single();

            if (insertError) {
                throw new Error(insertError.message);
            }

            setPublications(prev => [newPublication as Publication, ...prev]);

            // Atualiza status da mídia para refletir que foi publicada
            if (data.media_id) {
                const newStatus = data.canal === 'ads' ? 'usado_ads' : 'postado_organico';
                await supabase
                    .from('medias')
                    .update({ status_publicacao: newStatus })
                    .eq('id', data.media_id);
            }

            return newPublication as Publication;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao criar publicação';
            setError(message);
            console.error('[usePublications] createPublication error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const deletePublication = useCallback(async (id: string): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const { error: deleteError } = await supabase
                .from('publications')
                .delete()
                .eq('id', id);

            if (deleteError) {
                throw new Error(deleteError.message);
            }

            setPublications(prev => prev.filter(p => p.id !== id));
            return true;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao deletar publicação';
            setError(message);
            console.error('[usePublications] deletePublication error:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Retorna histórico completo de uso de uma mídia
     */
    const getMediaUsageHistory = useCallback(async (mediaId: string): Promise<Publication[]> => {
        try {
            const { data, error: fetchError } = await supabase
                .from('publications')
                .select('*')
                .eq('media_id', mediaId)
                .order('data_publicacao', { ascending: true });

            if (fetchError) {
                throw new Error(fetchError.message);
            }

            return data as Publication[];
        } catch (err) {
            console.error('[usePublications] getMediaUsageHistory error:', err);
            return [];
        }
    }, []);

    /**
     * Busca publicações por canal específico
     */
    const getPublicationsByChannel = useCallback(async (channel: PublicationChannel): Promise<Publication[]> => {
        try {
            const { data, error: fetchError } = await supabase
                .from('publications')
                .select(`
                    *,
                    wedding:weddings (id, nome_casal),
                    media:medias (id, file_name, thumbnail_url)
                `)
                .eq('canal', channel)
                .order('data_publicacao', { ascending: false });

            if (fetchError) {
                throw new Error(fetchError.message);
            }

            return data as Publication[];
        } catch (err) {
            console.error('[usePublications] getPublicationsByChannel error:', err);
            return [];
        }
    }, []);

    return {
        publications,
        loading,
        error,
        fetchPublicationsByMedia,
        fetchPublicationsByWedding,
        fetchRecentPublications,
        createPublication,
        deletePublication,
        getMediaUsageHistory,
        getPublicationsByChannel
    };
}
