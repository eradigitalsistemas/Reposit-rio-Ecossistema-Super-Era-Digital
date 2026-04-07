DO $$
BEGIN
  -- Insert policy for authenticated users (allows normal users to add timeline comments)
  DROP POLICY IF EXISTS "Colaboradores podem inserir logs_auditoria" ON public.logs_auditoria;
  CREATE POLICY "Colaboradores podem inserir logs_auditoria" ON public.logs_auditoria
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id);

  -- Select policy for authenticated users (allows normal users to view timeline comments)
  DROP POLICY IF EXISTS "Usuarios podem ver logs_auditoria" ON public.logs_auditoria;
  CREATE POLICY "Usuarios podem ver logs_auditoria" ON public.logs_auditoria
    FOR SELECT TO authenticated USING (true);
END $$;
