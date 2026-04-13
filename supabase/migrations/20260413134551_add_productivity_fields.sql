DO $DO$
BEGIN
  ALTER TABLE public.demandas ADD COLUMN IF NOT EXISTS data_atribuicao TIMESTAMPTZ;
  ALTER TABLE public.demandas ADD COLUMN IF NOT EXISTS data_conclusao TIMESTAMPTZ;
END $DO$;

DO $DO$
BEGIN
  -- Update existing demands based on created_at as fallback
  UPDATE public.demandas SET data_atribuicao = data_criacao WHERE data_atribuicao IS NULL AND responsavel_id IS NOT NULL;
  
  -- Update completion date
  UPDATE public.demandas SET data_conclusao = COALESCE(data_resposta, data_criacao) WHERE status = 'Concluído' AND data_conclusao IS NULL;
END $DO$;

CREATE INDEX IF NOT EXISTS idx_demandas_responsavel_id ON public.demandas(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_demandas_data_conclusao ON public.demandas(data_conclusao);

CREATE OR REPLACE FUNCTION public.set_demanda_dates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.responsavel_id IS NOT NULL THEN
            NEW.data_atribuicao := NOW();
        END IF;
        IF NEW.status = 'Concluído' THEN
            NEW.data_conclusao := NOW();
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.responsavel_id IS NOT NULL AND (OLD.responsavel_id IS NULL OR NEW.responsavel_id != OLD.responsavel_id) THEN
            NEW.data_atribuicao := NOW();
        END IF;
        IF NEW.status = 'Concluído' AND OLD.status != 'Concluído' THEN
            NEW.data_conclusao := NOW();
        ELSIF NEW.status != 'Concluído' THEN
            NEW.data_conclusao := NULL;
        END IF;
    END IF;

    RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS on_demanda_dates_trigger ON public.demandas;
CREATE TRIGGER on_demanda_dates_trigger
BEFORE UPDATE OR INSERT ON public.demandas
FOR EACH ROW EXECUTE FUNCTION public.set_demanda_dates();
