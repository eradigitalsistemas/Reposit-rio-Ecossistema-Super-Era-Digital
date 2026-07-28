-- Add empresa_id to colaboradores (references clientes_externos)
ALTER TABLE public.colaboradores ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.clientes_externos(id) ON DELETE SET NULL;

-- Drop CHECK constraint on colaborador_documentos.tipo to allow new types (RG, CPF, S2240, etc.)
ALTER TABLE public.colaborador_documentos DROP CONSTRAINT IF EXISTS colaborador_documentos_tipo_check;

-- Add status column to colaborador_documentos
ALTER TABLE public.colaborador_documentos ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pendente';

-- Create documentos_constituicao
CREATE TABLE IF NOT EXISTS public.documentos_constituicao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.clientes_externos(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('CNPJ', 'CONTRATO_SOCIAL', 'ALTERACOES_CONTRATUAIS')),
  arquivo_url TEXT,
  status TEXT NOT NULL DEFAULT 'Pendente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create sst_documents
CREATE TABLE IF NOT EXISTS public.sst_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.clientes_externos(id) ON DELETE CASCADE,
  categoria TEXT NOT NULL CHECK (categoria IN ('PGR', 'NR1', 'LTCAT', 'PCMSO')),
  arquivo_url TEXT,
  data_emissao DATE,
  data_validade DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create colaborador_atestados
CREATE TABLE IF NOT EXISTS public.colaborador_atestados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL DEFAULT 'admissional',
  aso_url TEXT,
  data DATE,
  medico TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create colaborador_periodicos
CREATE TABLE IF NOT EXISTS public.colaborador_periodicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  exames TEXT,
  periodicidade TEXT,
  arquivo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create colaborador_cat
CREATE TABLE IF NOT EXISTS public.colaborador_cat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('ACIDENTE', 'DOENCA', 'OUTRO')),
  numero TEXT,
  arquivo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create rescisao_checklist
CREATE TABLE IF NOT EXISTS public.rescisao_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.clientes_externos(id) ON DELETE CASCADE,
  colaborador_id UUID NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  item TEXT NOT NULL CHECK (item IN ('AVISO_PREVIO','TRCT','MULTA_40_FGTS','ASO_DEMISSIONAL','GUIA_SEGURO_DESEMPREGO','HOMOLOGACAO','CHAVE_ESOCIAL')),
  status TEXT NOT NULL DEFAULT 'Pendente',
  arquivo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_documentos_constituicao_empresa ON public.documentos_constituicao(empresa_id);
