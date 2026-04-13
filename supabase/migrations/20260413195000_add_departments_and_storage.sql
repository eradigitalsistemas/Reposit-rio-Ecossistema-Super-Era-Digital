DO $do$
DECLARE
  dept text;
  depts text[] := ARRAY['Comercial', 'Suporte', 'Departamento Pessoal', 'CEO', 'Tático', 'Fiscal', 'Contábil'];
BEGIN
  FOREACH dept IN ARRAY depts
  LOOP
    IF NOT EXISTS (SELECT 1 FROM public.departments WHERE name = dept) THEN
      INSERT INTO public.departments (name) VALUES (dept);
    END IF;
  END LOOP;
END $do$;

-- Create storage bucket if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('employee-documents', 'employee-documents', false, 10485760, ARRAY['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO UPDATE SET 
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

-- Drop policies before creating to ensure idempotency
DROP POLICY IF EXISTS "Authenticated users can upload employee documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read employee documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete employee documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update employee documents" ON storage.objects;

CREATE POLICY "Authenticated users can upload employee documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'employee-documents');

CREATE POLICY "Authenticated users can read employee documents"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'employee-documents');

CREATE POLICY "Authenticated users can delete employee documents"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'employee-documents');

CREATE POLICY "Authenticated users can update employee documents"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'employee-documents')
WITH CHECK (bucket_id = 'employee-documents');
