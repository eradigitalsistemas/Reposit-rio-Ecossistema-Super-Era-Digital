ALTER TABLE public.demandas
  ADD COLUMN IF NOT EXISTS time_pending_ms BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS time_in_progress_ms BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_status_change_at TIMESTAMPTZ;

-- Update last_status_change_at for existing records
UPDATE public.demandas 
SET last_status_change_at = COALESCE(data_atualizacao, data_criacao, NOW()) 
WHERE last_status_change_at IS NULL;

-- Create or replace function to update time
CREATE OR REPLACE FUNCTION public.update_demand_phase_time()
RETURNS trigger AS $BODY$
DECLARE
  elapsed_ms BIGINT;
BEGIN
  -- Only calculate if last_status_change_at is not null
  IF OLD.last_status_change_at IS NOT NULL THEN
    elapsed_ms := EXTRACT(EPOCH FROM (NOW() - OLD.last_status_change_at)) * 1000;
  ELSE
    elapsed_ms := EXTRACT(EPOCH FROM (NOW() - COALESCE(OLD.data_criacao, NOW()))) * 1000;
  END IF;

  IF elapsed_ms < 0 THEN
    elapsed_ms := 0;
  END IF;

  -- If status changed, accumulate time to the OLD status
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    IF OLD.status = 'Pendente' THEN
      NEW.time_pending_ms := COALESCE(OLD.time_pending_ms, 0) + elapsed_ms;
    ELSIF OLD.status = 'Em Andamento' THEN
      NEW.time_in_progress_ms := COALESCE(OLD.time_in_progress_ms, 0) + elapsed_ms;
    END IF;
    NEW.last_status_change_at := NOW();
  END IF;

  RETURN NEW;
END;
$BODY$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_demand_phase_time ON public.demandas;
CREATE TRIGGER trg_demand_phase_time
  BEFORE UPDATE ON public.demandas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_demand_phase_time();
