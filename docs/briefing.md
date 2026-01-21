Estrutura Recomendada do Catálogo (Entidades e Tabelas)

Este documento define a arquitetura de dados e as regras de governança para a gestão de casamentos, fornecedores e direitos de uso de imagem.

1. Casamentos (Tabela Mestre)

Entidade principal que centraliza as informações do evento.

Wedding_ID (ID Único/Chave Primária)

Nome do casal (Padrão: “Bárbara & Rodrigo”)

Data do casamento

Destino (País / Cidade)

Venue/Hotel

Tipo (Destination / Elopement / etc.)

Status (Em produção / Finalizado / Publicado / Arquivado)

Links de Pastas (OneDrive):

Pasta RAW (Brutos)

Pasta SELEÇÃO (Curadoria)

Pasta FINAIS (Entrega)

Responsáveis internos (Planner / Atendimento / Marketing)

Observações editoriais (Pontos de narrativa, detalhes marcantes)

2. Pessoas do Casal

Tabela para tratar individualmente o consentimento e marcações sociais.

Person_ID (ID Único)

Wedding_ID (Relacionamento com Casamento)

Nome

Papel (Noiva / Noivo / Parceiro(a))

Instagram (@handle)

TikTok (Opcional)

Outras redes / @

Contato (Opcional)

Consentimento de uso de imagem (Relacionado com Tabela 3)

3. Consentimentos e Direitos de Uso (Release)

Módulo de conformidade legal e gestão de risco.

Consent_ID (ID Único)

Wedding_ID (Relacionamento)

Escopo do consentimento:

( ) Casal (ambos)

( ) Pessoa específica (link com Person_ID)

( ) Convidados / menores

Status:

( ) Não solicitado

( ) Solicitado

( ) Aprovado

( ) Negado

( ) Expirado

Tipo de autorização:

( ) Termo assinado

( ) Autorização por e-mail/WhatsApp (com evidência)

( ) Cláusula em contrato

Uso permitido:

( ) Orgânico

( ) Ads / mídia paga

( ) PR / imprensa

( ) Portfólio no site

( ) Materiais comerciais (propostas)

Restrições:

( ) Não marcar o casal

( ) Não citar local

( ) Não mostrar rosto

( ) Não mostrar crianças

Campo texto: "Restrições detalhadas"

Data de aprovação

Anexo/Prova (Link do PDF / print / e-mail)

4. Fornecedores (Cadastro Mestre)

Banco de dados global de parceiros.

Vendor_ID (ID Único)

Nome

Categoria (Fotografia / Vídeo / Decor / Beauty / etc.)

Instagram

Site

Cidade/País

Contato

Observações (Ex: "Exige crédito sempre", "Ok repost")

5. Ficha Técnica do Casamento

Tabela de ligação (Join) entre Casamento e Fornecedores.

WeddingVendor_ID (ID Único)

Wedding_ID

Vendor_ID

Função no evento (Ex: "Assessoria local")

Crédito obrigatório? (Sim / Não)

Texto de crédito preferencial (Ex: "Foto: @fulano")

Permissão de repost do fornecedor (Sim / Não / Condicional)

6. Mídias (Foto/Vídeo)

Governança de uso individual por ativo.

Media_ID (ID Único)

Wedding_ID

Tipo (Foto / Vídeo / Reel / Corte)

Link do arquivo (OneDrive)

Thumbnail/Preview

Momento (Cerimônia / Festa / Making of / etc.)

Tags (Estilo, elementos, paleta, etc.)

Flag "Hero/Portfólio" (Sim / Não)

Uso permitido: (Herda do casamento + Override manual)

Risco/Restrição:

( ) Mostra rosto

( ) Mostra criança

( ) Conteúdo sensível

Status de publicação:

( ) Não usado

( ) Selecionado

( ) Postado orgânico

( ) Usado em Ads

7. Publicações

Rastreio histórico de uso.

Publish_ID (ID Único)

Wedding_ID / Media_ID

Canal (IG Feed, Reels, TikTok, Site, Ads, etc.)

Data

Link do post

Créditos usados (Gerado automático + revisado)

Regras de Governança

Sem consentimento aprovado: Bloqueio automático para portfólio/ads/orgânico.

Restrições ativas: O sistema deve disparar um aviso ao gerar legendas ou créditos.

Override de Mídia: Mesmo com o casamento liberado, uma mídia marcada como "bloqueada" não pode ser utilizada.