import { z } from "zod";

// --- Enums Matching Database (Migration 005) ---

export const WeddingTypeEnum = z.enum(['Destination', 'Elopement', 'Mini-Wedding', 'Clássico', 'Outro']);
export const WeddingStatusEnum = z.enum(['Em produção', 'Finalizado', 'Publicado', 'Arquivado']);
export type WeddingType = z.infer<typeof WeddingTypeEnum>;
export type WeddingStatus = z.infer<typeof WeddingStatusEnum>;
export type CoupleRole = z.infer<typeof CoupleRoleEnum>;
export type ConsentScope = z.infer<typeof ConsentScopeEnum>;
export type ConsentStatus = z.infer<typeof ConsentStatusEnum>;
export type AuthType = z.infer<typeof AuthTypeEnum>;
export type UsagePermission = z.infer<typeof UsagePermissionEnum>;
export type Restriction = z.infer<typeof RestrictionEnum>;
export type VendorCategory = z.infer<typeof VendorCategoryEnum>;
export type RepostPermission = z.infer<typeof RepostPermissionEnum>;
export type MediaMoment = z.infer<typeof MediaMomentEnum>;
export type UsageOverride = z.infer<typeof UsageOverrideEnum>;
export type PublicationStatus = z.infer<typeof PublicationStatusEnum>;
export type RiskFlag = z.infer<typeof RiskFlagEnum>;

export const CoupleRoleEnum = z.enum(['Noiva', 'Noivo', 'Noive', 'Parceiro(a)']);

// Consents
export const ConsentScopeEnum = z.enum(['Casal', 'Pessoa Específica', 'Convidados/Menores']);
export const ConsentStatusEnum = z.enum(['Não solicitado', 'Solicitado', 'Aprovado', 'Negado', 'Expirado']);
export const AuthTypeEnum = z.enum(['Termo assinado', 'Email/Whatsapp', 'Contrato']);
export const UsagePermissionEnum = z.enum(['Orgânico', 'Ads', 'PR', 'Portfólio', 'Materiais Comerciais']);
export const RestrictionEnum = z.enum(['Não marcar casal', 'Não citar local', 'Não mostrar rosto', 'Não mostrar crianças']);

// Vendors
export const VendorCategoryEnum = z.enum(['Fotografia', 'Vídeo', 'Decor', 'Beauty', 'Venue', 'Música', 'Assessoria', 'Buffet', 'Outro']);
export const RepostPermissionEnum = z.enum(['Sim', 'Não', 'Condicional']);

// Media
export const MediaMomentEnum = z.enum(['Cerimônia', 'Festa', 'Making of', 'Decoração', 'Ensaio', 'Outro']);
export const UsageOverrideEnum = z.enum(['Liberado', 'Bloqueado', 'Restrito']);
export const PublicationStatusEnum = z.enum(['Não usado', 'Selecionado', 'Postado orgânico', 'Ads', 'Portfólio']);
export const RiskFlagEnum = z.enum(['Mostra rosto', 'Mostra criança', 'Mostra convidados', 'Conteúdo sensível']);

// --- Schemas ---

export const coupleSchema = z.object({
    id: z.string().optional(),
    wedding_id: z.string().optional(),
    name: z.string().min(1, "Nome é obrigatório"),
    role: CoupleRoleEnum,
    instagram: z.string().optional(),
    tiktok: z.string().optional(),
    other_socials: z.string().optional(),
    contact_info: z.string().optional(),
});

export const consentSchema = z.object({
    id: z.string().optional(),
    wedding_id: z.string().optional(),
    person_id: z.string().optional().nullable(),
    scope: ConsentScopeEnum,
    status: ConsentStatusEnum.default('Não solicitado'),
    auth_type: AuthTypeEnum.optional(),
    usage_permissions: z.array(UsagePermissionEnum).default([]),
    restrictions: z.array(RestrictionEnum).default([]),
    restriction_details: z.string().optional(),
    approval_date: z.string().optional(),
    proof_link: z.string().url("Link inválido").optional().or(z.literal("")),
});

export const vendorSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Nome do fornecedor é obrigatório"),
    category: VendorCategoryEnum,
    instagram: z.string().optional(),
    site: z.string().url().optional().or(z.literal("")),
    city_country: z.string().optional(),
    notes: z.string().optional(),
});

export const weddingVendorSchema = z.object({
    id: z.string().optional(),
    wedding_id: z.string().optional(),
    vendor_id: z.string().min(1, "Fornecedor obrigatório"),
    role_in_event: z.string().optional(),
    is_mandatory_credit: z.boolean().default(false),
    custom_credit_text: z.string().optional(),
    repost_permission: RepostPermissionEnum.default('Sim'),
    notes: z.string().optional(),
});

export const mediaSchema = z.object({
    id: z.string().optional(),
    wedding_id: z.string().optional(),
    folder_id: z.string().optional().nullable(),
    type: z.enum(['Foto', 'Vídeo', 'Reel', 'Corte']).default('Foto'),
    file_url: z.string().url("URL inválida").or(z.literal("")),
    thumbnail_url: z.string().url("URL inválida").optional().or(z.literal("")),
    description: z.string().optional(),
    moment: MediaMomentEnum.optional(),
    tags: z.array(z.string()).default([]), // Simple strings for now
    is_hero: z.boolean().default(false),

    // Governance
    usage_override: UsageOverrideEnum.default('Liberado'),
    risk_flags: z.array(RiskFlagEnum).default([]),
    publication_status: PublicationStatusEnum.default('Não usado'),
});

export const weddingSchema = z.object({
    id: z.string().optional(),
    slug: z.string().optional(),
    couple_name: z.string().min(1, "Nome do casal é obrigatório"),
    wedding_date: z.string().min(1, "Data do casamento é obrigatória").refine((val) => !isNaN(Date.parse(val)), {
        message: "Data inválida",
    }),
    destination_country: z.string().optional(),
    destination_city: z.string().optional(),
    hotel_name: z.string().optional(),
    venue_name: z.string().optional(),
    folder_id: z.string().optional().nullable(),
    wedding_type: WeddingTypeEnum,
    status: WeddingStatusEnum.default('Em produção'),

    // Links
    folder_raw: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    folder_selection: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    folder_finals: z.string().url("Must be a valid URL").optional().or(z.literal("")),

    // Relationships (For form usage - Nested)
    couples: z.array(coupleSchema).default([]),
    consents: z.array(consentSchema).default([]),
    vendors: z.array(weddingVendorSchema).default([]),
    media: z.array(mediaSchema).default([]),
});

export type WeddingFormValues = z.infer<typeof weddingSchema>;
export type CoupleFormValues = z.infer<typeof coupleSchema>;
export type ConsentFormValues = z.infer<typeof consentSchema>;
export type VendorFormValues = z.infer<typeof vendorSchema>;
export type WeddingVendorFormValues = z.infer<typeof weddingVendorSchema>;
export type MediaFormValues = z.infer<typeof mediaSchema>;
