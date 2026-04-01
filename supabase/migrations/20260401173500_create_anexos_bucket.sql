-- Migration: Setup anexos bucket for demands with public access

-- Create the anexos bucket as requested
INSERT INTO storage.buckets (id, name, public) 
VALUES ('anexos', 'anexos', true) 
ON CONFLICT (id) DO NOTHING;

-- Ensure it is public for getPublicUrl to work properly
UPDATE storage.buckets SET public = true WHERE id = 'anexos';

-- RLS Policies for the new bucket
DROP POLICY IF EXISTS "Admins e Colaboradores gerenciam anexos" ON storage.objects;
CREATE POLICY "Admins e Colaboradores gerenciam anexos" ON storage.objects
    FOR ALL TO authenticated
    USING (bucket_id = 'anexos')
    WITH CHECK (bucket_id = 'anexos');

-- Allow public read access to the bucket
DROP POLICY IF EXISTS "Acesso publico aos anexos" ON storage.objects;
CREATE POLICY "Acesso publico aos anexos" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id = 'anexos');
