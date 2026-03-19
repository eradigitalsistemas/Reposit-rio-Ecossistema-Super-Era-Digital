CREATE TABLE IF NOT EXISTS public.notificacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    lida BOOLEAN NOT NULL DEFAULT false,
    demanda_id UUID REFERENCES public.demandas(id) ON DELETE CASCADE,
    data_criacao TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios podem ver proprias notificacoes" ON public.notificacoes
    FOR SELECT TO authenticated
    USING (auth.uid() = usuario_id);

CREATE POLICY "Usuarios podem atualizar proprias notificacoes" ON public.notificacoes
    FOR UPDATE TO authenticated
    USING (auth.uid() = usuario_id)
    WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Sistema pode inserir notificacoes" ON public.notificacoes
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Trigger to create notification on assignment
CREATE OR REPLACE FUNCTION public.trigger_nova_notificacao_demanda()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    -- Scenario 1: New demand assigned
    IF TG_OP = 'INSERT' AND NEW.responsavel_id IS NOT NULL THEN
        INSERT INTO public.notificacoes (usuario_id, titulo, mensagem, demanda_id)
        VALUES (NEW.responsavel_id, 'Nova Demanda Atribuída', 'A demanda "' || NEW.titulo || '" foi atribuída a você.', NEW.id);
    END IF;

    -- Scenario 2: Existing demand reassigned
    IF TG_OP = 'UPDATE' AND NEW.responsavel_id IS NOT NULL AND NEW.responsavel_id IS DISTINCT FROM OLD.responsavel_id THEN
        INSERT INTO public.notificacoes (usuario_id, titulo, mensagem, demanda_id)
        VALUES (NEW.responsavel_id, 'Nova Demanda Atribuída', 'A demanda "' || NEW.titulo || '" foi atribuída a você.', NEW.id);
    END IF;

    RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS on_demanda_atribuida_notificacao ON public.demandas;
CREATE TRIGGER on_demanda_atribuida_notificacao
    AFTER INSERT OR UPDATE ON public.demandas
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_nova_notificacao_demanda();
