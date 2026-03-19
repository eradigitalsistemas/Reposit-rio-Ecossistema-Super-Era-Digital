-- Create the new bucket for client documents as requested
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documentos-clientes', 'documentos-clientes', false) 
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for the new bucket
CREATE POLICY "Admins e Colaboradores gerenciam documentos clientes" ON storage.objects
    FOR ALL TO authenticated
    USING (bucket_id = 'documentos-clientes')
    WITH CHECK (bucket_id = 'documentos-clientes');
