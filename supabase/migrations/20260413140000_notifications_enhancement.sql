DO $$
BEGIN
    ALTER TABLE public.notificacoes ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'info';
    ALTER TABLE public.notificacoes ADD COLUMN IF NOT EXISTS referencia_id TEXT;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.notificacoes DROP CONSTRAINT IF EXISTS unq_notificacoes_usuario_ref;
    ALTER TABLE public.notificacoes ADD CONSTRAINT unq_notificacoes_usuario_ref UNIQUE (usuario_id, referencia_id);
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario_id_lida ON public.notificacoes(usuario_id, lida);
CREATE INDEX IF NOT EXISTS idx_notificacoes_data_criacao ON public.notificacoes(data_criacao);
