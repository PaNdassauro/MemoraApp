-- Memora Briefing Schema
-- Gestão de Casamentos, Fornecedores e Direitos de Uso
-- Migration: 004_briefing_schema.sql

-- =============================================================================
-- ENUMS (Tipos customizados para campos com valores fixos)
-- =============================================================================

-- Status do casamento
CREATE TYPE wedding_status AS ENUM (
    'em_producao',
    'finalizado', 
    'publicado',
    'arquivado'
);

-- Tipo de casamento
CREATE TYPE wedding_type AS ENUM (
    'destination',
    'elopement',
    'tradicional',
    'intimo',
    'outro'
);

-- Papel da pessoa no casamento
CREATE TYPE person_role AS ENUM (
    'noiva',
    'noivo',
    'parceiro',
    'parceira'
);

-- Status do consentimento
CREATE TYPE consent_status AS ENUM (
    'nao_solicitado',
    'solicitado',
    'aprovado',
    'negado',
    'expirado'
);

-- Tipo de autorização
CREATE TYPE authorization_type AS ENUM (
    'termo_assinado',
    'email_whatsapp',
    'clausula_contrato'
);

-- Categoria de fornecedor
CREATE TYPE vendor_category AS ENUM (
    'fotografia',
    'video',
    'decoracao',
    'beauty',
    'assessoria',
    'buffet',
    'musica',
    'florista',
    'convites',
    'outro'
);

-- Tipo de mídia
CREATE TYPE media_type AS ENUM (
    'foto',
    'video',
    'reel',
    'corte'
);

-- Momento da mídia
CREATE TYPE media_moment AS ENUM (
    'making_of',
    'cerimonia',
    'festa',
    'ensaio',
    'detalhes',
    'outro'
);

-- Status de publicação da mídia
CREATE TYPE publication_status AS ENUM (
    'nao_usado',
    'selecionado',
    'postado_organico',
    'usado_ads'
);

-- Canal de publicação
CREATE TYPE publication_channel AS ENUM (
    'ig_feed',
    'ig_reels',
    'ig_stories',
    'tiktok',
    'site',
    'ads',
    'pr_imprensa',
    'portfolio',
    'proposta_comercial'
);

-- =============================================================================
-- 1. WEDDINGS (Casamentos - Tabela Mestre)
-- =============================================================================

CREATE TABLE weddings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    -- Informações básicas
    nome_casal TEXT NOT NULL,  -- Ex: "Bárbara & Rodrigo"
    data_casamento DATE,
    
    -- Localização
    destino_pais TEXT,
    destino_cidade TEXT,
    venue TEXT,
    
    -- Classificação
    tipo wedding_type DEFAULT 'tradicional',
    status wedding_status DEFAULT 'em_producao' NOT NULL,
    
    -- Links OneDrive
    pasta_raw TEXT,       -- Link pasta RAW/Brutos
    pasta_selecao TEXT,   -- Link pasta Seleção/Curadoria
    pasta_finais TEXT,    -- Link pasta Finais/Entrega
    
    -- Responsáveis internos
    responsavel_planner TEXT,
    responsavel_atendimento TEXT,
    responsavel_marketing TEXT,
    
    -- Editorial
    observacoes_editoriais TEXT  -- Pontos de narrativa, detalhes marcantes
);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_weddings_updated_at
    BEFORE UPDATE ON weddings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 2. PERSONS (Pessoas do Casal)
-- =============================================================================

CREATE TABLE persons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    -- Relacionamento
    wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
    
    -- Informações básicas
    nome TEXT NOT NULL,
    papel person_role NOT NULL,
    
    -- Redes sociais
    instagram TEXT,  -- @handle
    tiktok TEXT,
    outras_redes JSONB DEFAULT '[]'::jsonb,  -- Array de {rede, handle}
    
    -- Contato
    contato TEXT
);

CREATE INDEX persons_wedding_id_idx ON persons(wedding_id);

-- =============================================================================
-- 3. CONSENTS (Consentimentos e Direitos de Uso)
-- =============================================================================

