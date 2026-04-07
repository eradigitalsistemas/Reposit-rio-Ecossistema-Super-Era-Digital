ALTER TABLE public.agenda_eventos ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES public.clientes_externos(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_agenda_eventos_cliente_id ON public.agenda_eventos(cliente_id);
