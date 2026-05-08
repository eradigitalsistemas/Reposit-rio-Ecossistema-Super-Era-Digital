ALTER TABLE public.demand_templates ADD COLUMN IF NOT EXISTS responsavel_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL;
