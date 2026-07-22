ALTER TABLE public.documentos_empresa ADD COLUMN IF NOT EXISTS cpf_socio TEXT;
ALTER TABLE public.documentos_empresa ADD COLUMN IF NOT EXISTS senhas_acesso JSONB DEFAULT '[]'::jsonb;
