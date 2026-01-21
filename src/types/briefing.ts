// =============================================================================
// Memora Briefing Types
// Gestão de Casamentos, Fornecedores e Direitos de Uso
// =============================================================================

// -----------------------------------------------------------------------------
// ENUMS
// -----------------------------------------------------------------------------

export type WeddingStatus = 'em_producao' | 'finalizado' | 'publicado' | 'arquivado';

export type WeddingType = 'destination' | 'elopement' | 'tradicional' | 'intimo' | 'outro';

export type PersonRole = 'noiva' | 'noivo' | 'parceiro' | 'parceira';

export type ConsentStatus = 'nao_solicitado' | 'solicitado' | 'aprovado' | 'negado' | 'expirado';

export type AuthorizationType = 'termo_assinado' | 'email_whatsapp' | 'clausula_contrato';

export type VendorCategory =
    | 'fotografia'
    | 'video'
    | 'decoracao'
    | 'beauty'
    | 'assessoria'
    | 'buffet'
    | 'musica'
    | 'florista'
    | 'convites'
    | 'outro';

export type MediaType = 'foto' | 'video' | 'reel' | 'corte';

export type MediaMoment = 'making_of' | 'cerimonia' | 'festa' | 'ensaio' | 'detalhes' | 'outro';

export type PublicationStatus = 'nao_usado' | 'selecionado' | 'postado_organico' | 'usado_ads';

export type PublicationChannel =
    | 'ig_feed'
    | 'ig_reels'
    | 'ig_stories'
    | 'tiktok'
    | 'site'
    | 'ads'
    | 'pr_imprensa'
    | 'portfolio'
    | 'proposta_comercial';

// -----------------------------------------------------------------------------
// ENTITIES
// -----------------------------------------------------------------------------

/**
 * 1. Wedding (Casamento) - Tabela Mestre
 */
export interface Wedding {
    id: string;
    created_at: string;
    updated_at: string;

    // Informações básicas
    nome_casal: string;
    data_casamento: string | null;

    // Localização
    destino_pais: string | null;
    destino_cidade: string | null;
    venue: string | null;

    // Classificação
    tipo: WeddingType;
    status: WeddingStatus;

    // Links OneDrive
    pasta_raw: string | null;
    pasta_selecao: string | null;
    pasta_finais: string | null;

    // Responsáveis
    responsavel_planner: string | null;
    responsavel_atendimento: string | null;
    responsavel_marketing: string | null;

    // Editorial
    observacoes_editoriais: string | null;

    // Relacionamentos carregados
    persons?: Person[];
    consents?: Consent[];
    wedding_vendors?: WeddingVendor[];
    medias?: Media[];
}

/**
 * 2. Person (Pessoa do Casal)
 */
export interface Person {
    id: string;
    created_at: string;
    wedding_id: string;

    nome: string;
    papel: PersonRole;

    instagram: string | null;
    tiktok: string | null;
    outras_redes: SocialNetwork[];
    contato: string | null;

    // Relacionamento
    wedding?: Wedding;
}

export interface SocialNetwork {
    rede: string;
    handle: string;
}

/**
 * 3. Consent (Consentimento/Release)
 */
export interface Consent {
    id: string;
    created_at: string;
    updated_at: string;

    wedding_id: string;
    person_id: string | null;

    // Escopo
    escopo_casal: boolean;
    escopo_pessoa_especifica: boolean;
    escopo_convidados: boolean;
    escopo_menores: boolean;

    // Status
    status: ConsentStatus;
    tipo_autorizacao: AuthorizationType | null;

    // Uso permitido
    uso_organico: boolean;
    uso_ads: boolean;
    uso_pr_imprensa: boolean;
    uso_portfolio: boolean;
    uso_materiais_comerciais: boolean;

    // Restrições
    restricao_nao_marcar_casal: boolean;
    restricao_nao_citar_local: boolean;
    restricao_nao_mostrar_rosto: boolean;
    restricao_nao_mostrar_criancas: boolean;
    restricoes_detalhadas: string | null;

    // Comprovação
    data_aprovacao: string | null;
    anexo_url: string | null;

    // Relacionamentos
    wedding?: Wedding;
    person?: Person;
}

