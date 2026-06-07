DO $$
BEGIN
  UPDATE public.demandas
  SET
    time_pending_ms = CASE
      WHEN status IN ('Em Andamento', 'Concluído') AND data_aceite IS NOT NULL THEN GREATEST(0, EXTRACT(EPOCH FROM (data_aceite - data_criacao)) * 1000)
      ELSE COALESCE(time_pending_ms, 0)
    END,
    time_in_progress_ms = CASE
      WHEN status = 'Concluído' AND data_aceite IS NOT NULL AND data_conclusao IS NOT NULL THEN GREATEST(0, EXTRACT(EPOCH FROM (data_conclusao - data_aceite)) * 1000)
      WHEN status = 'Concluído' AND data_aceite IS NULL AND data_conclusao IS NOT NULL THEN GREATEST(0, EXTRACT(EPOCH FROM (data_conclusao - data_criacao)) * 1000)
      ELSE COALESCE(time_in_progress_ms, 0)
    END,
    last_status_change_at = CASE
      WHEN last_status_change_at IS NOT NULL THEN last_status_change_at
      WHEN status = 'Pendente' THEN COALESCE(data_criacao, NOW())
      WHEN status = 'Em Andamento' THEN COALESCE(data_aceite, data_criacao, NOW())
      WHEN status = 'Concluído' THEN COALESCE(data_conclusao, data_aceite, data_criacao, NOW())
      ELSE COALESCE(data_atualizacao, NOW())
    END
  WHERE last_status_change_at IS NULL 
     OR (time_pending_ms = 0 AND time_in_progress_ms = 0 AND status = 'Concluído')
     OR (time_pending_ms = 0 AND status = 'Em Andamento');
END $$;
