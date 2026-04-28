DO $$
DECLARE
  v_admin_id uuid;
BEGIN
  -- Check if admin exists
  SELECT id INTO v_admin_id FROM auth.users WHERE email = 'comercial@areracomercial.com.br';

  IF v_admin_id IS NULL THEN
    v_admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_admin_id,
      '00000000-0000-0000-0000-000000000000',
      'comercial@areracomercial.com.br',
      crypt('Admin@123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin Comercial", "perfil": "admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  ELSE
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{perfil}', '"admin"')
    WHERE id = v_admin_id;
  END IF;

  -- Ensure profile exists and is admin
  INSERT INTO public.usuarios (id, email, nome, perfil, ativo)
  VALUES (v_admin_id, 'comercial@areracomercial.com.br', 'Admin Comercial', 'admin', true)
  ON CONFLICT (id) DO UPDATE SET perfil = 'admin';

END $$;
