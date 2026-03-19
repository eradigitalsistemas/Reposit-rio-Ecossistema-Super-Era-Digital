-- Refine Row Level Security for Demandas
DROP POLICY IF EXISTS "Usuarios podem aceitar demandas nao atribuidas" ON public.demandas;
DROP POLICY IF EXISTS "Usuarios podem ver demandas nao atribuidas" ON public.demandas;
DROP POLICY IF EXISTS "Responsaveis podem ver demandas" ON public.demandas;
DROP POLICY IF EXISTS "Responsaveis podem atualizar demandas" ON public.demandas;
DROP POLICY IF EXISTS "Usuarios gerenciam proprias demandas" ON public.demandas;

-- Creates a unified policy for Collaborators to manage only their own or assigned demands
CREATE POLICY "Colaboradores acessam proprias demandas" ON public.demandas
    FOR ALL TO authenticated 
    USING (
        auth.uid() = responsavel_id OR 
        auth.uid() = usuario_id OR
        is_admin()
    )
    WITH CHECK (
        auth.uid() = responsavel_id OR 
        auth.uid() = usuario_id OR
        is_admin()
    );

-- Support array of documents in external clients table
ALTER TABLE public.clientes_externos ADD COLUMN IF NOT EXISTS documentos JSONB DEFAULT '[]'::jsonb;

-- Storage Setup for Client Documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documentos_clientes', 'documentos_clientes', false) 
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "Admins e Colaboradores gerenciam documentos" ON storage.objects
    FOR ALL TO authenticated
    USING (bucket_id = 'documentos_clientes')
    WITH CHECK (bucket_id = 'documentos_clientes');
