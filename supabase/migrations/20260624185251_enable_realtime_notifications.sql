-- Enable REPLICA IDENTITY FULL for realtime compliance
ALTER TABLE public.notificacoes REPLICA IDENTITY FULL;

-- Add notificacoes to publication supabase_realtime
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notificacoes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notificacoes;
  END IF;
END $$;

-- Ensure RLS policies exist for notificacoes
DROP POLICY IF EXISTS "authenticated_select_notificacoes" ON public.notificacoes;
CREATE POLICY "authenticated_select_notificacoes" ON public.notificacoes
  FOR SELECT TO authenticated USING (usuario_id = auth.uid() OR usuario_id IS NULL);

DROP POLICY IF EXISTS "authenticated_update_notificacoes" ON public.notificacoes;
CREATE POLICY "authenticated_update_notificacoes" ON public.notificacoes
  FOR UPDATE TO authenticated USING (usuario_id = auth.uid()) WITH CHECK (usuario_id = auth.uid());

DROP POLICY IF EXISTS "authenticated_insert_notificacoes" ON public.notificacoes;
CREATE POLICY "authenticated_insert_notificacoes" ON public.notificacoes
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_notificacoes" ON public.notificacoes;
CREATE POLICY "authenticated_delete_notificacoes" ON public.notificacoes
  FOR DELETE TO authenticated USING (usuario_id = auth.uid());

-- Seed user for testing
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'juniorsfco@hotmail.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'juniorsfco@hotmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Junior SFC"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  END IF;
END $$;
