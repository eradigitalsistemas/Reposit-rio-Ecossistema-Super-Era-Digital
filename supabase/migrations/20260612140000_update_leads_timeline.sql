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
      '{"name": "Admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.usuarios (id, email, nome, perfil, ativo)
    VALUES (new_user_id, 'juniorsfco@hotmail.com', 'Admin', 'admin', true)
    ON CONFLICT (email) DO NOTHING;
  END IF;
END $$;

DROP POLICY IF EXISTS "historico_leads_insert" ON public.historico_leads;
CREATE POLICY "historico_leads_insert" ON public.historico_leads
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "historico_leads_select" ON public.historico_leads;
CREATE POLICY "historico_leads_select" ON public.historico_leads
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "historico_leads_update" ON public.historico_leads;
CREATE POLICY "historico_leads_update" ON public.historico_leads
  FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "historico_leads_delete" ON public.historico_leads;
CREATE POLICY "historico_leads_delete" ON public.historico_leads
  FOR DELETE TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.fn_log_lead_changes()
RETURNS trigger AS $$
DECLARE
  v_details text;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF OLD.estagio IS DISTINCT FROM NEW.estagio THEN
      v_details := 'Fase alterada de ' || OLD.estagio || ' para ' || NEW.estagio;
      INSERT INTO public.historico_leads (lead_id, usuario_id, contato_nome, forma_contato, detalhes, data_criacao)
      VALUES (NEW.id, coalesce(auth.uid(), NEW.usuario_id), 'Sistema', 'Automático', v_details, NOW());
    END IF;

    IF OLD.status_interesse IS DISTINCT FROM NEW.status_interesse THEN
      v_details := 'Status de interesse alterado de ' || OLD.status_interesse || ' para ' || NEW.status_interesse;
      INSERT INTO public.historico_leads (lead_id, usuario_id, contato_nome, forma_contato, detalhes, data_criacao)
      VALUES (NEW.id, coalesce(auth.uid(), NEW.usuario_id), 'Sistema', 'Automático', v_details, NOW());
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_log_lead_changes ON public.leads;
CREATE TRIGGER trg_log_lead_changes
  AFTER UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.fn_log_lead_changes();
