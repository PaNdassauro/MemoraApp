# Memora - Intelligent Asset Manager

Um Asset Manager inteligente estilo Google Drive com classificação automática de fotos por IA.

![Memora](https://images.unsplash.com/photo-1627353802139-9820d31b6a7c?w=800)

## 🚀 Features

- **Upload de Fotos** - Drag & drop ou seleção de arquivos
- **Classificação por IA** - Categorização automática com tags, descrição e cores
- **Busca Semântica** - Pesquise por tags, categorias ou descrições
- **Grid Responsivo** - Visualização estilo Drive
- **Modal de Detalhes** - Veja metadados completos da IA
- **Categorias Dinâmicas** - Sidebar atualiza automaticamente

## 🛠️ Stack Técnica

| Tecnologia | Uso |
|------------|-----|
| React + Vite | Frontend |
| TypeScript | Tipagem |
| Tailwind CSS | Estilos |
| Lucide React | Ícones |
| Supabase | Backend/DB/Storage |
| pgvector | Busca semântica |

## 📦 Instalação

```bash
# Clone o repositório
git clone https://github.com/PaNdassauro/MemoraApp.git
cd MemoraApp

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais do Supabase

# Rode o projeto
npm run dev
```

## 🔧 Configuração do Supabase

### 1. Crie um projeto no Supabase

Acesse [supabase.com](https://supabase.com) e crie um novo projeto.

### 2. Aplique a migration

No SQL Editor do Supabase, execute o conteúdo de:
```
supabase/migrations/001_create_photos_table.sql
```

### 3. Crie o bucket de Storage

1. Vá em Storage > Create new bucket
2. Nome: `photos`
3. Marque como **public** para permitir visualização das imagens

### 4. Configure as variáveis

Copie as credenciais de Settings > API para o arquivo `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── ui/              # 48 componentes UI (Button, Card, etc.)
│   ├── figma/           # ImageWithFallback helper
│   ├── LandingPage.tsx  # Landing page
│   ├── AppUI.tsx        # Interface principal
│   └── PhotoModal.tsx   # Modal de visualização
├── hooks/
│   ├── useImageProcessor.ts  # IA Mock (Bibliotecário)
│   ├── useUpload.ts          # Upload para Supabase
│   └── usePhotos.ts          # CRUD de fotos
├── styles/
│   └── theme.css        # Design system
├── lib/
│   └── supabase.ts      # Cliente Supabase
└── types/
    └── index.ts         # Tipos TypeScript
```

## 🤖 Como Funciona a IA (Mock)

Atualmente, o hook `useImageProcessor.ts` simula a classificação de IA. 

Para integrar uma IA real:
1. Crie uma Edge Function no Supabase
2. Chame OpenAI Vision API ou Google Cloud Vision
3. Retorne o JSON no formato:

```json
{
  "category": "Viagem",
  "tags": ["praia", "verão", "férias"],
  "description": "Foto de uma praia tropical ao pôr do sol",
  "colors": ["#FF6B35", "#004E89", "#1A1A2E"],
  "confidence": 0.95
}
```

## 📝 Próximos Passos

- [ ] Autenticação com Supabase Auth
- [ ] Integração real com OpenAI Vision
- [ ] Embeddings para busca semântica
- [ ] Álbuns e pastas
- [ ] Compartilhamento de fotos

## 📄 Licença

MIT
