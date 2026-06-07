DO $DO$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'demandas' AND column_name = 'workflow_tipo') THEN
    ALTER TABLE public.demandas ADD COLUMN workflow_tipo text DEFAULT 'geral';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'demandas' AND column_name = 'pos_venda_fase') THEN
    ALTER TABLE public.demandas ADD COLUMN pos_venda_fase text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'demandas' AND column_name = 'data_proxima_acao') THEN
    ALTER TABLE public.demandas ADD COLUMN data_proxima_acao timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'demandas' AND column_name = 'data_conclusao_treinamento') THEN
    ALTER TABLE public.demandas ADD COLUMN data_conclusao_treinamento timestamptz;
  END IF;
END $DO$;
