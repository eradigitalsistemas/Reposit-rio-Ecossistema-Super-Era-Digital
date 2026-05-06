ALTER TABLE public.whatsapp_contacts ADD COLUMN IF NOT EXISTS last_message_status text;

CREATE OR REPLACE FUNCTION public.fn_update_contact_on_message()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_preview text;
BEGIN
  v_preview := CASE
    WHEN NEW.type = 'text' THEN COALESCE(NEW.text, '')
    WHEN NEW.type = 'image' THEN '[Foto]'
    WHEN NEW.type = 'audio' THEN '[Áudio]'
    WHEN NEW.type = 'video' THEN '[Vídeo]'
    WHEN NEW.type = 'document' THEN '[Documento]'
    WHEN NEW.type = 'sticker' THEN '[Sticker]'
    WHEN NEW.type = 'location' THEN '[Localização]'
    WHEN NEW.type = 'contact' THEN '[Contato]'
    ELSE COALESCE(NEW.text, '[Mensagem]')
  END;

  UPDATE public.whatsapp_contacts
     SET last_message_text      = LEFT(v_preview, 500),
         last_message_at        = NEW."timestamp",
         last_message_type      = NEW.type,
         last_message_from_me   = COALESCE(NEW.from_me, false),
         last_message_status    = NEW.status,
         unread_count           = CASE
                                    WHEN COALESCE(NEW.from_me, false) = false
                                    THEN COALESCE(unread_count, 0) + 1
                                    ELSE COALESCE(unread_count, 0)
                                  END,
         updated_at             = NOW()
   WHERE id = NEW.contact_id;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.fn_update_contact_status_on_message_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_last_msg_id uuid;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.from_me = true THEN
    -- Check if it's the latest message from this contact
    SELECT id INTO v_last_msg_id FROM public.whatsapp_messages WHERE contact_id = NEW.contact_id ORDER BY "timestamp" DESC LIMIT 1;
    IF v_last_msg_id = NEW.id THEN
      UPDATE public.whatsapp_contacts
         SET last_message_status = NEW.status,
             updated_at = NOW()
       WHERE id = NEW.contact_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_update_contact_status_on_message_update ON public.whatsapp_messages;
CREATE TRIGGER trg_update_contact_status_on_message_update
  AFTER UPDATE OF status ON public.whatsapp_messages
  FOR EACH ROW EXECUTE FUNCTION public.fn_update_contact_status_on_message_update();

DO $$
BEGIN
  UPDATE public.whatsapp_contacts wc
  SET last_message_status = (
    SELECT status 
    FROM public.whatsapp_messages wm 
    WHERE wm.contact_id = wc.id 
    ORDER BY "timestamp" DESC 
    LIMIT 1
  )
  WHERE last_message_from_me = true;
END $$;
