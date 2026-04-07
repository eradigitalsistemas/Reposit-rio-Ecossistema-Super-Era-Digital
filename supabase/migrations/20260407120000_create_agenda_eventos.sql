CREATE TABLE IF NOT EXISTS public.agenda_eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_inicio TIMESTAMPTZ NOT NULL,
  data_fim TIMESTAMPTZ NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'Evento',
  privado BOOLEAN NOT NULL DEFAULT false,
  data_criacao TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.agenda_eventos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "agenda_select" ON public.agenda_eventos;
CREATE POLICY "agenda_select" ON public.agenda_eventos
  FOR SELECT TO authenticated
  USING (
    usuario_id = auth.uid() OR 
    (privado = false AND public.is_admin())
  );

DROP POLICY IF EXISTS "agenda_insert" ON public.agenda_eventos;
CREATE POLICY "agenda_insert" ON public.agenda_eventos
  FOR INSERT TO authenticated
  WITH CHECK (usuario_id = auth.uid());

DROP POLICY IF EXISTS "agenda_update" ON public.agenda_eventos;
CREATE POLICY "agenda_update" ON public.agenda_eventos
  FOR UPDATE TO authenticated
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());

DROP POLICY IF EXISTS "agenda_delete" ON public.agenda_eventos;
CREATE POLICY "agenda_delete" ON public.agenda_eventos
  FOR DELETE TO authenticated
  USING (usuario_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_agenda_eventos_usuario_id ON public.agenda_eventos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_agenda_eventos_data_inicio ON public.agenda_eventos(data_inicio);