/**
 * 4. Vendor (Fornecedor)
 */
export interface Vendor {
    id: string;
    created_at: string;
    updated_at: string;

    nome: string;
    categoria: VendorCategory;

    instagram: string | null;
    site: string | null;
    cidade_pais: string | null;
    contato: string | null;
    observacoes: string | null;

    // Relacionamentos
    wedding_vendors?: WeddingVendor[];
}

/**
 * 5. WeddingVendor (Ficha Técnica - Join Table)
 */
export interface WeddingVendor {
    id: string;
    created_at: string;

    wedding_id: string;
    vendor_id: string;

    funcao_evento: string | null;
    credito_obrigatorio: boolean;
    texto_credito: string | null;
    permissao_repost: 'sim' | 'nao' | 'condicional';

    // Relacionamentos
    wedding?: Wedding;
    vendor?: Vendor;
}

/**
 * 6. Media (Mídia)
 */
export interface Media {
    id: string;
    created_at: string;
    updated_at: string;

    wedding_id: string;

    // Arquivo
    tipo: MediaType;
    link_arquivo: string;
    storage_path: string | null;
    thumbnail_url: string | null;
    file_name: string | null;

    // Classificação
    momento: MediaMoment | null;
    tags: string[];
    is_hero: boolean;

    // Governança
    uso_permitido_override: UsagePermissions | null;

    // Riscos
    mostra_rosto: boolean;
    mostra_crianca: boolean;
    conteudo_sensivel: boolean;
    restricoes_adicionais: string | null;

    // Status
    status_publicacao: PublicationStatus;

    // AI
    ai_metadata: AIMetadata | null;
    embedding: number[] | null;

    // Relacionamentos
    wedding?: Wedding;
    publications?: Publication[];
}

export interface UsagePermissions {
    organico?: boolean;
    ads?: boolean;
    pr_imprensa?: boolean;
    portfolio?: boolean;
    materiais_comerciais?: boolean;
}

export interface AIMetadata {
    category?: string;
    tags?: string[];
    description?: string;
    colors?: string[];
    objects?: string[];
    confidence?: number;
}

/**
 * 7. Publication (Publicação)
 */
export interface Publication {
    id: string;
    created_at: string;

    wedding_id: string | null;
    media_id: string | null;

    canal: PublicationChannel;
    data_publicacao: string;
    link_post: string | null;
    creditos_usados: string | null;

    // Relacionamentos
    wedding?: Wedding;
    media?: Media;
}

// -----------------------------------------------------------------------------
// INPUT TYPES (Para criação/atualização)
// -----------------------------------------------------------------------------

export type WeddingInsert = Omit<Wedding, 'id' | 'created_at' | 'updated_at' | 'persons' | 'consents' | 'wedding_vendors' | 'medias'>;
export type WeddingUpdate = Partial<WeddingInsert>;

export type PersonInsert = Omit<Person, 'id' | 'created_at' | 'wedding'>;
export type PersonUpdate = Partial<Omit<PersonInsert, 'wedding_id'>>;

export type ConsentInsert = Omit<Consent, 'id' | 'created_at' | 'updated_at' | 'wedding' | 'person'>;
export type ConsentUpdate = Partial<Omit<ConsentInsert, 'wedding_id'>>;

export type VendorInsert = Omit<Vendor, 'id' | 'created_at' | 'updated_at' | 'wedding_vendors'>;
export type VendorUpdate = Partial<VendorInsert>;

export type WeddingVendorInsert = Omit<WeddingVendor, 'id' | 'created_at' | 'wedding' | 'vendor'>;

export type MediaInsert = Omit<Media, 'id' | 'created_at' | 'updated_at' | 'wedding' | 'publications'>;
export type MediaUpdate = Partial<Omit<MediaInsert, 'wedding_id'>>;

export type PublicationInsert = Omit<Publication, 'id' | 'created_at' | 'wedding' | 'media'>;

// -----------------------------------------------------------------------------
// UTILITY TYPES
// -----------------------------------------------------------------------------

/** Resultado da função check_media_usage_allowed */
export interface MediaUsageCheckResult {
    allowed: boolean;
    reason: string;
    restrictions: string[];
}
