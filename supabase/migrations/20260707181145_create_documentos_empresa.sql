CREATE TABLE IF NOT EXISTS public.documentos_empresa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa TEXT NOT NULL DEFAULT '',
  cnpj TEXT,
  responsavel TEXT,
  telefone TEXT,
  email TEXT,
  documentos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.documentos_empresa ENABLE ROW LEVEL SECURITY;

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

INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos-empresa', 'documentos-empresa', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "authenticated_manage_documentos_empresa_storage" ON storage.objects;
CREATE POLICY "authenticated_manage_documentos_empresa_storage" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'documentos-empresa')
  WITH CHECK (bucket_id = 'documentos-empresa');

CREATE OR REPLACE FUNCTION public.set_documentos_empresa_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_documentos_empresa_updated_at ON public.documentos_empresa;
CREATE TRIGGER trg_documentos_empresa_updated_at
  BEFORE UPDATE ON public.documentos_empresa
  FOR EACH ROW EXECUTE FUNCTION public.set_documentos_empresa_updated_at();
