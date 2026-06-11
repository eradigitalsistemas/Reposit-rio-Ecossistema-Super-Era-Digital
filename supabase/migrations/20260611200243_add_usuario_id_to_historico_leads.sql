DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'historico_leads' 
      AND column_name = 'usuario_id'
  ) THEN
    ALTER TABLE public.historico_leads ADD COLUMN usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

DROP POLICY IF EXISTS "allow_all_historico_leads" ON public.historico_leads;
CREATE POLICY "allow_all_historico_leads" ON public.historico_leads
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
