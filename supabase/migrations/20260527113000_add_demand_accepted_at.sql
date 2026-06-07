ALTER TABLE public.demandas ADD COLUMN IF NOT EXISTS data_aceite TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION public.set_demand_accepted_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.status = 'Em Andamento' AND NEW.data_aceite IS NULL THEN
    NEW.data_aceite = NOW();
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_set_demand_accepted_at ON public.demandas;

CREATE TRIGGER trg_set_demand_accepted_at
  BEFORE INSERT OR UPDATE ON public.demandas
  FOR EACH ROW EXECUTE FUNCTION public.set_demand_accepted_at();
