DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Fix auth token nulls globally just in case
  UPDATE auth.users
  SET
    confirmation_token = COALESCE(confirmation_token, ''),
    recovery_token = COALESCE(recovery_token, ''),
    email_change_token_new = COALESCE(email_change_token_new, ''),
    email_change = COALESCE(email_change, ''),
    email_change_token_current = COALESCE(email_change_token_current, ''),
    phone_change = COALESCE(phone_change, ''),
    phone_change_token = COALESCE(phone_change_token, ''),
    reauthentication_token = COALESCE(reauthentication_token, '')
  WHERE
    confirmation_token IS NULL OR recovery_token IS NULL
    OR email_change_token_new IS NULL OR email_change IS NULL
    OR email_change_token_current IS NULL
    OR phone_change IS NULL OR phone_change_token IS NULL
    OR reauthentication_token IS NULL;

  -- Ensure user exists and has correct password
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'comercial@areradigital.com.br';
  
  IF v_user_id IS NOT NULL THEN
    UPDATE auth.users 
    SET 
      encrypted_password = crypt('*Raimundo1087', gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, NOW())
    WHERE id = v_user_id;
  ELSE
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'comercial@areradigital.com.br',
      crypt('*Raimundo1087', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"full_name": "Comercial", "perfil": "admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  END IF;

  INSERT INTO public.usuarios (id, email, nome, perfil, ativo)
  VALUES (v_user_id, 'comercial@areradigital.com.br', 'Comercial', 'admin', true)
  ON CONFLICT (id) DO UPDATE SET 
    perfil = 'admin',
    ativo = true;
    
END $$;

CREATE TABLE IF NOT EXISTS public.auth_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address TEXT,
    email TEXT,
    event_type TEXT,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.auth_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_insert_auth_logs" ON public.auth_logs;
CREATE POLICY "allow_insert_auth_logs" ON public.auth_logs FOR INSERT TO public WITH CHECK (true);
