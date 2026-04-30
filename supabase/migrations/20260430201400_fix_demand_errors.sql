DO $$
BEGIN
  -- Create 'anexos' bucket if not exists
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('anexos', 'anexos', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Drop dependent policies before re-creating
DROP POLICY IF EXISTS "allow_all_select_anexos" ON storage.objects;
DROP POLICY IF EXISTS "allow_all_insert_anexos" ON storage.objects;
DROP POLICY IF EXISTS "allow_all_update_anexos" ON storage.objects;
DROP POLICY IF EXISTS "allow_all_delete_anexos" ON storage.objects;

CREATE POLICY "allow_all_select_anexos" ON storage.objects FOR SELECT USING (bucket_id = 'anexos');
CREATE POLICY "allow_all_insert_anexos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'anexos');
CREATE POLICY "allow_all_update_anexos" ON storage.objects FOR UPDATE USING (bucket_id = 'anexos');
CREATE POLICY "allow_all_delete_anexos" ON storage.objects FOR DELETE USING (bucket_id = 'anexos');

-- Ensure RLS is permissive on the relevant tables
ALTER TABLE public.demandas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_demandas" ON public.demandas;
CREATE POLICY "allow_all_demandas" ON public.demandas FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.logs_auditoria ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_logs_auditoria" ON public.logs_auditoria;
CREATE POLICY "allow_all_logs_auditoria" ON public.logs_auditoria FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.agenda_eventos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_agenda_eventos" ON public.agenda_eventos;
CREATE POLICY "allow_all_agenda_eventos" ON public.agenda_eventos FOR ALL USING (true) WITH CHECK (true);

-- Add demanda_id to agenda_eventos so the edit modal insert doesn't fail
ALTER TABLE public.agenda_eventos ADD COLUMN IF NOT EXISTS demanda_id uuid REFERENCES public.demandas(id) ON DELETE CASCADE;

-- Ensure dados_novos column is JSONB (already is, but just to be safe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'logs_auditoria' AND column_name = 'dados_novos'
  ) THEN
    ALTER TABLE public.logs_auditoria ADD COLUMN dados_novos jsonb;
  END IF;
END $$;

-- Update the create_demand_with_event RPC to include demanda_id
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
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
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
      usuario_id,
      demanda_id
    ) VALUES (
      p_event_titulo,
      v_final_event_desc,
      p_event_data_inicio,
      COALESCE(p_event_data_fim, p_event_data_inicio),
      p_event_tipo,
      p_usuario_id,
      v_demanda_id
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
$function$;