CREATE TABLE consents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    -- Relacionamentos
    wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
    person_id UUID REFERENCES persons(id) ON DELETE SET NULL,  -- Opcional, para consentimento individual
    
    -- Escopo
    escopo_casal BOOLEAN DEFAULT false,       -- Ambos
    escopo_pessoa_especifica BOOLEAN DEFAULT false,
    escopo_convidados BOOLEAN DEFAULT false,
    escopo_menores BOOLEAN DEFAULT false,
    
    -- Status
    status consent_status DEFAULT 'nao_solicitado' NOT NULL,
    
    -- Tipo de autorização
    tipo_autorizacao authorization_type,
    
    -- Uso permitido (array de opções)
    uso_organico BOOLEAN DEFAULT false,
    uso_ads BOOLEAN DEFAULT false,
    uso_pr_imprensa BOOLEAN DEFAULT false,
    uso_portfolio BOOLEAN DEFAULT false,
    uso_materiais_comerciais BOOLEAN DEFAULT false,
    
    -- Restrições
    restricao_nao_marcar_casal BOOLEAN DEFAULT false,
    restricao_nao_citar_local BOOLEAN DEFAULT false,
    restricao_nao_mostrar_rosto BOOLEAN DEFAULT false,
    restricao_nao_mostrar_criancas BOOLEAN DEFAULT false,
    restricoes_detalhadas TEXT,
    
    -- Comprovação
    data_aprovacao DATE,
    anexo_url TEXT  -- Link do PDF/print/email
);

CREATE INDEX consents_wedding_id_idx ON consents(wedding_id);
CREATE INDEX consents_person_id_idx ON consents(person_id);
CREATE INDEX consents_status_idx ON consents(status);

CREATE TRIGGER update_consents_updated_at
    BEFORE UPDATE ON consents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 4. VENDORS (Fornecedores - Cadastro Mestre Global)
-- =============================================================================

CREATE TABLE vendors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    -- Informações básicas
    nome TEXT NOT NULL,
    categoria vendor_category NOT NULL,
    
    -- Redes e contato
    instagram TEXT,
    site TEXT,
    cidade_pais TEXT,
    contato TEXT,
    
    -- Observações
    observacoes TEXT  -- Ex: "Exige crédito sempre", "Ok repost"
);

CREATE INDEX vendors_categoria_idx ON vendors(categoria);
CREATE INDEX vendors_nome_idx ON vendors(nome);

CREATE TRIGGER update_vendors_updated_at
    BEFORE UPDATE ON vendors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 5. WEDDING_VENDORS (Ficha Técnica - Join entre Casamento e Fornecedores)
-- =============================================================================

CREATE TABLE wedding_vendors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    -- Relacionamentos
    wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    
    -- Detalhes do vínculo
    funcao_evento TEXT,  -- Ex: "Assessoria local", "Fotógrafo principal"
    credito_obrigatorio BOOLEAN DEFAULT false,
    texto_credito TEXT,  -- Ex: "Foto: @fulano"
    permissao_repost TEXT DEFAULT 'nao',  -- 'sim', 'nao', 'condicional'
    
    -- Evita duplicatas
    CONSTRAINT wedding_vendors_unique UNIQUE (wedding_id, vendor_id)
);

CREATE INDEX wedding_vendors_wedding_id_idx ON wedding_vendors(wedding_id);
CREATE INDEX wedding_vendors_vendor_id_idx ON wedding_vendors(vendor_id);

-- =============================================================================
-- 6. MEDIAS (Mídias - Governança por Ativo)
-- =============================================================================

CREATE TABLE medias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    -- Relacionamento
    wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
    
    -- Identificação do arquivo
    tipo media_type NOT NULL,
    link_arquivo TEXT NOT NULL,  -- Link OneDrive ou storage
    storage_path TEXT,           -- Path no Supabase Storage (se aplicável)
    thumbnail_url TEXT,
    file_name TEXT,
    
    -- Classificação
    momento media_moment,
    tags TEXT[] DEFAULT '{}',  -- Estilo, elementos, paleta
    
    -- Portfólio
    is_hero BOOLEAN DEFAULT false,  -- Flag "Hero/Portfólio"
    
    -- Governança de uso (herda do casamento + override manual)
    uso_permitido_override JSONB,  -- Override manual dos usos permitidos
    
    -- Riscos e restrições
    mostra_rosto BOOLEAN DEFAULT false,
    mostra_crianca BOOLEAN DEFAULT false,
    conteudo_sensivel BOOLEAN DEFAULT false,
    restricoes_adicionais TEXT,
    
    -- Status de publicação
    status_publicacao publication_status DEFAULT 'nao_usado',
    
    -- AI metadata (compatível com sistema existente)
    ai_metadata JSONB DEFAULT '{}'::jsonb,
    embedding vector(1536)  -- Para busca semântica
);

