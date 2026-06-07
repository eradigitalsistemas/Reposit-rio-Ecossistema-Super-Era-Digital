-- 1. Seed user
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
      '{"name": "Administrador"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.usuarios (id, email, nome, perfil)
    VALUES (new_user_id, 'juniorsfco@hotmail.com', 'Administrador', 'admin')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- 2. Refine trigger
CREATE OR REPLACE FUNCTION public.update_demand_phase_time()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  elapsed_ms BIGINT;
BEGIN
  -- If status changed, accumulate time to the OLD status
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    
    IF OLD.last_status_change_at IS NOT NULL THEN
      elapsed_ms := EXTRACT(EPOCH FROM (NOW() - OLD.last_status_change_at)) * 1000;
    ELSE
      elapsed_ms := EXTRACT(EPOCH FROM (NOW() - COALESCE(OLD.data_criacao, NOW()))) * 1000;
    END IF;

    IF elapsed_ms < 0 THEN
      elapsed_ms := 0;
    END IF;

    IF OLD.status = 'Pendente' THEN
      NEW.time_pending_ms := COALESCE(OLD.time_pending_ms, 0) + elapsed_ms;
    ELSIF OLD.status = 'Em Andamento' THEN
      NEW.time_in_progress_ms := COALESCE(OLD.time_in_progress_ms, 0) + elapsed_ms;
    END IF;
    NEW.last_status_change_at := NOW();
  END IF;

  RETURN NEW;
END;
$function$;

-- 3. Data backfill
DO $$
DECLARE
  v_demand RECORD;
  v_log RECORD;
  v_prev_status TEXT;
  v_prev_ts TIMESTAMPTZ;
  v_time_pending_ms BIGINT;
  v_time_in_progress_ms BIGINT;
  v_elapsed BIGINT;
BEGIN
  FOR v_demand IN SELECT id, data_criacao, status, data_conclusao, last_status_change_at FROM public.demandas LOOP
    v_time_pending_ms := 0;
    v_time_in_progress_ms := 0;
    v_prev_status := 'Pendente';
    v_prev_ts := v_demand.data_criacao;

    -- Query logs for status changes for this demand, ordered by data_criacao
    FOR v_log IN 
      SELECT * FROM public.logs_auditoria 
      WHERE demanda_id = v_demand.id 
      AND (
        acao IN ('Criação de Demanda', 'Criação', 'Alteração de Status', 'Demanda Aceita', 'Demanda Concluída', 'Demanda Reaberta')
        OR (dados_novos IS NOT NULL AND dados_novos->>'status' IS NOT NULL)
      )
      ORDER BY data_criacao ASC 
    LOOP
      IF v_log.data_criacao > v_prev_ts THEN
        v_elapsed := EXTRACT(EPOCH FROM (v_log.data_criacao - v_prev_ts)) * 1000;
        IF v_elapsed > 0 THEN
          IF v_prev_status = 'Pendente' THEN
            v_time_pending_ms := v_time_pending_ms + v_elapsed;
          ELSIF v_prev_status = 'Em Andamento' THEN
            v_time_in_progress_ms := v_time_in_progress_ms + v_elapsed;
          END IF;
        END IF;
      END IF;

      IF v_log.dados_novos IS NOT NULL AND v_log.dados_novos->>'status' IS NOT NULL THEN
        v_prev_status := v_log.dados_novos->>'status';
      ELSIF v_log.detalhes LIKE '%para Em Andamento%' OR v_log.acao = 'Demanda Aceita' THEN
        v_prev_status := 'Em Andamento';
      ELSIF v_log.detalhes LIKE '%para Concluído%' OR v_log.acao = 'Demanda Concluída' THEN
        v_prev_status := 'Concluído';
      ELSIF v_log.detalhes LIKE '%para Pendente%' OR v_log.acao = 'Demanda Reaberta' THEN
        v_prev_status := 'Pendente';
      END IF;
      
      v_prev_ts := v_log.data_criacao;
    END LOOP;
    
    -- Handle final status duration if 'Concluído'
    IF v_demand.status = 'Concluído' THEN
      IF v_demand.data_conclusao IS NOT NULL AND v_demand.data_conclusao > v_prev_ts THEN
        v_elapsed := EXTRACT(EPOCH FROM (v_demand.data_conclusao - v_prev_ts)) * 1000;
        IF v_prev_status = 'Pendente' THEN
          v_time_pending_ms := v_time_pending_ms + v_elapsed;
        ELSIF v_prev_status = 'Em Andamento' THEN
          v_time_in_progress_ms := v_time_in_progress_ms + v_elapsed;
        END IF;
        v_prev_ts := v_demand.data_conclusao;
      END IF;
    END IF;

    -- Avoid negative times
    IF v_time_pending_ms < 0 THEN v_time_pending_ms := 0; END IF;
    IF v_time_in_progress_ms < 0 THEN v_time_in_progress_ms := 0; END IF;

    -- Update demand with recalculated values, and adjust last_status_change_at if needed
    UPDATE public.demandas 
    SET 
      time_pending_ms = v_time_pending_ms,
      time_in_progress_ms = v_time_in_progress_ms,
      last_status_change_at = GREATEST(v_prev_ts, v_demand.data_criacao)
    WHERE id = v_demand.id;
  END LOOP;
END $$;
