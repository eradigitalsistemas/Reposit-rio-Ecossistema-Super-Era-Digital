DO $$
BEGIN
  -- Safe mapping of old stages to new stages
  UPDATE public.leads SET estagio = 'novo_lead' WHERE estagio IN ('Leads', 'Novo Lead');
  UPDATE public.leads SET estagio = 'em_negociacao' WHERE estagio IN ('Prospecção', 'Em Treinamento', 'Em Negociação');
  UPDATE public.leads SET estagio = 'convertido' WHERE estagio = 'Convertido';
  
  -- Log the migration for 'Finalizado' to 'Encerrado' before updating the status
  INSERT INTO public.historico_leads (lead_id, usuario_id, contato_nome, forma_contato, detalhes)
  SELECT 
    id, 
    usuario_id, 
    'Sistema', 
    'Mensagem', 
    '[Migração Automática] O status deste lead foi atualizado de "Finalizado" para "Encerrado".'
  FROM public.leads
  WHERE estagio = 'Finalizado';

  UPDATE public.leads SET estagio = 'encerrado' WHERE estagio IN ('Finalizado', 'Encerrado');
  UPDATE public.leads SET estagio = 'ativo' WHERE estagio IN ('Cliente Ativo', 'ativo');
  UPDATE public.leads SET estagio = 'pos_venda' WHERE estagio IN ('Pós-Venda', 'pos_venda');

END $$;
