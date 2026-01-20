import { useState, useCallback } from 'react';
import type { AIMetadata } from '../types';

// Mock categories for variety in simulation
const MOCK_CATEGORIES = ['Travel', 'Nature', 'Food', 'People', 'Architecture', 'Animals', 'Art', 'Sports'];

const MOCK_TAGS_BY_CATEGORY: Record<string, string[][]> = {
    Travel: [['beach', 'sunset', 'vacation'], ['mountain', 'hiking', 'adventure'], ['city', 'urban', 'landmark']],
    Nature: [['forest', 'trees', 'green'], ['ocean', 'waves', 'blue'], ['flowers', 'garden', 'colorful']],
    Food: [['restaurant', 'dinner', 'gourmet'], ['homemade', 'cooking', 'kitchen'], ['dessert', 'sweet', 'treat']],
    People: [['portrait', 'smile', 'happy'], ['group', 'friends', 'celebration'], ['candid', 'lifestyle', 'moment']],
    Architecture: [['building', 'modern', 'glass'], ['historic', 'classic', 'old'], ['interior', 'design', 'decor']],
    Animals: [['pet', 'dog', 'cute'], ['wildlife', 'nature', 'safari'], ['birds', 'flying', 'sky']],
    Art: [['painting', 'canvas', 'gallery'], ['sculpture', 'museum', 'exhibition'], ['street-art', 'mural', 'graffiti']],
    Sports: [['outdoor', 'active', 'fitness'], ['team', 'game', 'competition'], ['extreme', 'adrenaline', 'action']]
};

const MOCK_DESCRIPTIONS: Record<string, string[]> = {
    Travel: ['Uma bela paisagem capturada durante uma viagem inesquecível.', 'Destino turístico com vistas deslumbrantes.'],
    Nature: ['A beleza natural em todo seu esplendor.', 'Momento sereno capturado na natureza.'],
    Food: ['Prato delicioso preparado com ingredientes frescos.', 'Experiência gastronômica memorável.'],
    People: ['Momento especial compartilhado entre pessoas.', 'Expressão genuína capturada em foto.'],
    Architecture: ['Design arquitetônico impressionante.', 'Estrutura que combina forma e função.'],
    Animals: ['Animal em seu habitat natural.', 'Momento fofo capturado com perfeição.'],
    Art: ['Expressão artística única e criativa.', 'Obra que desperta emoções profundas.'],
    Sports: ['Ação capturada no momento perfeito.', 'Energia e movimento em uma imagem.']
};

const MOCK_COLORS = [
    ['#FF6B35', '#004E89', '#1A1A2E'],
    ['#2D6A4F', '#40916C', '#95D5B2'],
    ['#E63946', '#F1FAEE', '#A8DADC'],
    ['#264653', '#2A9D8F', '#E9C46A'],
    ['#7209B7', '#3A0CA3', '#4361EE']
];

interface UseImageProcessorReturn {
    processImageWithAI: (imageUrl: string) => Promise<AIMetadata>;
    isProcessing: boolean;
    error: string | null;
}

/**
 * Hook do "Bibliotecário" - Processa imagens com IA (mock)
 * 
 * Em produção, este hook chamará uma Edge Function do Supabase
 * que integra com APIs de visão computacional (OpenAI, Google Vision, etc.)
 */
export function useImageProcessor(): UseImageProcessorReturn {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const processImageWithAI = useCallback(async (imageUrl: string): Promise<AIMetadata> => {
        setIsProcessing(true);
        setError(null);

        try {
            // Simula delay de processamento (1-3 segundos)
            const processingTime = 1000 + Math.random() * 2000;
            await new Promise(resolve => setTimeout(resolve, processingTime));

            // Gera categoria aleatória
            const category = MOCK_CATEGORIES[Math.floor(Math.random() * MOCK_CATEGORIES.length)];

            // Seleciona tags baseadas na categoria
            const categoryTags = MOCK_TAGS_BY_CATEGORY[category];
            const tags = categoryTags[Math.floor(Math.random() * categoryTags.length)];

            // Seleciona descrição baseada na categoria
            const descriptions = MOCK_DESCRIPTIONS[category];
            const description = descriptions[Math.floor(Math.random() * descriptions.length)];

            // Seleciona paleta de cores aleatória
            const colors = MOCK_COLORS[Math.floor(Math.random() * MOCK_COLORS.length)];

            const metadata: AIMetadata = {
                category,
                tags,
                description,
                colors,
                objects: [...tags, category.toLowerCase()],
                confidence: 0.85 + Math.random() * 0.14 // 85-99% confidence
            };

            console.log(`[Bibliotecário] Imagem processada: ${imageUrl}`, metadata);

            return metadata;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao processar imagem';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    }, []);

    return {
        processImageWithAI,
        isProcessing,
        error
    };
}
