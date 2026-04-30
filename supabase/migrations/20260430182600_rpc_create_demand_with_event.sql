CREATE OR REPLACE FUNCTION public.create_demand_with_event(
  p_titulo text,
  p_descricao text,
  p_prioridade text,
  p_status text,
  p_data_vencimento timestamp with time zone,
  p_responsavel_id uuid,
  p_cliente_id uuid,
  p_usuario_id uuid,
  p_tipo_demanda text,
  p_anexos jsonb,
  p_checklist jsonb,
  p_create_event boolean,
  p_event_titulo text,
  p_event_descricao text,
  p_event_data_inicio timestamp with time zone,
  p_event_data_fim timestamp with time zone,
  p_event_tipo text
)
RETURNS jsonb AS $$
DECLARE
  v_demanda_id uuid;
  v_event_id uuid;
  v_result jsonb;
  v_final_event_desc text;
BEGIN
  INSERT INTO public.demandas (
    titulo,
    descricao,
    prioridade,
    status,
    data_vencimento,
    responsavel_id,
    cliente_id,
    usuario_id,
    tipo_demanda,
    anexos,
    checklist,
    data_criacao,
    data_atualizacao
  ) VALUES (
    p_titulo,
    p_descricao,
    p_prioridade,
    p_status,
    p_data_vencimento,
    p_responsavel_id,
    p_cliente_id,
    p_usuario_id,
    p_tipo_demanda,
    COALESCE(p_anexos, '[]'::jsonb),
    COALESCE(p_checklist, '[]'::jsonb),
    NOW(),
    NOW()
  ) RETURNING id INTO v_demanda_id;

  IF p_event_descricao IS NULL OR p_event_descricao = '' THEN
    v_final_event_desc := 'Link para demanda original: /demandas?highlight=' || v_demanda_id::text;
  ELSE
    v_final_event_desc := p_event_descricao || E'\n\nLink para demanda original: /demandas?highlight=' || v_demanda_id::text;
  END IF;

  IF p_create_event AND p_event_data_inicio IS NOT NULL THEN
    INSERT INTO public.agenda_eventos (
      titulo,
      descricao,
      data_inicio,
      data_fim,
      tipo,
      usuario_id
    ) VALUES (
      p_event_titulo,
      v_final_event_desc,
      p_event_data_inicio,
      COALESCE(p_event_data_fim, p_event_data_inicio),
      p_event_tipo,
      p_usuario_id
    ) RETURNING id INTO v_event_id;
  END IF;

  v_result := jsonb_build_object(
    'demanda_id', v_demanda_id,
    'event_id', v_event_id
  );

  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erro ao salvar demanda e evento: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
