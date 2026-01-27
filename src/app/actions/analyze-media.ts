"use server";

import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Valid enum values
const VALID_MOMENTS = ['Cerimônia', 'Festa', 'Making of', 'Decoração', 'Ensaio', 'Outro'] as const;
const VALID_RISK_FLAGS = ['Mostra rosto', 'Mostra criança', 'Mostra convidados', 'Conteúdo sensível'] as const;

// Define the output schema we expect from OpenAI
const analysisSchema = z.object({
    description: z.string().default("Foto de casamento"),
    tags: z.array(z.string()).default([]),
    moment: z.enum(VALID_MOMENTS).catch('Outro'),
    risk_flags: z.array(z.enum(VALID_RISK_FLAGS)).catch([]),
});

type AnalysisResult = z.infer<typeof analysisSchema>;

// Wedding context for personalized analysis
export interface WeddingContext {
    couple_name: string;
    wedding_date?: string;
    venue_name?: string;
    destination_city?: string;
    destination_country?: string;
    wedding_type?: string;
    vendors?: string[];
}

// Build context section for the prompt
function buildContextSection(context?: WeddingContext): string {
    if (!context) return "";

    const parts: string[] = [];

    if (context.couple_name) {
        parts.push(`CASAL: ${context.couple_name}`);
    }
    if (context.wedding_date) {
        parts.push(`DATA: ${context.wedding_date}`);
    }
    if (context.venue_name) {
        parts.push(`LOCAL: ${context.venue_name}`);
    }
    if (context.destination_city || context.destination_country) {
        const location = [context.destination_city, context.destination_country].filter(Boolean).join(", ");
        parts.push(`DESTINO: ${location}`);
    }
    if (context.wedding_type) {
        parts.push(`TIPO: ${context.wedding_type}`);
    }
    if (context.vendors && context.vendors.length > 0) {
        parts.push(`FORNECEDORES: ${context.vendors.join(", ")}`);
    }

    if (parts.length === 0) return "";

    return `
WEDDING CONTEXT (use this information to personalize the description):
${parts.join("\n")}

IMPORTANT: Use the couple's names in the description when they appear in the photo.
Include venue/location tags if relevant to the image.
`;
}

// VisionStruct-inspired prompt adapted for wedding photography
const SYSTEM_PROMPT_BASE = `ROLE & OBJECTIVE
You are WeddingVision, an advanced Computer Vision & Data Serialization Engine specialized in wedding photography analysis. Your purpose is to ingest wedding photos and extract comprehensive visual metadata for portfolio curation, privacy governance, and SEO optimization.

CORE DIRECTIVE
Do not summarize superficially. You must perform a thorough visual analysis capturing:
- Every person visible (faces, partial bodies, silhouettes)
- Every child or minor present
- Guest presence in background/foreground
- Sensitive content (intimate moments, revealing clothing, alcohol)

ANALYSIS PROTOCOL
Before generating output, perform a silent Visual Sweep:

1. MACRO SWEEP: Identify scene type (ceremony altar, dance floor, bridal suite, outdoor venue), global lighting, atmosphere, and primary subjects.

2. MICRO SWEEP: Scan for:
   - Face visibility (clear faces, profile, back of head)
   - Children/minors anywhere in frame
   - Guest clusters in background
   - Intimate or potentially sensitive moments
   - Decorative elements, textures, props
   - Text on signs, cake toppers, invitations

3. MOMENT CLASSIFICATION: Map to exactly one of these wedding moments:
   - "Cerimônia" = altar, vows, rings, kiss, processional
   - "Festa" = reception, dancing, toasts, cake cutting, party
   - "Making of" = getting ready, makeup, dress, groom prep
   - "Decoração" = tables, flowers, venue empty, details without people
   - "Ensaio" = posed couple portraits, romantic shots
   - "Outro" = anything that doesn't fit above

4. RISK ASSESSMENT: Flag ALL that apply:
   - "Mostra rosto" = ANY clearly identifiable face visible
   - "Mostra criança" = ANY person appearing under 18
   - "Mostra convidados" = guests visible (not just bride/groom)
   - "Conteúdo sensível" = intimate moments, revealing clothing, alcohol prominence

OUTPUT FORMAT (STRICT)
Return ONLY valid JSON with exactly this structure:
{
  "description": "Rich, professional Portuguese description (2-3 sentences). Include: subjects, action, setting, mood, lighting quality, notable details. This serves as alt-text and portfolio caption.",
  "tags": ["15-25 Portuguese SEO tags covering: style, colors, emotions, elements, venue type, season, themes, props, actions, attire details"],
  "moment": "EXACTLY one of: Cerimônia | Festa | Making of | Decoração | Ensaio | Outro",
  "risk_flags": ["Array containing ONLY applicable flags from: Mostra rosto, Mostra criança, Mostra convidados, Conteúdo sensível - empty array [] if none apply"]
}

CRITICAL CONSTRAINTS
- Description MUST be in Portuguese (Brazilian)
- Tags MUST be in Portuguese, lowercase, specific (not generic like "casamento")
- Include micro-details in tags: fabric textures, flower types, lighting style, color tones
- Be CONSERVATIVE with privacy: when in doubt, flag it
- NEVER omit risk_flags - use empty array [] if truly no risks
- moment must be EXACTLY one of the 6 options, no variations`;

export async function analyzeMedia(
    imageUrl: string,
    context?: WeddingContext
): Promise<{ success: boolean; data?: AnalysisResult; error?: string }> {
    try {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error("OpenAI API Key not configured");
        }

        // Build the full system prompt with wedding context
        const contextSection = buildContextSection(context);
        const fullSystemPrompt = SYSTEM_PROMPT_BASE + contextSection;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: fullSystemPrompt
                },
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Analyze this wedding photo. Perform complete visual sweep and return structured JSON:" },
                        {
                            type: "image_url",
                            image_url: {
                                "url": imageUrl,
                            },
                        },
                    ],
                },
            ],
            response_format: { type: "json_object" },
        });

        const content = response.choices[0].message.content;
        if (!content) throw new Error("No content returned from AI");

        const rawData = JSON.parse(content);

        // Normalize data before validation
        const normalizedData = {
            description: rawData.description || "Foto de casamento",
            tags: Array.isArray(rawData.tags) ? rawData.tags : [],
            moment: rawData.moment || "Outro",
            risk_flags: Array.isArray(rawData.risk_flags) ? rawData.risk_flags : [],
        };

        // Use safeParse with catch() to gracefully handle invalid values
        const validatedData = analysisSchema.parse(normalizedData);

        return { success: true, data: validatedData };

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Failed to analyze image";
        console.error("AI Analysis Error:", error);
        return { success: false, error: errorMessage };
    }
}
