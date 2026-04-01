-- Add cliente_id to demandas table to allow linking demands to external clients
ALTER TABLE public.demandas ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES public.clientes_externos(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_demandas_cliente_id ON public.demandas(cliente_id);
