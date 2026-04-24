-- Update existing user_integrations to comercial_era
DO $$
DECLARE
  target_id uuid;
BEGIN
  -- Try to find an existing 'comercial_era'
  SELECT id INTO target_id FROM public.user_integrations WHERE instance_name = 'comercial_era' LIMIT 1;
  
  IF target_id IS NULL THEN
    -- If not found, pick the first one
    SELECT id INTO target_id FROM public.user_integrations ORDER BY created_at ASC LIMIT 1;
    IF target_id IS NOT NULL THEN
      UPDATE public.user_integrations SET instance_name = 'comercial_era' WHERE id = target_id;
    END IF;
  END IF;
  
  IF target_id IS NOT NULL THEN
    -- Delete all others
    DELETE FROM public.user_integrations WHERE id != target_id;
  END IF;
END $$;

-- Fix RLS policy to allow all authenticated users to read/update the shared integration
DROP POLICY IF EXISTS "Users can manage their own integrations" ON public.user_integrations;
CREATE POLICY "Users can manage their own integrations" ON public.user_integrations
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Fix RLS policy for whatsapp_contacts
DROP POLICY IF EXISTS "Users can manage their own whatsapp contacts" ON public.whatsapp_contacts;
CREATE POLICY "Users can manage their own whatsapp contacts" ON public.whatsapp_contacts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Fix RLS policy for whatsapp_messages
DROP POLICY IF EXISTS "Users can manage their own whatsapp messages" ON public.whatsapp_messages;
CREATE POLICY "Users can manage their own whatsapp messages" ON public.whatsapp_messages
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Fix RLS policy for contact_identity
DROP POLICY IF EXISTS "Users can manage their own identities" ON public.contact_identity;
CREATE POLICY "Users can manage their own identities" ON public.contact_identity
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
