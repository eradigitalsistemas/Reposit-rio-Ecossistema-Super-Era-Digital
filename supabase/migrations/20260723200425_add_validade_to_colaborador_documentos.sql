-- Add validade column to colaborador_documentos
ALTER TABLE public.colaborador_documentos ADD COLUMN IF NOT EXISTS validade DATE;

-- Add UPDATE policy for colaborador_documentos (needed to update validade)
DROP POLICY IF EXISTS "authenticated_update_colaborador_documentos" ON public.colaborador_documentos;
CREATE POLICY "authenticated_update_colaborador_documentos" ON public.colaborador_documentos
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
