-- Adiciona a coluna usuario_id referenciando auth.users para associar quem registrou a interação
ALTER TABLE public.historico_leads 
  ADD COLUMN IF NOT EXISTS usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Garante que a política RLS existente possua a permissão correta para inserção de todos os campos
DROP POLICY IF EXISTS "allow_all_historico_leads" ON public.historico_leads;
CREATE POLICY "allow_all_historico_leads" ON public.historico_leads
  FOR ALL TO public
  USING (true) WITH CHECK (true);
