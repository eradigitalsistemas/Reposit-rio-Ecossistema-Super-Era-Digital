-- Function 1: apply_tolerance
CREATE OR REPLACE FUNCTION public.apply_tolerance(p_delay_minutes INT, p_tolerance_minutes INT)
RETURNS jsonb
LANGUAGE plpgsql
AS $function$
DECLARE
  v_final_delay INT;
BEGIN
  IF p_delay_minutes <= p_tolerance_minutes THEN
    v_final_delay := 0;
  ELSE
    v_final_delay := p_delay_minutes - p_tolerance_minutes;
  END IF;

  RETURN jsonb_build_object(
    'original_delay', p_delay_minutes,
    'tolerance', p_tolerance_minutes,
    'final_delay', v_final_delay
  );
END;
$function$;

-- Function 2: get_employee_schedule
CREATE OR REPLACE FUNCTION public.get_employee_schedule(p_organization_id UUID, p_employee_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_department_id UUID;
  v_schedule RECORD;
BEGIN
  SELECT department_id INTO v_department_id
  FROM public.employees
  WHERE id = p_employee_id;

  SELECT start_time, end_time, lunch_duration_minutes, tolerance_minutes
  INTO v_schedule
  FROM public.department_schedules
  WHERE organization_id = p_organization_id AND department_id = v_department_id
  LIMIT 1;

  IF NOT FOUND THEN
    -- Default schedule se não configurado (8h as 17h, 1h almoço, 5min tolerância)
    RETURN jsonb_build_object(
      'start_time', '08:00:00'::time,
      'end_time', '17:00:00'::time,
      'lunch_duration_minutes', 60,
      'tolerance_minutes', 5
    );
  END IF;

  RETURN jsonb_build_object(
    'start_time', v_schedule.start_time,
    'end_time', v_schedule.end_time,
    'lunch_duration_minutes', v_schedule.lunch_duration_minutes,
    'tolerance_minutes', v_schedule.tolerance_minutes
  );
END;
$function$;

-- Function 3: validate_time_entry_sequence
CREATE OR REPLACE FUNCTION public.validate_time_entry_sequence(
  p_organization_id UUID,
  p_employee_id UUID,
  p_date DATE,
  p_new_entry_type TEXT,
  p_new_timestamp TIMESTAMP WITH TIME ZONE
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_last_entry RECORD;
  v_valid BOOLEAN := true;
  v_message TEXT := 'Sequência válida';
  v_next_expected TEXT := '';
BEGIN
  SELECT entry_type, timestamp INTO v_last_entry
  FROM public.time_entries
  WHERE organization_id = p_organization_id
    AND employee_id = p_employee_id
    AND entry_date = p_date
    AND timestamp < p_new_timestamp
  ORDER BY timestamp DESC
  LIMIT 1;

  IF v_last_entry IS NULL THEN
    IF p_new_entry_type != 'entrada' THEN
      v_valid := false;
      v_message := 'O primeiro registro do dia deve ser uma entrada';
      v_next_expected := 'entrada';
    ELSE
      v_next_expected := 'intervalo_saida';
    END IF;
  ELSIF v_last_entry.entry_type = 'entrada' THEN
    IF p_new_entry_type != 'intervalo_saida' AND p_new_entry_type != 'saida' THEN
      v_valid := false;
      v_message := 'Após a entrada, é esperado saída para intervalo ou saída final';
      v_next_expected := 'intervalo_saida';
    ELSE
      IF p_new_entry_type = 'intervalo_saida' THEN
        v_next_expected := 'intervalo_entrada';
      ELSE
        v_next_expected := 'fim';
      END IF;
    END IF;
  ELSIF v_last_entry.entry_type = 'intervalo_saida' THEN
    IF p_new_entry_type != 'intervalo_entrada' THEN
      v_valid := false;
      v_message := 'Após saída para intervalo, é esperado o retorno (intervalo_entrada)';
      v_next_expected := 'intervalo_entrada';
    ELSE
      v_next_expected := 'saida';
    END IF;
  ELSIF v_last_entry.entry_type = 'intervalo_entrada' THEN
    IF p_new_entry_type != 'saida' THEN
      v_valid := false;
      v_message := 'Após o retorno do intervalo, é esperada a saída final';
      v_next_expected := 'saida';
    ELSE
      v_next_expected := 'fim';
    END IF;
  ELSIF v_last_entry.entry_type = 'saida' THEN
    v_valid := false;
    v_message := 'Não são permitidos registros após a saída final do dia';
    v_next_expected := 'fim';
  END IF;

  RETURN jsonb_build_object(
    'valid', v_valid,
    'message', v_message,
    'next_expected', v_next_expected
  );
END;
$function$;

-- Function 4: calculate_daily_hours
CREATE OR REPLACE FUNCTION public.calculate_daily_hours(
  p_organization_id UUID,
  p_employee_id UUID,
  p_date DATE
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_schedule jsonb;
  v_start_time TIME;
  v_end_time TIME;
  v_lunch_duration INT;
  v_tolerance INT;

  v_entrada TIMESTAMP WITH TIME ZONE;
  v_int_saida TIMESTAMP WITH TIME ZONE;
  v_int_entrada TIMESTAMP WITH TIME ZONE;
  v_saida TIMESTAMP WITH TIME ZONE;

  v_worked_minutes INT := 0;
  v_extra_minutes INT := 0;
  v_delay_minutes INT := 0;
  v_status TEXT := 'incompleto';
  v_notes TEXT := '';

  v_expected_worked_minutes INT;
BEGIN
  -- 1. Obter horários
  v_schedule := public.get_employee_schedule(p_organization_id, p_employee_id);
  v_start_time := (v_schedule->>'start_time')::time;
  v_end_time := (v_schedule->>'end_time')::time;
  v_lunch_duration := (v_schedule->>'lunch_duration_minutes')::int;
  v_tolerance := (v_schedule->>'tolerance_minutes')::int;

  v_expected_worked_minutes := EXTRACT(EPOCH FROM (v_end_time - v_start_time))/60 - v_lunch_duration;

  -- 2. Buscar registros do dia
  SELECT timestamp INTO v_entrada
  FROM public.time_entries
  WHERE organization_id = p_organization_id AND employee_id = p_employee_id AND entry_date = p_date AND entry_type = 'entrada'
  ORDER BY timestamp ASC LIMIT 1;

  SELECT timestamp INTO v_int_saida
  FROM public.time_entries
  WHERE organization_id = p_organization_id AND employee_id = p_employee_id AND entry_date = p_date AND entry_type = 'intervalo_saida'
  ORDER BY timestamp ASC LIMIT 1;

  SELECT timestamp INTO v_int_entrada
  FROM public.time_entries
  WHERE organization_id = p_organization_id AND employee_id = p_employee_id AND entry_date = p_date AND entry_type = 'intervalo_entrada'
  ORDER BY timestamp ASC LIMIT 1;

  SELECT timestamp INTO v_saida
  FROM public.time_entries
  WHERE organization_id = p_organization_id AND employee_id = p_employee_id AND entry_date = p_date AND entry_type = 'saida'
  ORDER BY timestamp ASC LIMIT 1;

  IF v_entrada IS NULL THEN
    RETURN jsonb_build_object(
      'date', p_date,
      'worked_hours', 0,
      'extra_hours', 0,
      'delay_minutes', 0,
      'status', 'falta',
      'notes', 'Sem registro de entrada'
    );
  END IF;

  -- 3. Calcular atraso
  IF (v_entrada AT TIME ZONE 'America/Sao_Paulo')::time > v_start_time THEN
    v_delay_minutes := EXTRACT(EPOCH FROM ((v_entrada AT TIME ZONE 'America/Sao_Paulo')::time - v_start_time))/60;
    v_delay_minutes := (public.apply_tolerance(v_delay_minutes, v_tolerance)->>'final_delay')::int;
  END IF;

  -- 4. Calcular tempo trabalhado e horas extras
  IF v_saida IS NOT NULL THEN
    v_status := 'completo';
    v_worked_minutes := EXTRACT(EPOCH FROM (v_saida - v_entrada))/60;
    
    IF v_int_saida IS NOT NULL AND v_int_entrada IS NOT NULL THEN
      v_worked_minutes := v_worked_minutes - EXTRACT(EPOCH FROM (v_int_entrada - v_int_saida))/60;
    ELSE
      -- Deduzir duração padrão do intervalo se não registrado
      v_worked_minutes := GREATEST(0, v_worked_minutes - v_lunch_duration);
    END IF;

    IF v_worked_minutes > v_expected_worked_minutes THEN
      v_extra_minutes := v_worked_minutes - v_expected_worked_minutes;
    END IF;
    
    IF v_delay_minutes = 0 AND v_extra_minutes > 0 THEN
      v_notes := 'Sem atraso, ' || v_extra_minutes || 'min extras';
    ELSIF v_delay_minutes = 0 THEN
      v_notes := 'Sem atraso';
    ELSE
      v_notes := 'Atraso de ' || v_delay_minutes || 'min';
    END IF;
  ELSE
    v_status := 'incompleto';
    v_notes := 'Falta registro de saída';
    -- Calcular tempo parcial até o momento
    v_worked_minutes := EXTRACT(EPOCH FROM (COALESCE(v_int_saida, NOW()) - v_entrada))/60;
  END IF;

  RETURN jsonb_build_object(
    'date', p_date,
    'entry_time', TO_CHAR(v_entrada AT TIME ZONE 'America/Sao_Paulo', 'HH24:MI'),
    'exit_time', CASE WHEN v_saida IS NOT NULL THEN TO_CHAR(v_saida AT TIME ZONE 'America/Sao_Paulo', 'HH24:MI') ELSE null END,
    'worked_hours', ROUND((v_worked_minutes::numeric / 60.0), 2),
    'extra_hours', ROUND((v_extra_minutes::numeric / 60.0), 2),
    'delay_minutes', v_delay_minutes,
    'status', v_status,
    'notes', v_notes
  );
END;
$function$;

-- Function 5: calculate_monthly_totals
CREATE OR REPLACE FUNCTION public.calculate_monthly_totals(
  p_organization_id UUID,
  p_employee_id UUID,
  p_year INTEGER,
  p_month INTEGER
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_start_date DATE;
  v_end_date DATE;
  v_current_date DATE;
  v_daily_result jsonb;

  v_total_hours_worked NUMERIC := 0;
  v_total_extra_hours NUMERIC := 0;
  v_total_delays_minutes INT := 0;
  v_days_worked INT := 0;
  v_absences INT := 0;
BEGIN
  v_start_date := MAKE_DATE(p_year, p_month, 1);
  v_end_date := v_start_date + INTERVAL '1 month' - INTERVAL '1 day';
  v_current_date := v_start_date;

  WHILE v_current_date <= v_end_date AND v_current_date <= CURRENT_DATE LOOP
    IF EXTRACT(ISODOW FROM v_current_date) < 6 THEN 
       -- Dia da semana
       v_daily_result := public.calculate_daily_hours(p_organization_id, p_employee_id, v_current_date);
       
       IF v_daily_result->>'status' = 'falta' THEN
         v_absences := v_absences + 1;
       ELSE
         v_days_worked := v_days_worked + 1;
         v_total_hours_worked := v_total_hours_worked + (v_daily_result->>'worked_hours')::numeric;
         v_total_extra_hours := v_total_extra_hours + (v_daily_result->>'extra_hours')::numeric;
         v_total_delays_minutes := v_total_delays_minutes + (v_daily_result->>'delay_minutes')::int;
       END IF;
    ELSE
       -- Fim de semana
       v_daily_result := public.calculate_daily_hours(p_organization_id, p_employee_id, v_current_date);
       IF v_daily_result->>'status' != 'falta' THEN
         v_days_worked := v_days_worked + 1;
         v_total_hours_worked := v_total_hours_worked + (v_daily_result->>'worked_hours')::numeric;
         v_total_extra_hours := v_total_extra_hours + (v_daily_result->>'extra_hours')::numeric;
         v_total_delays_minutes := v_total_delays_minutes + (v_daily_result->>'delay_minutes')::int;
       END IF;
    END IF;

    v_current_date := v_current_date + INTERVAL '1 day';
  END LOOP;

  INSERT INTO public.monthly_timesheets (
    organization_id, employee_id, year, month, 
    total_hours_worked, total_extra_hours, total_delays_minutes, total_absences, days_worked, generated_at
  ) VALUES (
    p_organization_id, p_employee_id, p_year, p_month,
    v_total_hours_worked, v_total_extra_hours, v_total_delays_minutes, v_absences, v_days_worked, NOW()
  )
  ON CONFLICT (organization_id, employee_id, year, month)
  DO UPDATE SET
    total_hours_worked = EXCLUDED.total_hours_worked,
    total_extra_hours = EXCLUDED.total_extra_hours,
    total_delays_minutes = EXCLUDED.total_delays_minutes,
    total_absences = EXCLUDED.total_absences,
    days_worked = EXCLUDED.days_worked,
    generated_at = EXCLUDED.generated_at;

  RETURN jsonb_build_object(
    'employee_id', p_employee_id,
    'year', p_year,
    'month', p_month,
    'total_hours_worked', v_total_hours_worked,
    'total_extra_hours', v_total_extra_hours,
    'total_delays_minutes', v_total_delays_minutes,
    'days_worked', v_days_worked,
    'absences', v_absences,
    'status', 'generated'
  );
END;
$function$;

-- ============================================================================
-- EXEMPLOS DE USO E TESTES UNITÁRIOS (COMENTADOS)
-- ============================================================================
/*
DO $test$
DECLARE
  v_res jsonb;
  v_org_id UUID := '00000000-0000-0000-0000-000000000001';
  v_emp_id UUID := '00000000-0000-0000-0000-000000000002'; -- Inserir ID válido
BEGIN
  -- Test 1: apply_tolerance
  v_res := public.apply_tolerance(10, 5);
  RAISE NOTICE 'apply_tolerance(10, 5) = %', v_res; -- Esperado final_delay: 5

  v_res := public.apply_tolerance(4, 5);
  RAISE NOTICE 'apply_tolerance(4, 5) = %', v_res; -- Esperado final_delay: 0

  -- Test 2: get_employee_schedule
  -- v_res := public.get_employee_schedule(v_org_id, v_emp_id);
  -- RAISE NOTICE 'schedule = %', v_res;

  -- Test 3: validate_time_entry_sequence
  -- v_res := public.validate_time_entry_sequence(v_org_id, v_emp_id, '2026-04-13', 'entrada', NOW());
  -- RAISE NOTICE 'validate_seq = %', v_res;

  -- Test 4: calculate_daily_hours
  -- v_res := public.calculate_daily_hours(v_org_id, v_emp_id, '2026-04-13');
  -- RAISE NOTICE 'daily_hours = %', v_res;

  -- Test 5: calculate_monthly_totals
  -- v_res := public.calculate_monthly_totals(v_org_id, v_emp_id, 2026, 4);
  -- RAISE NOTICE 'monthly_totals = %', v_res;
END;
$test$;
*/
