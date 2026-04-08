DO $$
BEGIN
  -- 1. Add endereco to leads
  ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS endereco TEXT;

  -- 2. Add lead_id and demanda_id to agenda_eventos for universal scheduling
  ALTER TABLE public.agenda_eventos ADD COLUMN IF NOT EXISTS lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE;
  ALTER TABLE public.agenda_eventos ADD COLUMN IF NOT EXISTS demanda_id UUID REFERENCES public.demandas(id) ON DELETE CASCADE;
END $$;
