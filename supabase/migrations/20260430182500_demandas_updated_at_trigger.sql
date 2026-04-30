-- Function to update data_atualizacao on demandas when logs_auditoria is inserted
CREATE OR REPLACE FUNCTION public.update_demanda_atualizacao_on_log()
RETURNS trigger AS $$
BEGIN
  IF NEW.demanda_id IS NOT NULL THEN
    UPDATE public.demandas
    SET data_atualizacao = NOW()
    WHERE id = NEW.demanda_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS trg_update_demanda_atualizacao ON public.logs_auditoria;

-- Create trigger
CREATE TRIGGER trg_update_demanda_atualizacao
AFTER INSERT ON public.logs_auditoria
FOR EACH ROW EXECUTE FUNCTION public.update_demanda_atualizacao_on_log();

-- Make sure set_updated_at_timestamp trigger is on demandas table directly
DROP TRIGGER IF EXISTS set_public_demandas_updated_at ON public.demandas;
CREATE TRIGGER set_public_demandas_updated_at
BEFORE UPDATE ON public.demandas
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();
