-- Create chats table
CREATE TABLE IF NOT EXISTS public.chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT NOT NULL,
    instance_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (phone, instance_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'read', 'failed')),
    timestamp TIMESTAMPTZ DEFAULT now()
);

-- Create contacts table
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT UNIQUE NOT NULL,
    name TEXT,
    is_online BOOLEAN DEFAULT false,
    last_seen TIMESTAMPTZ,
    instance_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS chats_phone_idx ON public.chats(phone);
CREATE INDEX IF NOT EXISTS chats_instance_id_idx ON public.chats(instance_id);
CREATE INDEX IF NOT EXISTS messages_chat_id_idx ON public.messages(chat_id);
CREATE INDEX IF NOT EXISTS messages_timestamp_idx ON public.messages(timestamp DESC);
CREATE INDEX IF NOT EXISTS contacts_phone_idx ON public.contacts(phone);
CREATE INDEX IF NOT EXISTS contacts_instance_id_idx ON public.contacts(instance_id);

-- Create trigger function
CREATE OR REPLACE FUNCTION public.update_chats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.chats
    SET updated_at = now()
    WHERE id = NEW.chat_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_chats_updated_at_trigger ON public.messages;
CREATE TRIGGER update_chats_updated_at_trigger
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_chats_updated_at();

-- Enable RLS
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Create Policies for chats
DROP POLICY IF EXISTS "authenticated_select_chats" ON public.chats;
CREATE POLICY "authenticated_select_chats" ON public.chats FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_chats" ON public.chats;
CREATE POLICY "authenticated_insert_chats" ON public.chats FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_chats" ON public.chats;
CREATE POLICY "authenticated_update_chats" ON public.chats FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_chats" ON public.chats;
CREATE POLICY "authenticated_delete_chats" ON public.chats FOR DELETE TO authenticated USING (true);

-- Create Policies for messages
DROP POLICY IF EXISTS "authenticated_select_messages" ON public.messages;
CREATE POLICY "authenticated_select_messages" ON public.messages FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_messages" ON public.messages;
CREATE POLICY "authenticated_insert_messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_messages" ON public.messages;
CREATE POLICY "authenticated_update_messages" ON public.messages FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_messages" ON public.messages;
CREATE POLICY "authenticated_delete_messages" ON public.messages FOR DELETE TO authenticated USING (true);

-- Create Policies for contacts
DROP POLICY IF EXISTS "authenticated_select_contacts" ON public.contacts;
CREATE POLICY "authenticated_select_contacts" ON public.contacts FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_contacts" ON public.contacts;
CREATE POLICY "authenticated_insert_contacts" ON public.contacts FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_contacts" ON public.contacts;
CREATE POLICY "authenticated_update_contacts" ON public.contacts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_contacts" ON public.contacts;
CREATE POLICY "authenticated_delete_contacts" ON public.contacts FOR DELETE TO authenticated USING (true);
