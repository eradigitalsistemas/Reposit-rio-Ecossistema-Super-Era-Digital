DO $$
BEGIN
  CREATE SEQUENCE IF NOT EXISTS public.demandas_protocolo_seq START 1000;
END $$;

ALTER TABLE public.demandas ADD COLUMN IF NOT EXISTS protocolo VARCHAR(20);

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id FROM public.demandas WHERE protocolo IS NULL LOOP
    UPDATE public.demandas SET protocolo = 'DEM-' || LPAD(nextval('public.demandas_protocolo_seq')::text, 5, '0') WHERE id = r.id;
  END LOOP;
END $$;

ALTER TABLE public.demandas ALTER COLUMN protocolo SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_demandas_protocolo ON public.demandas(protocolo);

CREATE OR REPLACE FUNCTION public.set_demand_protocol()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.protocolo IS NULL THEN
    NEW.protocolo := 'DEM-' || LPAD(nextval('public.demandas_protocolo_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_demand_protocol ON public.demandas;
CREATE TRIGGER trg_set_demand_protocol
BEFORE INSERT ON public.demandas
FOR EACH ROW EXECUTE FUNCTION public.set_demand_protocol();
