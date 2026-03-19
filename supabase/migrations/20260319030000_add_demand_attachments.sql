-- Migration: Add attachments to demands and setup storage

ALTER TABLE public.demandas ADD COLUMN IF NOT EXISTS anexos JSONB DEFAULT '[]'::jsonb;

-- Storage Setup for Demand Attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('demandas_anexos', 'demandas_anexos', false) 
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "Admins e Colaboradores gerenciam anexos de demandas" ON storage.objects
    FOR ALL TO authenticated
    USING (bucket_id = 'demandas_anexos')
    WITH CHECK (bucket_id = 'demandas_anexos');
