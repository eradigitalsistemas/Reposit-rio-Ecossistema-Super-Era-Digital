-- Garante que a tabela logs_auditoria tenha RLS permissiva para os usuários do sistema
DROP POLICY IF EXISTS "allow_all_logs_auditoria" ON public.logs_auditoria;
CREATE POLICY "allow_all_logs_auditoria" ON public.logs_auditoria FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Garante que a tabela agenda_eventos tenha RLS permissiva para os usuários do sistema
DROP POLICY IF EXISTS "allow_all_agenda_eventos" ON public.agenda_eventos;
CREATE POLICY "allow_all_agenda_eventos" ON public.agenda_eventos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Garante que o bucket de anexos exista
INSERT INTO storage.buckets (id, name, public) VALUES ('anexos', 'anexos', true) ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage para o bucket 'anexos'
DROP POLICY IF EXISTS "Allow public read for anexos" ON storage.objects;
CREATE POLICY "Allow public read for anexos" ON storage.objects FOR SELECT USING (bucket_id = 'anexos');

DROP POLICY IF EXISTS "Allow authenticated insert for anexos" ON storage.objects;
CREATE POLICY "Allow authenticated insert for anexos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'anexos');

DROP POLICY IF EXISTS "Allow authenticated update for anexos" ON storage.objects;
CREATE POLICY "Allow authenticated update for anexos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'anexos');

DROP POLICY IF EXISTS "Allow authenticated delete for anexos" ON storage.objects;
CREATE POLICY "Allow authenticated delete for anexos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'anexos');