CREATE INDEX medias_wedding_id_idx ON medias(wedding_id);
CREATE INDEX medias_tipo_idx ON medias(tipo);
CREATE INDEX medias_momento_idx ON medias(momento);
CREATE INDEX medias_is_hero_idx ON medias(is_hero) WHERE is_hero = true;
CREATE INDEX medias_status_publicacao_idx ON medias(status_publicacao);
CREATE INDEX medias_tags_idx ON medias USING GIN(tags);

CREATE TRIGGER update_medias_updated_at
    BEFORE UPDATE ON medias
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 7. PUBLICATIONS (Publicações - Histórico de Uso)
-- =============================================================================

CREATE TABLE publications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    -- Relacionamentos
    wedding_id UUID REFERENCES weddings(id) ON DELETE SET NULL,
    media_id UUID REFERENCES medias(id) ON DELETE SET NULL,
    
    -- Detalhes da publicação
    canal publication_channel NOT NULL,
    data_publicacao TIMESTAMPTZ DEFAULT now(),
    link_post TEXT,
    
    -- Créditos
    creditos_usados TEXT  -- Gerado automático + revisado
);

CREATE INDEX publications_wedding_id_idx ON publications(wedding_id);
CREATE INDEX publications_media_id_idx ON publications(media_id);
CREATE INDEX publications_canal_idx ON publications(canal);
CREATE INDEX publications_data_idx ON publications(data_publicacao DESC);

-- =============================================================================
-- RLS (Row Level Security) - DESENVOLVIMENTO
-- =============================================================================
-- NOTA: Policies permissivas para desenvolvimento. 
-- Consulte docs/SECURITY_TODO.md para configuração de produção.

ALTER TABLE weddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE medias ENABLE ROW LEVEL SECURITY;
ALTER TABLE publications ENABLE ROW LEVEL SECURITY;

-- Policies permissivas para desenvolvimento
CREATE POLICY "Dev: Allow all on weddings" ON weddings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Dev: Allow all on persons" ON persons FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Dev: Allow all on consents" ON consents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Dev: Allow all on vendors" ON vendors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Dev: Allow all on wedding_vendors" ON wedding_vendors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Dev: Allow all on medias" ON medias FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Dev: Allow all on publications" ON publications FOR ALL USING (true) WITH CHECK (true);

-- =============================================================================
-- FUNÇÕES UTILITÁRIAS
-- =============================================================================

