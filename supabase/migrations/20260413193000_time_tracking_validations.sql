DO $$
BEGIN
  -- 1. Melhorar a validação de duplicatas com mensagem customizada
  CREATE OR REPLACE FUNCTION public.check_duplicate_entry()
  RETURNS TRIGGER AS $$
  BEGIN
    IF EXISTS (
      SELECT 1 FROM public.time_entries
      WHERE organization_id = NEW.organization_id
      AND employee_id = NEW.employee_id
      AND entry_date = NEW.entry_date
      AND entry_type = NEW.entry_type
      AND id != NEW.id
    ) THEN
      RAISE EXCEPTION 'DUPLICATE_ENTRY: Já existe um registro de % para esta data.', NEW.entry_type;
    END IF;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  DROP TRIGGER IF EXISTS before_insert_check_duplicate ON public.time_entries;
  CREATE TRIGGER before_insert_check_duplicate
  BEFORE INSERT OR UPDATE ON public.time_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.check_duplicate_entry();

  -- 2. Melhorar a validação de sequência
  CREATE OR REPLACE FUNCTION public.check_entry_sequence()
  RETURNS TRIGGER AS $$
  DECLARE
    v_last_entry RECORD;
    v_expected_type VARCHAR;
  BEGIN
    SELECT * INTO v_last_entry
    FROM public.time_entries
    WHERE organization_id = NEW.organization_id
    AND employee_id = NEW.employee_id
    AND entry_date = NEW.entry_date
    AND id != NEW.id
    AND timestamp < NEW.timestamp
    ORDER BY timestamp DESC
    LIMIT 1;

    IF v_last_entry IS NULL THEN
      IF NEW.entry_type != 'entrada' THEN
        RAISE EXCEPTION 'SEQUENCE_ERROR: O primeiro registro do dia deve ser uma entrada.';
      END IF;
    ELSE
      CASE v_last_entry.entry_type
        WHEN 'entrada' THEN
          v_expected_type := 'intervalo_saida';
        WHEN 'intervalo_saida' THEN
          v_expected_type := 'intervalo_entrada';
        WHEN 'intervalo_entrada' THEN
          v_expected_type := 'saida';
        WHEN 'saida' THEN
          RAISE EXCEPTION 'SEQUENCE_ERROR: O dia já foi encerrado. Não é possível adicionar mais registros.';
      END CASE;

      IF NEW.entry_type != v_expected_type THEN
        -- Permitir saída direta após entrada (trabalho sem intervalo)
        IF NEW.entry_type = 'saida' AND v_last_entry.entry_type = 'entrada' THEN
           -- OK
        ELSE
           RAISE EXCEPTION 'SEQUENCE_ERROR: Sequência inválida. Esperado %, recebido %.', v_expected_type, NEW.entry_type;
        END IF;
      END IF;
    END IF;

    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  DROP TRIGGER IF EXISTS trg_validate_time_entries_sequence_custom ON public.time_entries;
  CREATE TRIGGER trg_validate_time_entries_sequence_custom
  BEFORE INSERT OR UPDATE ON public.time_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.check_entry_sequence();

  -- Remove the old validation trigger if exists
  DROP TRIGGER IF EXISTS trg_validate_time_entries_sequence ON public.time_entries;

  -- 3. Validação de horário de trabalho
  CREATE OR REPLACE FUNCTION public.validate_work_schedule()
  RETURNS TRIGGER AS $$
  DECLARE
    v_schedule RECORD;
    v_entry_time TIME;
  BEGIN
    -- Buscar horário do departamento
    SELECT ds.* INTO v_schedule
    FROM public.department_schedules ds
    JOIN public.employees e ON e.department_id = ds.department_id
    WHERE ds.organization_id = NEW.organization_id
    AND e.id = NEW.employee_id
    LIMIT 1;

    IF v_schedule IS NULL THEN
      RETURN NEW; -- Se não tem horário configurado, ignora
    END IF;

    v_entry_time := (NEW.timestamp AT TIME ZONE 'America/Sao_Paulo')::TIME;

    IF NEW.entry_type = 'entrada' THEN
      IF v_entry_time < (v_schedule.start_time - INTERVAL '2 hours') THEN
         RAISE EXCEPTION 'SCHEDULE_ERROR: Entrada muito antecipada (mais de 2 horas antes do horário).';
      END IF;
    END IF;

    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  DROP TRIGGER IF EXISTS before_insert_validate_schedule ON public.time_entries;
  CREATE TRIGGER before_insert_validate_schedule
  BEFORE INSERT OR UPDATE ON public.time_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_work_schedule();
END $$;
