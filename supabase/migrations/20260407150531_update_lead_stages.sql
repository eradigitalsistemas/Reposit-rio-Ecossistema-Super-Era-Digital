DO $$
DECLARE
  v_lead RECORD;
  v_novo_estagio TEXT;
BEGIN
  FOR v_lead IN SELECT id, estagio, usuario_id FROM public.leads WHERE estagio IN ('leads', 'prospeccao', 'treinamento', 'finalizado') LOOP
    
    IF v_lead.estagio = 'leads' THEN
      v_novo_estagio := 'novo_lead';
    ELSIF v_lead.estagio = 'prospeccao' OR v_lead.estagio = 'treinamento' THEN
      v_novo_estagio := 'em_negociacao';
    ELSIF v_lead.estagio = 'finalizado' THEN
      v_novo_estagio := 'encerrado';
    ELSE
      CONTINUE;
    END IF;

    -- Update lead
    UPDATE public.leads SET estagio = v_novo_estagio WHERE id = v_lead.id;

    -- Insert into historico_leads
    INSERT INTO public.historico_leads (lead_id, usuario_id, contato_nome, forma_contato, detalhes)
    VALUES (
      v_lead.id, 
      v_lead.usuario_id, 
      'Sistema', 
      'Atualização Automática', 
      'Estágio migrado de ' || v_lead.estagio || ' para ' || v_novo_estagio || ' (Atualização de Sistema)'
    );

  END LOOP;
END $$;