-- Função para verificar se uma mídia pode ser usada em um determinado contexto
CREATE OR REPLACE FUNCTION check_media_usage_allowed(
    p_media_id UUID,
    p_use_type TEXT  -- 'organico', 'ads', 'pr', 'portfolio', 'comercial'
)
RETURNS TABLE (
    allowed BOOLEAN,
    reason TEXT,
    restrictions TEXT[]
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_wedding_id UUID;
    v_consent RECORD;
    v_media RECORD;
    v_restrictions TEXT[] := '{}';
BEGIN
    -- Buscar mídia e casamento
    SELECT m.wedding_id, m.mostra_rosto, m.mostra_crianca, m.conteudo_sensivel
    INTO v_media
    FROM medias m
    WHERE m.id = p_media_id;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 'Mídia não encontrada', ARRAY[]::TEXT[];
        RETURN;
    END IF;
    
    v_wedding_id := v_media.wedding_id;
    
    -- Buscar consentimento do casamento
    SELECT * INTO v_consent
    FROM consents c
    WHERE c.wedding_id = v_wedding_id
    AND c.status = 'aprovado'
    LIMIT 1;
    
    -- Se não há consentimento aprovado, bloquear
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 'Sem consentimento aprovado para este casamento', ARRAY[]::TEXT[];
        RETURN;
    END IF;
    
    -- Coletar restrições ativas
    IF v_consent.restricao_nao_marcar_casal THEN
        v_restrictions := array_append(v_restrictions, 'Não marcar o casal');
    END IF;
    IF v_consent.restricao_nao_citar_local THEN
        v_restrictions := array_append(v_restrictions, 'Não citar local');
    END IF;
    IF v_consent.restricao_nao_mostrar_rosto AND v_media.mostra_rosto THEN
        v_restrictions := array_append(v_restrictions, 'Mídia mostra rosto - não permitido');
    END IF;
    IF v_consent.restricao_nao_mostrar_criancas AND v_media.mostra_crianca THEN
        v_restrictions := array_append(v_restrictions, 'Mídia mostra crianças - não permitido');
    END IF;
    
    -- Verificar permissão para o tipo de uso específico
    CASE p_use_type
        WHEN 'organico' THEN
            IF NOT v_consent.uso_organico THEN
                RETURN QUERY SELECT false, 'Uso orgânico não autorizado', v_restrictions;
                RETURN;
            END IF;
        WHEN 'ads' THEN
            IF NOT v_consent.uso_ads THEN
                RETURN QUERY SELECT false, 'Uso em Ads não autorizado', v_restrictions;
                RETURN;
            END IF;
        WHEN 'pr' THEN
            IF NOT v_consent.uso_pr_imprensa THEN
                RETURN QUERY SELECT false, 'Uso em PR/Imprensa não autorizado', v_restrictions;
                RETURN;
            END IF;
        WHEN 'portfolio' THEN
            IF NOT v_consent.uso_portfolio THEN
                RETURN QUERY SELECT false, 'Uso em portfólio não autorizado', v_restrictions;
                RETURN;
            END IF;
        WHEN 'comercial' THEN
            IF NOT v_consent.uso_materiais_comerciais THEN
                RETURN QUERY SELECT false, 'Uso em materiais comerciais não autorizado', v_restrictions;
                RETURN;
            END IF;
        ELSE
            RETURN QUERY SELECT false, 'Tipo de uso desconhecido', v_restrictions;
            RETURN;
    END CASE;
    
    -- Verificar se há restrições bloqueantes
    IF v_consent.restricao_nao_mostrar_rosto AND v_media.mostra_rosto THEN
        RETURN QUERY SELECT false, 'Mídia mostra rosto mas consentimento não permite', v_restrictions;
        RETURN;
    END IF;
    
    IF v_consent.restricao_nao_mostrar_criancas AND v_media.mostra_crianca THEN
        RETURN QUERY SELECT false, 'Mídia mostra crianças mas consentimento não permite', v_restrictions;
        RETURN;
    END IF;
    
    -- Uso permitido com possíveis restrições
    RETURN QUERY SELECT true, 'Uso permitido', v_restrictions;
END;
$$;

-- Função para gerar créditos automáticos de um casamento
CREATE OR REPLACE FUNCTION generate_wedding_credits(p_wedding_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_credits TEXT := '';
    v_vendor RECORD;
BEGIN
    FOR v_vendor IN
        SELECT v.nome, wv.texto_credito, v.instagram, wv.funcao_evento
        FROM wedding_vendors wv
        JOIN vendors v ON v.id = wv.vendor_id
        WHERE wv.wedding_id = p_wedding_id
        AND wv.credito_obrigatorio = true
        ORDER BY wv.funcao_evento
    LOOP
        IF v_credits != '' THEN
            v_credits := v_credits || E'\n';
        END IF;
        
        IF v_vendor.texto_credito IS NOT NULL THEN
            v_credits := v_credits || v_vendor.texto_credito;
        ELSIF v_vendor.instagram IS NOT NULL THEN
            v_credits := v_credits || v_vendor.funcao_evento || ': @' || v_vendor.instagram;
        ELSE
            v_credits := v_credits || v_vendor.funcao_evento || ': ' || v_vendor.nome;
        END IF;
    END LOOP;
    
    RETURN v_credits;
END;
$$;

-- =============================================================================
-- COMENTÁRIOS (Documentação no Schema)
-- =============================================================================

COMMENT ON TABLE weddings IS 'Tabela mestre de casamentos - centraliza todas as informações do evento';
COMMENT ON TABLE persons IS 'Pessoas do casal - para gestão individual de consentimento';
COMMENT ON TABLE consents IS 'Consentimentos e direitos de uso de imagem';
COMMENT ON TABLE vendors IS 'Cadastro mestre global de fornecedores/parceiros';
COMMENT ON TABLE wedding_vendors IS 'Ficha técnica - vinculação entre casamento e fornecedores';
COMMENT ON TABLE medias IS 'Mídias com governança individual por ativo';
COMMENT ON TABLE publications IS 'Histórico de publicações e uso de mídias';

COMMENT ON FUNCTION check_media_usage_allowed IS 'Verifica se uma mídia pode ser usada em um determinado contexto baseado nos consentimentos';
COMMENT ON FUNCTION generate_wedding_credits IS 'Gera automaticamente texto de créditos baseado nos fornecedores do casamento';
