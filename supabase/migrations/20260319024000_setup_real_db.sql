-- Add observacoes to leads if it doesn't exist
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS observacoes TEXT DEFAULT '';

-- Create clientes_externos table
CREATE TABLE IF NOT EXISTS public.clientes_externos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    empresa TEXT,
    email TEXT NOT NULL,
    telefone TEXT,
    cnpj TEXT,
    data_criacao TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on clientes_externos
ALTER TABLE public.clientes_externos ENABLE ROW LEVEL SECURITY;

-- Admins can do everything on clientes_externos
CREATE POLICY "Admins_gerenciam_clientes_externos" ON public.clientes_externos
    FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Seed a test user if needed (Optional, but good for testing if empty)
-- We rely on the app's Auth flow, but we can ensure an admin profile exists if we register
