-- Cria a função correta para atualizar a coluna data_atualizacao
CREATE OR REPLACE FUNCTION public.set_data_atualizacao_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.data_atualizacao = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remove o gatilho incorreto que estava buscando a coluna updated_at
DROP TRIGGER IF EXISTS set_public_demandas_updated_at ON public.demandas;

-- Cria o gatilho correto apontando para a função de data_atualizacao
DROP TRIGGER IF EXISTS set_public_demandas_data_atualizacao ON public.demandas;
CREATE TRIGGER set_public_demandas_data_atualizacao
BEFORE UPDATE ON public.demandas
FOR EACH ROW EXECUTE FUNCTION public.set_data_atualizacao_timestamp();
