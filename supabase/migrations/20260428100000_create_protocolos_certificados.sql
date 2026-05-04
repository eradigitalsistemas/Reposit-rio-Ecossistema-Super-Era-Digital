CREATE TABLE IF NOT EXISTS public.protocolos_certificados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT NOT NULL,
  cliente TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('PF', 'PJ')),
  parceiro TEXT NOT NULL DEFAULT 'Novos Protocolos',
  data_criacao TIMESTAMPTZ DEFAULT NOW(),
  usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.protocolos_certificados ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all_protocolos_certificados" ON public.protocolos_certificados;
CREATE POLICY "allow_all_protocolos_certificados" ON public.protocolos_certificados
  FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_all_protocolos" ON public.protocolos_certificados;
CREATE POLICY "auth_all_protocolos" ON public.protocolos_certificados
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
