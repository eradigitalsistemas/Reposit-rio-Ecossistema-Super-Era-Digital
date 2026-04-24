ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS estagio text NOT NULL DEFAULT 'Novo Lead';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS status_interesse text NOT NULL DEFAULT 'Interessado';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS endereco text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS observacoes text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS usuario_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
