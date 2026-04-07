DO $$
BEGIN
  ALTER TABLE public.agenda_eventos ADD COLUMN IF NOT EXISTS criado_por text;
END $$;
