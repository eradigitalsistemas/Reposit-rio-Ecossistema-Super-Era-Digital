-- Migration to update hardcoded edge function URLs from fyiukfacrniwpzchpzpx to knjopolkcgluitgfukxx

CREATE OR REPLACE FUNCTION public.trigger_demanda_push_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    edge_function_url TEXT := 'https://knjopolkcgluitgfukxx.supabase.co/functions/v1/notify-push';
    payload JSONB;
    v_title TEXT;
    v_body TEXT;
    v_usuario_id UUID;
BEGIN
    IF NEW.responsavel_id IS NOT NULL AND (OLD.responsavel_id IS NULL OR NEW.responsavel_id != OLD.responsavel_id) THEN
        v_usuario_id := NEW.responsavel_id;
        v_title := 'Nova Demanda Atribuída';
        v_body := 'A demanda "' || NEW.titulo || '" foi atribuída a você.';

        payload := jsonb_build_object('usuario_id', v_usuario_id, 'notification', jsonb_build_object('title', v_title, 'body', v_body));
        PERFORM net.http_post(
            url := edge_function_url,
            headers := '{"Content-Type": "application/json", "x-webhook-secret": "super-secret-webhook-key-123"}'::jsonb,
            body := payload
        );
    END IF;

    IF NEW.prioridade = 'Urgente' AND OLD.prioridade = 'Pode Ficar para Amanhã' AND NEW.responsavel_id IS NOT NULL THEN
        v_usuario_id := NEW.responsavel_id;
        v_title := 'Demanda Escalada para Urgente';
        v_body := 'A demanda "' || NEW.titulo || '" agora é Urgente.';

        payload := jsonb_build_object('usuario_id', v_usuario_id, 'notification', jsonb_build_object('title', v_title, 'body', v_body));
        PERFORM net.http_post(
            url := edge_function_url,
            headers := '{"Content-Type": "application/json", "x-webhook-secret": "super-secret-webhook-key-123"}'::jsonb,
            body := payload
        );
    END IF;

    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.trigger_notify_automation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    edge_function_url TEXT := 'https://knjopolkcgluitgfukxx.supabase.co/functions/v1/notify-automation';
    payload JSONB;
BEGIN
    IF TG_TABLE_NAME = 'demandas' THEN
        IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
            payload := jsonb_build_object(
                'type', 'demand_status_change',
                'record', to_jsonb(NEW),
                'old_record', to_jsonb(OLD)
            );
            
            PERFORM net.http_post(
                url := edge_function_url,
                headers := '{"Content-Type": "application/json", "x-webhook-secret": "super-secret-webhook-key-123"}'::jsonb,
                body := payload
            );
        END IF;
    ELSIF TG_TABLE_NAME = 'clientes_externos' THEN
        IF TG_OP = 'UPDATE' AND NEW.documentos IS DISTINCT FROM OLD.documentos THEN
            payload := jsonb_build_object(
                'type', 'client_document_upload',
                'record', to_jsonb(NEW),
                'old_record', to_jsonb(OLD)
            );
            
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

CREATE OR REPLACE FUNCTION public.trigger_send_email_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    edge_function_url TEXT := 'https://knjopolkcgluitgfukxx.supabase.co/functions/v1/send-notification';
    payload JSONB;
BEGIN
    payload := jsonb_build_object(
        'type', TG_OP,
        'table', TG_TABLE_NAME,
        'record', to_jsonb(NEW)
    );
    
    PERFORM net.http_post(
        url := edge_function_url,
        headers := '{"Content-Type": "application/json", "x-webhook-secret": "super-secret-webhook-key-123"}'::jsonb,
        body := payload
    );

    RETURN NEW;
END;
$function$;
