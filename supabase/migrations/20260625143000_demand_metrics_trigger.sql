DO $$
BEGIN
  -- Criação de gatilho para atualizar time_pending_ms e time_in_progress_ms nas Demandas
END $$;

CREATE OR REPLACE FUNCTION public.fn_update_demand_duration_metrics()
RETURNS trigger AS $$
BEGIN
  -- Atualiza o Tempo Pendente (time_pending_ms) se houver data de aceite
  IF NEW.data_aceite IS NOT NULL AND NEW.data_criacao IS NOT NULL THEN
    NEW.time_pending_ms := EXTRACT(EPOCH FROM (NEW.data_aceite - NEW.data_criacao)) * 1000;
  END IF;

  -- Atualiza o Tempo em Execução (time_in_progress_ms) se houver data de conclusão e aceite
  IF NEW.data_conclusao IS NOT NULL AND NEW.data_aceite IS NOT NULL THEN
    NEW.time_in_progress_ms := EXTRACT(EPOCH FROM (NEW.data_conclusao - NEW.data_aceite)) * 1000;
  ELSIF NEW.data_conclusao IS NOT NULL THEN
    NEW.time_in_progress_ms := 0;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_demand_duration_metrics ON public.demandas;
CREATE TRIGGER trg_update_demand_duration_metrics
  BEFORE INSERT OR UPDATE OF status, data_aceite, data_conclusao ON public.demandas
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_update_demand_duration_metrics();
