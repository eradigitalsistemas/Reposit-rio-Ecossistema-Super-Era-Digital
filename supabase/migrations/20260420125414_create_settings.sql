CREATE TABLE IF NOT EXISTS public.configuracoes (
  chave TEXT PRIMARY KEY,
  valor TEXT NOT NULL,
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins gerenciam configuracoes" ON public.configuracoes;
CREATE POLICY "Admins gerenciam configuracoes" ON public.configuracoes
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Colaboradores leem configuracoes" ON public.configuracoes;
CREATE POLICY "Colaboradores leem configuracoes" ON public.configuracoes
  FOR SELECT TO authenticated
  USING (true);
