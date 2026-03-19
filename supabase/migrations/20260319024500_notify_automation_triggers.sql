-- Enable pg_net extension for async HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Trigger function to call the notify-automation edge function
CREATE OR REPLACE FUNCTION public.trigger_notify_automation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    -- Using the project URL for Edge Functions
    edge_function_url TEXT := 'https://fyiukfacrniwpzchpzpx.supabase.co/functions/v1/notify-automation';
    payload JSONB;
BEGIN
    IF TG_TABLE_NAME = 'demandas' THEN
        -- Check if the status has actually changed
        IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
            payload := jsonb_build_object(
                'type', 'demand_status_change',
                'record', to_jsonb(NEW),
                'old_record', to_jsonb(OLD)
            );
            
            -- Send async HTTP POST request
            PERFORM net.http_post(
                url := edge_function_url,
                headers := '{"Content-Type": "application/json", "x-webhook-secret": "super-secret-webhook-key-123"}'::jsonb,
                body := payload
            );
        END IF;
    ELSIF TG_TABLE_NAME = 'clientes_externos' THEN
        -- Check if the documentos have been modified
        IF TG_OP = 'UPDATE' AND NEW.documentos IS DISTINCT FROM OLD.documentos THEN
            payload := jsonb_build_object(
                'type', 'client_document_upload',
                'record', to_jsonb(NEW),
                'old_record', to_jsonb(OLD)
            );
            
            -- Send async HTTP POST request
            PERFORM net.http_post(
                url := edge_function_url,
                headers := '{"Content-Type": "application/json", "x-webhook-secret": "super-secret-webhook-key-123"}'::jsonb,
                body := payload
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$function$;

-- Create trigger on demandas for status change
DROP TRIGGER IF EXISTS on_demanda_status_change_notify ON public.demandas;
CREATE TRIGGER on_demanda_status_change_notify
    AFTER UPDATE OF status ON public.demandas
    FOR EACH ROW
    EXECUTE FUNCTION trigger_notify_automation();

-- Create trigger on clientes_externos for documentos change
DROP TRIGGER IF EXISTS on_cliente_documento_change_notify ON public.clientes_externos;
CREATE TRIGGER on_cliente_documento_change_notify
    AFTER UPDATE OF documentos ON public.clientes_externos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_notify_automation();
