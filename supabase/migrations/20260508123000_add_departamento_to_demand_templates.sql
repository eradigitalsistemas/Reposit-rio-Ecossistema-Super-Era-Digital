DO $$
BEGIN
  ALTER TABLE public.demand_templates ADD COLUMN IF NOT EXISTS departamento TEXT DEFAULT 'Geral';
END $$;
