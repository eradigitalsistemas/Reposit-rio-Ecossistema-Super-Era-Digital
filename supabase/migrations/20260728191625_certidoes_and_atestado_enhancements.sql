CREATE TABLE IF NOT EXISTS public.certidoes_empresa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.clientes_externos(id) ON DELETE CASCADE,
  tipo_certidao TEXT NOT NULL,
  arquivo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_certidoes_empresa_empresa ON public.certidoes_empresa(empresa_id);

ALTER TABLE public.certidoes_empresa ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_sel_certidoes_empresa" ON public.certidoes_empresa;
CREATE POLICY "auth_sel_certidoes_empresa" ON public.certidoes_empresa FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_ins_certidoes_empresa" ON public.certidoes_empresa;
CREATE POLICY "auth_ins_certidoes_empresa" ON public.certidoes_empresa FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_upd_certidoes_empresa" ON public.certidoes_empresa;
CREATE POLICY "auth_upd_certidoes_empresa" ON public.certidoes_empresa FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_del_certidoes_empresa" ON public.certidoes_empresa;
CREATE POLICY "auth_del_certidoes_empresa" ON public.certidoes_empresa FOR DELETE TO authenticated USING (true);

ALTER TABLE public.colaborador_atestados ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'Admissional';
ALTER TABLE public.colaborador_atestados ADD COLUMN IF NOT EXISTS data_vencimento DATE;
ALTER TABLE public.colaborador_atestados ADD COLUMN IF NOT EXISTS email_empresa TEXT;
ALTER TABLE public.colaborador_atestados ADD COLUMN IF NOT EXISTS whatsapp_empresa TEXT;
ALTER TABLE public.colaborador_atestados ADD COLUMN IF NOT EXISTS email_funcionario TEXT;
ALTER TABLE public.colaborador_atestados ADD COLUMN IF NOT EXISTS whatsapp_funcionario TEXT;

ALTER TABLE public.documentos_constituicao DROP CONSTRAINT IF EXISTS documentos_constituicao_tipo_check;

INSERT INTO storage.buckets (id, name, public) VALUES ('certidoes', 'certidoes', false) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "auth_manage_certidoes_storage" ON storage.objects;
CREATE POLICY "auth_manage_certidoes_storage" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'certidoes')
  WITH CHECK (bucket_id = 'certidoes');
