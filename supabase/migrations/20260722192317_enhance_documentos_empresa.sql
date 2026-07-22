-- Ensure columns exist (idempotent)
ALTER TABLE public.documentos_empresa ADD COLUMN IF NOT EXISTS cpf_socio TEXT;
ALTER TABLE public.documentos_empresa ADD COLUMN IF NOT EXISTS senhas_acesso JSONB DEFAULT '[]'::jsonb;

-- Document the JSONB structure of documentos column
COMMENT ON COLUMN public.documentos_empresa.documentos IS
  'JSONB array of document objects: {id, name, path, type, createdAt, category (Constituicao | Certidoes e Afins), expiryDate}';

-- Document the JSONB structure of senhas_acesso column
COMMENT ON COLUMN public.documentos_empresa.senhas_acesso IS
  'JSONB array of up to 6 credential objects: {identificacao, senha}';

-- Ensure RLS policies exist (idempotent)
DROP POLICY IF EXISTS "authenticated_select_documentos_empresa" ON public.documentos_empresa;
CREATE POLICY "authenticated_select_documentos_empresa" ON public.documentos_empresa
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_documentos_empresa" ON public.documentos_empresa;
CREATE POLICY "authenticated_insert_documentos_empresa" ON public.documentos_empresa
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_documentos_empresa" ON public.documentos_empresa;
CREATE POLICY "authenticated_update_documentos_empresa" ON public.documentos_empresa
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_documentos_empresa" ON public.documentos_empresa;
CREATE POLICY "authenticated_delete_documentos_empresa" ON public.documentos_empresa
  FOR DELETE TO authenticated USING (true);

-- Ensure storage bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos-empresa', 'documentos-empresa', false)
ON CONFLICT (id) DO NOTHING;

-- Ensure storage RLS policies exist
DROP POLICY IF EXISTS "authenticated_manage_documentos_empresa_storage" ON storage.objects;
CREATE POLICY "authenticated_manage_documentos_empresa_storage" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'documentos-empresa')
  WITH CHECK (bucket_id = 'documentos-empresa');
