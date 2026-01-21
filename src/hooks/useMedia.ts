import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type {
    Media,
    MediaInsert,
    MediaUpdate,
    MediaType,
    MediaMoment,
    PublicationStatus
} from '../types';

interface UseMediaReturn {
    medias: Media[];
    loading: boolean;
    error: string | null;
    fetchMediaByWedding: (weddingId: string, filters?: MediaFilters) => Promise<void>;
    fetchHeroMedia: () => Promise<Media[]>;
    fetchMediaWithRestrictions: () => Promise<Media[]>;
    createMedia: (data: MediaInsert) => Promise<Media | null>;
    updateMedia: (id: string, data: MediaUpdate) => Promise<Media | null>;
    updateMediaStatus: (id: string, status: PublicationStatus) => Promise<Media | null>;
    markAsHero: (id: string, isHero: boolean) => Promise<Media | null>;
    deleteMedia: (id: string) => Promise<boolean>;
    searchMediaByTags: (tags: string[]) => Promise<Media[]>;
}

interface MediaFilters {
    tipo?: MediaType;
    momento?: MediaMoment;
    status?: PublicationStatus;
    isHero?: boolean;
    tags?: string[];
}

export function useMedia(): UseMediaReturn {
    const [medias, setMedias] = useState<Media[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMediaByWedding = useCallback(async (weddingId: string, filters?: MediaFilters) => {
        setLoading(true);
        setError(null);

        try {
            let query = supabase
                .from('medias')
                .select('*')
                .eq('wedding_id', weddingId)
                .order('created_at', { ascending: false });

            if (filters?.tipo) {
                query = query.eq('tipo', filters.tipo);
            }
            if (filters?.momento) {
                query = query.eq('momento', filters.momento);
            }
            if (filters?.status) {
                query = query.eq('status_publicacao', filters.status);
            }
            if (filters?.isHero !== undefined) {
                query = query.eq('is_hero', filters.isHero);
            }
            if (filters?.tags && filters.tags.length > 0) {
                query = query.overlaps('tags', filters.tags);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) {
                throw new Error(fetchError.message);
            }

            setMedias(data as Media[]);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao buscar mídias';
            setError(message);
            console.error('[useMedia] fetchMediaByWedding error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchHeroMedia = useCallback(async (): Promise<Media[]> => {
        try {
            const { data, error: fetchError } = await supabase
                .from('medias')
                .select(`
                    *,
                    wedding:weddings (id, nome_casal, data_casamento)
                `)
                .eq('is_hero', true)
                .order('created_at', { ascending: false });

            if (fetchError) {
                throw new Error(fetchError.message);
            }

            return data as Media[];
        } catch (err) {
            console.error('[useMedia] fetchHeroMedia error:', err);
            return [];
        }
    }, []);

    /**
     * Busca mídias com restrições ativas (mostra rosto, crianças, sensível)
     * Para fins de auditoria e governança
     */
    const fetchMediaWithRestrictions = useCallback(async (): Promise<Media[]> => {
        try {
            const { data, error: fetchError } = await supabase
                .from('medias')
                .select(`
                    *,
                    wedding:weddings (id, nome_casal)
                `)
                .or('mostra_rosto.eq.true,mostra_crianca.eq.true,conteudo_sensivel.eq.true')
                .order('created_at', { ascending: false });

            if (fetchError) {
                throw new Error(fetchError.message);
            }

            return data as Media[];
        } catch (err) {
            console.error('[useMedia] fetchMediaWithRestrictions error:', err);
            return [];
        }
    }, []);

    const createMedia = useCallback(async (data: MediaInsert): Promise<Media | null> => {
        setLoading(true);
        setError(null);

        try {
            const { data: newMedia, error: insertError } = await supabase
                .from('medias')
                .insert(data)
                .select()
                .single();

            if (insertError) {
                throw new Error(insertError.message);
            }

            setMedias(prev => [newMedia as Media, ...prev]);
            return newMedia as Media;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao criar mídia';
            setError(message);
            console.error('[useMedia] createMedia error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateMedia = useCallback(async (id: string, data: MediaUpdate): Promise<Media | null> => {
        setLoading(true);
        setError(null);

        try {
            const { data: updated, error: updateError } = await supabase
                .from('medias')
                .update(data)
                .eq('id', id)
                .select()
                .single();

            if (updateError) {
                throw new Error(updateError.message);
            }

            setMedias(prev => prev.map(m => m.id === id ? (updated as Media) : m));
            return updated as Media;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao atualizar mídia';
            setError(message);
            console.error('[useMedia] updateMedia error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateMediaStatus = useCallback(async (id: string, status: PublicationStatus): Promise<Media | null> => {
        return updateMedia(id, { status_publicacao: status });
    }, [updateMedia]);

    const markAsHero = useCallback(async (id: string, isHero: boolean): Promise<Media | null> => {
        return updateMedia(id, { is_hero: isHero });
    }, [updateMedia]);

    const deleteMedia = useCallback(async (id: string): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            const { error: deleteError } = await supabase
                .from('medias')
                .delete()
                .eq('id', id);

            if (deleteError) {
                throw new Error(deleteError.message);
            }

            setMedias(prev => prev.filter(m => m.id !== id));
            return true;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao deletar mídia';
            setError(message);
            console.error('[useMedia] deleteMedia error:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const searchMediaByTags = useCallback(async (tags: string[]): Promise<Media[]> => {
        try {
            const { data, error: fetchError } = await supabase
                .from('medias')
                .select(`
                    *,
                    wedding:weddings (id, nome_casal)
                `)
                .overlaps('tags', tags)
                .order('created_at', { ascending: false });

            if (fetchError) {
                throw new Error(fetchError.message);
            }

            return data as Media[];
        } catch (err) {
            console.error('[useMedia] searchMediaByTags error:', err);
            return [];
        }
    }, []);

    return {
        medias,
        loading,
        error,
        fetchMediaByWedding,
        fetchHeroMedia,
        fetchMediaWithRestrictions,
        createMedia,
        updateMedia,
        updateMediaStatus,
        markAsHero,
        deleteMedia,
        searchMediaByTags
    };
}
