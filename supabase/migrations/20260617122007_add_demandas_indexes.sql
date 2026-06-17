CREATE INDEX IF NOT EXISTS idx_demandas_status ON public.demandas(status);
CREATE INDEX IF NOT EXISTS idx_demandas_data_criacao ON public.demandas(data_criacao DESC);
