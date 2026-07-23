-- Extend colaboradores table with cpf and empresa_doc_id
ALTER TABLE public.colaboradores ADD COLUMN IF NOT EXISTS cpf TEXT;
ALTER TABLE public.colaboradores ADD COLUMN IF NOT EXISTS empresa_doc_id UUID REFERENCES public.documentos_empresa(id) ON DELETE CASCADE;

-- Create colaborador_documentos table
CREATE TABLE IF NOT EXISTS public.colaborador_documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('pessoal', 'admissional')),
  url TEXT NOT NULL,
  nome_arquivo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_colaborador_documentos_colaborador_id ON public.colaborador_documentos(colaborador_id);

-- Enable RLS on new table
ALTER TABLE public.colaborador_documentos ENABLE ROW LEVEL SECURITY;

-- RLS policies for colaborador_documentos
DROP POLICY IF EXISTS "authenticated_select_colaborador_documentos" ON public.colaborador_documentos;
CREATE POLICY "authenticated_select_colaborador_documentos" ON public.colaborador_documentos
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_colaborador_documentos" ON public.colaborador_documentos;
CREATE POLICY "authenticated_insert_colaborador_documentos" ON public.colaborador_documentos
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_colaborador_documentos" ON public.colaborador_documentos;
CREATE POLICY "authenticated_delete_colaborador_documentos" ON public.colaborador_documentos
  FOR DELETE TO authenticated USING (true);

-- RLS for colaboradores (ensure existing policies cover new columns)
ALTER TABLE public.colaboradores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all_colaboradores" ON public.colaboradores;
CREATE POLICY "allow_all_colaboradores" ON public.colaboradores
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Storage bucket for colaborador documents (reuse documentos-empresa bucket)
-- Add storage policies for colaborador paths within existing bucket
DROP POLICY IF EXISTS "authenticated_manage_colaborador_docs_storage" ON storage.objects;
CREATE POLICY "authenticated_manage_colaborador_docs_storage" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'documentos-empresa')
  WITH CHECK (bucket_id = 'documentos-empresa');
