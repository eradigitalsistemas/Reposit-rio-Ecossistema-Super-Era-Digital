CREATE TABLE IF NOT EXISTS public.historico_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    contato_nome TEXT NOT NULL,
    forma_contato TEXT NOT NULL,
    detalhes TEXT NOT NULL,
    data_criacao TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.historico_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem gerenciar tudo em historico_leads" ON public.historico_leads
    FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Usuarios gerenciam interacoes de seus leads" ON public.historico_leads
    FOR ALL TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.leads l WHERE l.id = historico_leads.lead_id AND l.usuario_id = auth.uid()
        )
    ) 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.leads l WHERE l.id = historico_leads.lead_id AND l.usuario_id = auth.uid()
        )
    );