CREATE INDEX IF NOT EXISTS idx_sst_documents_empresa ON public.sst_documents(empresa_id);
CREATE INDEX IF NOT EXISTS idx_colaborador_atestados_colab ON public.colaborador_atestados(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_colaborador_periodicos_colab ON public.colaborador_periodicos(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_colaborador_cat_colab ON public.colaborador_cat(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_rescisao_checklist_empresa_colab ON public.rescisao_checklist(empresa_id, colaborador_id);
CREATE INDEX IF NOT EXISTS idx_colaboradores_empresa_id ON public.colaboradores(empresa_id);

-- Enable RLS
ALTER TABLE public.documentos_constituicao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sst_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colaborador_atestados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colaborador_periodicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colaborador_cat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rescisao_checklist ENABLE ROW LEVEL SECURITY;

-- RLS: documentos_constituicao
DROP POLICY IF EXISTS "auth_sel_documentos_constituicao" ON public.documentos_constituicao;
CREATE POLICY "auth_sel_documentos_constituicao" ON public.documentos_constituicao FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_ins_documentos_constituicao" ON public.documentos_constituicao;
CREATE POLICY "auth_ins_documentos_constituicao" ON public.documentos_constituicao FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_upd_documentos_constituicao" ON public.documentos_constituicao;
CREATE POLICY "auth_upd_documentos_constituicao" ON public.documentos_constituicao FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_del_documentos_constituicao" ON public.documentos_constituicao;
CREATE POLICY "auth_del_documentos_constituicao" ON public.documentos_constituicao FOR DELETE TO authenticated USING (true);

-- RLS: sst_documents
DROP POLICY IF EXISTS "auth_sel_sst_documents" ON public.sst_documents;
CREATE POLICY "auth_sel_sst_documents" ON public.sst_documents FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_ins_sst_documents" ON public.sst_documents;
CREATE POLICY "auth_ins_sst_documents" ON public.sst_documents FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_upd_sst_documents" ON public.sst_documents;
CREATE POLICY "auth_upd_sst_documents" ON public.sst_documents FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_del_sst_documents" ON public.sst_documents;
CREATE POLICY "auth_del_sst_documents" ON public.sst_documents FOR DELETE TO authenticated USING (true);

-- RLS: colaborador_atestados
DROP POLICY IF EXISTS "auth_sel_colaborador_atestados" ON public.colaborador_atestados;
CREATE POLICY "auth_sel_colaborador_atestados" ON public.colaborador_atestados FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_ins_colaborador_atestados" ON public.colaborador_atestados;
CREATE POLICY "auth_ins_colaborador_atestados" ON public.colaborador_atestados FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_upd_colaborador_atestados" ON public.colaborador_atestados;
CREATE POLICY "auth_upd_colaborador_atestados" ON public.colaborador_atestados FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_del_colaborador_atestados" ON public.colaborador_atestados;
CREATE POLICY "auth_del_colaborador_atestados" ON public.colaborador_atestados FOR DELETE TO authenticated USING (true);

-- RLS: colaborador_periodicos
DROP POLICY IF EXISTS "auth_sel_colaborador_periodicos" ON public.colaborador_periodicos;
CREATE POLICY "auth_sel_colaborador_periodicos" ON public.colaborador_periodicos FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_ins_colaborador_periodicos" ON public.colaborador_periodicos;
CREATE POLICY "auth_ins_colaborador_periodicos" ON public.colaborador_periodicos FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_upd_colaborador_periodicos" ON public.colaborador_periodicos;
CREATE POLICY "auth_upd_colaborador_periodicos" ON public.colaborador_periodicos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_del_colaborador_periodicos" ON public.colaborador_periodicos;
CREATE POLICY "auth_del_colaborador_periodicos" ON public.colaborador_periodicos FOR DELETE TO authenticated USING (true);

-- RLS: colaborador_cat
DROP POLICY IF EXISTS "auth_sel_colaborador_cat" ON public.colaborador_cat;
CREATE POLICY "auth_sel_colaborador_cat" ON public.colaborador_cat FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_ins_colaborador_cat" ON public.colaborador_cat;
CREATE POLICY "auth_ins_colaborador_cat" ON public.colaborador_cat FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_upd_colaborador_cat" ON public.colaborador_cat;
CREATE POLICY "auth_upd_colaborador_cat" ON public.colaborador_cat FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_del_colaborador_cat" ON public.colaborador_cat;
CREATE POLICY "auth_del_colaborador_cat" ON public.colaborador_cat FOR DELETE TO authenticated USING (true);

-- RLS: rescisao_checklist
DROP POLICY IF EXISTS "auth_sel_rescisao_checklist" ON public.rescisao_checklist;
CREATE POLICY "auth_sel_rescisao_checklist" ON public.rescisao_checklist FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_ins_rescisao_checklist" ON public.rescisao_checklist;
CREATE POLICY "auth_ins_rescisao_checklist" ON public.rescisao_checklist FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_upd_rescisao_checklist" ON public.rescisao_checklist;
CREATE POLICY "auth_upd_rescisao_checklist" ON public.rescisao_checklist FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_del_rescisao_checklist" ON public.rescisao_checklist;
CREATE POLICY "auth_del_rescisao_checklist" ON public.rescisao_checklist FOR DELETE TO authenticated USING (true);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('empresa-files', 'empresa-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS
DROP POLICY IF EXISTS "auth_manage_empresa_files_storage" ON storage.objects;
CREATE POLICY "auth_manage_empresa_files_storage" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'empresa-files')
  WITH CHECK (bucket_id = 'empresa-files');
