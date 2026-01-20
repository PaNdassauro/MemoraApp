# 🔒 Security TODO - Antes de Produção

> **IMPORTANTE:** Este documento lista configurações temporárias de segurança que DEVEM ser alteradas antes do deploy em produção.

---

## ⚠️ RLS (Row Level Security) - PERMISSIVO

### Status Atual: 🔴 INSEGURO (Desenvolvimento)

A policy atual permite qualquer operação sem autenticação:

```sql
-- TEMPORÁRIO - REMOVER EM PRODUÇÃO
CREATE POLICY "Allow all operations for development" ON photos
FOR ALL USING (true) WITH CHECK (true);
```

### Ação Necessária:
Quando implementar autenticação, execute:

```sql
-- 1. Remover policy permissiva
DROP POLICY "Allow all operations for development" ON photos;

-- 2. Restaurar policies seguras
CREATE POLICY "Users can view own photos" ON photos
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own photos" ON photos
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own photos" ON photos
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos" ON photos
FOR DELETE USING (auth.uid() = user_id);

-- 3. Tornar user_id obrigatório novamente
ALTER TABLE photos ALTER COLUMN user_id SET NOT NULL;
```

---

## ⚠️ Storage Bucket Policies

### Status Atual: 🔴 PÚBLICO (Desenvolvimento)

O bucket `photos` tem policies permissivas para desenvolvimento.

### Ação Necessária:
Configurar policies que verificam `auth.uid()`:

```sql
-- SELECT: Apenas dono pode ver
CREATE POLICY "Owner can view" ON storage.objects
FOR SELECT USING (
  bucket_id = 'photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- INSERT: Apenas usuário autenticado pode fazer upload
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'photos' AND 
  auth.role() = 'authenticated'
);

-- DELETE: Apenas dono pode deletar
CREATE POLICY "Owner can delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## ✅ Checklist Pré-Produção

- [ ] Implementar Supabase Auth (login/registro)
- [ ] Atualizar `useUpload.ts` para incluir `user_id` do usuário autenticado
- [ ] Executar SQL para restaurar RLS seguro (acima)
- [ ] Configurar Storage policies seguras
- [ ] Testar que usuários só veem suas próprias fotos
- [ ] Remover este arquivo ou marcar como concluído

---

## 📅 Arquivos Relacionados

| Arquivo | Contém |
|---------|--------|
| `supabase/migrations/001_create_photos_table.sql` | RLS original (seguro) |
| `supabase/migrations/003_dev_permissive_rls.sql` | RLS temporário (inseguro) |
| `src/hooks/useUpload.ts` | Precisa passar `user_id` |
| `src/lib/supabase.ts` | Cliente Supabase |
