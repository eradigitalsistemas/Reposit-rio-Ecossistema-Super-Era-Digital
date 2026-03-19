-- Refine Row Level Security for Demandas to strictly enforce "Collaborators only see what they are responsible for"

-- Drop the existing broader policy
DROP POLICY IF EXISTS "Colaboradores acessam proprias demandas" ON public.demandas;

-- Admins already have a policy: "Admins podem gerenciar tudo em demandas" (ALL, USING is_admin())

-- SELECT: Collaborators only see demands where they are assigned as responsible
CREATE POLICY "Colaboradores veem proprias demandas" ON public.demandas
    FOR SELECT TO authenticated 
    USING (auth.uid() = responsavel_id OR is_admin());

-- INSERT: Collaborators can create new demands (and assign to anyone)
CREATE POLICY "Colaboradores inserem demandas" ON public.demandas
    FOR INSERT TO authenticated 
    WITH CHECK (true);

-- UPDATE: Collaborators can update demands if they are currently the responsible user or the creator
CREATE POLICY "Colaboradores atualizam demandas" ON public.demandas
    FOR UPDATE TO authenticated 
    USING (auth.uid() = responsavel_id OR auth.uid() = usuario_id OR is_admin())
    WITH CHECK (true);

-- DELETE: Collaborators can delete if they are the creator or responsible
CREATE POLICY "Colaboradores deletam demandas" ON public.demandas
    FOR DELETE TO authenticated
    USING (auth.uid() = responsavel_id OR auth.uid() = usuario_id OR is_admin());
