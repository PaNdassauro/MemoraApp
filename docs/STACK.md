# Memora - Stack & Dependências

## 🎯 Visão Geral

| Categoria | Tecnologia | Versão |
|-----------|-----------|--------|
| **Runtime** | Node.js | 18+ |
| **Framework** | React | 19.2.0 |
| **Build Tool** | Vite | 7.2.4 |
| **Linguagem** | TypeScript | 5.9.3 |
| **Estilos** | Tailwind CSS | 4.1.18 |
| **Backend** | Supabase | 2.91.0 |

---

## 📦 Dependências de Produção

| Pacote | Versão | Uso |
|--------|--------|-----|
| `react` | ^19.2.0 | Framework UI |
| `react-dom` | ^19.2.0 | React DOM renderer |
| `@supabase/supabase-js` | ^2.91.0 | Cliente Supabase (Auth, DB, Storage) |
| `lucide-react` | ^0.562.0 | Biblioteca de ícones |
| `@radix-ui/react-scroll-area` | ^1.2.10 | Área de scroll customizada |
| `@radix-ui/react-slot` | ^1.2.4 | Composição de componentes |
| `class-variance-authority` | ^0.7.1 | Variantes de classes CSS |
| `clsx` | ^2.1.1 | Utilitário para classNames |
| `tailwind-merge` | ^3.4.0 | Merge inteligente de classes Tailwind |

---

## 🛠️ Dependências de Desenvolvimento

| Pacote | Versão | Uso |
|--------|--------|-----|
| `vite` | ^7.2.4 | Build tool & dev server |
| `@vitejs/plugin-react` | ^5.1.1 | Plugin React para Vite |
| `tailwindcss` | ^4.1.18 | Framework CSS |
| `@tailwindcss/vite` | ^4.1.18 | Plugin Tailwind para Vite |
| `typescript` | ~5.9.3 | Tipagem estática |
| `@types/react` | ^19.2.5 | Tipos para React |
| `@types/react-dom` | ^19.2.3 | Tipos para React DOM |
| `@types/node` | ^24.10.1 | Tipos para Node.js |
| `eslint` | ^9.39.1 | Linter JavaScript/TypeScript |
| `@eslint/js` | ^9.39.1 | Configurações ESLint |
| `typescript-eslint` | ^8.46.4 | Plugin ESLint para TypeScript |
| `eslint-plugin-react-hooks` | ^7.0.1 | Regras para React Hooks |
| `eslint-plugin-react-refresh` | ^0.4.24 | Suporte HMR para ESLint |
| `globals` | ^16.5.0 | Variáveis globais para ESLint |

---

## 🗄️ Backend (Supabase)

### Serviços Utilizados
- **Auth** - Autenticação de usuários (preparado)
- **PostgreSQL** - Banco de dados relacional
- **Storage** - Armazenamento de imagens
- **pgvector** - Extensão para busca semântica (embeddings)

### Tabelas
```sql
photos (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP,
  user_id UUID REFERENCES auth.users,
  storage_url TEXT,
  file_name TEXT,
  metadata JSONB,
  embedding VECTOR(1536)
)
```

---

## 📂 Estrutura de Componentes UI

48 componentes Shadcn-like em `src/components/ui/`:
- Button, Card, Input, Badge
- ScrollArea, Separator
- Dialog, Dropdown, Tooltip
- E outros...

---

## 🚀 Scripts NPM

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run lint     # Verificação de código
npm run preview  # Preview do build
```

---

## 📋 Requisitos do Sistema

- Node.js 18+
- npm 8+
- Conta Supabase (para backend)
