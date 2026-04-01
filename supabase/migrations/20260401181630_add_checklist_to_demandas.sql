DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'demandas' AND column_name = 'checklist') THEN
    ALTER TABLE public.demandas ADD COLUMN checklist JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;
