CREATE TABLE IF NOT EXISTS public.demand_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  prioridade TEXT DEFAULT 'Pode Ficar para Amanhã',
  tipo_demanda TEXT DEFAULT 'Geral',
  checklist_id UUID REFERENCES public.checklist_templates(id) ON DELETE SET NULL,
  usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  data_criacao TIMESTAMPTZ DEFAULT NOW()
);

DROP POLICY IF EXISTS "allow_all_demand_templates" ON public.demand_templates;
CREATE POLICY "allow_all_demand_templates" ON public.demand_templates FOR ALL USING (true);

ALTER TABLE public.demand_templates ENABLE ROW LEVEL SECURITY;
