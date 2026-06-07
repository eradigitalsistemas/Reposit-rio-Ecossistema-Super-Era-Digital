CREATE OR REPLACE FUNCTION public.set_demand_completed_at()
RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'Concluído' AND (OLD.status IS DISTINCT FROM 'Concluído') THEN
    NEW.data_conclusao = NOW();
  ELSIF NEW.status != 'Concluído' THEN
    NEW.data_conclusao = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_demand_completed_at ON public.demandas;
CREATE TRIGGER trg_set_demand_completed_at
  BEFORE UPDATE ON public.demandas
  FOR EACH ROW
  EXECUTE FUNCTION public.set_demand_completed_at();
