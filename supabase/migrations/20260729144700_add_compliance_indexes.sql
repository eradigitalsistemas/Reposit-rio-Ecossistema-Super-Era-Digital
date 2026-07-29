CREATE INDEX IF NOT EXISTS idx_certidoes_empresa_data_validade ON public.certidoes_empresa(data_validade);
CREATE INDEX IF NOT EXISTS idx_sst_documents_data_validade ON public.sst_documents(data_validade);
CREATE INDEX IF NOT EXISTS idx_colaborador_atestados_data_vencimento ON public.colaborador_atestados(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_colaborador_documentos_validade ON public.colaborador_documentos(validade);
