DO $DO$
BEGIN
  -- Create the trigger function to insert into notificacoes
  CREATE OR REPLACE FUNCTION public.fn_notify_demand_assigned()
  RETURNS trigger AS $BODY$
  BEGIN
    -- Check if responsavel_id has a value
    IF NEW.responsavel_id IS NOT NULL THEN
      -- Proceed if it's an INSERT, or an UPDATE where the responsavel_id changed
      IF TG_OP = 'INSERT' OR OLD.responsavel_id IS DISTINCT FROM NEW.responsavel_id THEN
        -- Prevent sending a notification to the person making the change
        IF NEW.responsavel_id != coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid) THEN
          INSERT INTO public.notificacoes (
            usuario_id, 
            titulo, 
            mensagem, 
            lida, 
            demanda_id, 
            tipo, 
            referencia_id
          ) VALUES (
            NEW.responsavel_id,
            'Nova Demanda Atribuída',
            'Você foi atribuído à demanda: ' || coalesce(NEW.titulo, NEW.protocolo),
            false,
            NEW.id,
            'atribuicao',
            'demand_assign_' || NEW.id || '_' || gen_random_uuid()::text
          );
        END IF;
      END IF;
    END IF;
    RETURN NEW;
  END;
  $BODY$ LANGUAGE plpgsql SECURITY DEFINER;

  -- Remove existing trigger and create a new one attached to the demandas table
  DROP TRIGGER IF EXISTS trg_notify_demand_assigned ON public.demandas;
  CREATE TRIGGER trg_notify_demand_assigned
  AFTER INSERT OR UPDATE ON public.demandas
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_notify_demand_assigned();

END $DO$;
