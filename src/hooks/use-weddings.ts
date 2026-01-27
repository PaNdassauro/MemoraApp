import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';
import { WeddingFormValues, CoupleFormValues, ConsentFormValues, MediaFormValues } from '@/lib/schemas/wedding';

type Wedding = Database['public']['Tables']['weddings']['Row'];

// Extended type for internal use in the hook
export interface WeddingWithDetails extends Wedding {
    couples: any[];
    consents: any[];
    wedding_vendors: any[];
}

export function useWeddings() {
    const [weddings, setWeddings] = useState<Wedding[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchWeddings = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: err } = await supabase
                .from('weddings')
                .select('*')
                .order('wedding_date', { ascending: false });

            if (err) throw err;
            setWeddings(data || []);
        } catch (err: any) {
            console.error('Error fetching weddings:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const getWeddingDetails = async (id: string) => {
        try {
            // Fetch wedding with related tables (excluding media which may not have FK)
            const { data: wedding, error: weddingError } = await supabase
                .from('weddings')
                .select(`
                    *,
                    couples(*),
                    consents(*),
                    wedding_vendors(*)
                `)
                .eq('id', id)
                .single();

            if (weddingError) throw weddingError;

            // Fetch media separately
            const { data: media, error: mediaError } = await supabase
                .from('portfolio_media')
                .select('*')
                .eq('wedding_id', id)
                .order('created_at', { ascending: false });

            if (mediaError) {
                console.warn('Could not fetch media:', mediaError);
            }

            return {
                ...wedding,
                media: media || []
            };
        } catch (err: any) {
            console.error('Error fetching wedding details:', err);
            throw err;
        }
    };

    const createWedding = async (values: WeddingFormValues) => {
        try {
            const slug = values.slug || `${values.couple_name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

            // 1. Create Main Wedding
            const { data: wedding, error: weddingError } = await supabase
                .from('weddings')
                .insert([{
                    couple_name: values.couple_name,
                    wedding_date: values.wedding_date,
                    wedding_type: values.wedding_type,
                    status: values.status,
                    destination_city: values.destination_city,
                    destination_country: values.destination_country,
                    slug
                }])
                .select()
                .single();

            if (weddingError) throw weddingError;

            // 2. Create Couples if any
            if (values.couples && values.couples.length > 0) {
                const couplesPayload = values.couples.map(c => ({ ...c, wedding_id: wedding.id }));
                const { error: couplesError } = await supabase.from('couples').insert(couplesPayload);
                if (couplesError) console.error("Error creating couples:", couplesError);
            }

            // 3. Create Consents if any
            if (values.consents && values.consents.length > 0) {
                const consentsPayload = values.consents.map(c => ({ ...c, wedding_id: wedding.id }));
                const { error: consentsError } = await supabase.from('consents').insert(consentsPayload);
                if (consentsError) console.error("Error creating consents:", consentsError);
            }

            setWeddings((prev) => [wedding, ...prev]);
            return wedding;
        } catch (err: any) {
            console.error('Error creating wedding:', err);
            throw err;
        }
    };

    const updateWedding = async (id: string, values: Partial<WeddingFormValues>) => {
        try {
            // For now, this only updates the main table. Complex nested updates are usually done via separate specific calls in the Edit UI.
            const { data, error } = await supabase
                .from('weddings')
                .update({
                    couple_name: values.couple_name,
                    wedding_date: values.wedding_date,
                    wedding_type: values.wedding_type,
                    status: values.status,
                    destination_city: values.destination_city,
                    destination_country: values.destination_country,
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            setWeddings((prev) => prev.map((w) => (w.id === id ? data : w)));
            return data;
        } catch (err: any) {
            console.error('Error updating wedding:', err);
            throw err;
        }
    };

    // Helpers for nested resources
    const addCouple = async (weddingId: string, couple: CoupleFormValues) => {
        return await supabase.from('couples').insert({ ...couple, wedding_id: weddingId }).select().single();
    };

    const addConsent = async (weddingId: string, consent: ConsentFormValues) => {
        return await supabase.from('consents').insert({ ...consent, wedding_id: weddingId }).select().single();
    };

    // Media CRUD operations
    const addMedia = async (weddingId: string, media: MediaFormValues) => {
        const { data, error } = await supabase
            .from('portfolio_media')
            .insert({
                wedding_id: weddingId,
                file_url: media.file_url,
                thumbnail_url: media.thumbnail_url || null,
                type: media.type,
                moment: media.moment || null,
                tags: media.tags || [],
                is_hero: media.is_hero || false,
                usage_override: media.usage_override || 'Liberado',
                risk_flags: media.risk_flags || [],
                publication_status: media.publication_status || 'Não usado',
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding media:', error);
            throw error;
        }
        return data;
    };

    const updateMedia = async (mediaId: string, media: Partial<MediaFormValues>) => {
        const { data, error } = await supabase
            .from('portfolio_media')
            .update({
                file_url: media.file_url,
                thumbnail_url: media.thumbnail_url,
                type: media.type,
                moment: media.moment,
                tags: media.tags,
                is_hero: media.is_hero,
                usage_override: media.usage_override,
                risk_flags: media.risk_flags,
                publication_status: media.publication_status,
            })
            .eq('id', mediaId)
            .select()
            .single();

        if (error) {
            console.error('Error updating media:', error);
            throw error;
        }
        return data;
    };

    const deleteMedia = async (mediaId: string) => {
        const { error } = await supabase
            .from('portfolio_media')
            .delete()
            .eq('id', mediaId);

        if (error) {
            console.error('Error deleting media:', error);
            throw error;
        }
        return true;
    };

    const getMediaByWedding = async (weddingId: string) => {
        const { data, error } = await supabase
            .from('portfolio_media')
            .select('*')
            .eq('wedding_id', weddingId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching media:', error);
            throw error;
        }
        return data || [];
    };

    useEffect(() => {
        fetchWeddings();
    }, [fetchWeddings]);

    return {
        weddings,
        loading,
        error,
        refresh: fetchWeddings,
        getWeddingDetails,
        createWedding,
        updateWedding,
        addCouple,
        addConsent,
        // Media operations
        addMedia,
        updateMedia,
        deleteMedia,
        getMediaByWedding
    };
}

