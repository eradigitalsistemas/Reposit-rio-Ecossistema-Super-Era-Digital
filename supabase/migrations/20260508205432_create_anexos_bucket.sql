DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('anexos', 'anexos', true) 
  ON CONFLICT (id) DO NOTHING;
END $$;

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'anexos');

DROP POLICY IF EXISTS "Auth Insert" ON storage.objects;
CREATE POLICY "Auth Insert" ON storage.objects 
  FOR INSERT TO authenticated 
  WITH CHECK (bucket_id = 'anexos');
