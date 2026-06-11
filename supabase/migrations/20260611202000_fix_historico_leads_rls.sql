-- Fix RLS for historico_leads and ensure schema is correct

DO $$
BEGIN
  -- Double check that the usuario_id column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='historico_leads' AND column_name='usuario_id'
  ) THEN
    ALTER TABLE public.historico_leads ADD COLUMN usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Drop any existing policies that might conflict
DROP POLICY IF EXISTS "allow_all_historico_leads" ON public.historico_leads;
DROP POLICY IF EXISTS "historico_leads_select" ON public.historico_leads;
DROP POLICY IF EXISTS "historico_leads_insert" ON public.historico_leads;

-- Recreate properly scoped RLS policies
CREATE POLICY "historico_leads_select" ON public.historico_leads
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "historico_leads_insert" ON public.historico_leads
  FOR INSERT TO authenticated WITH CHECK (true);
