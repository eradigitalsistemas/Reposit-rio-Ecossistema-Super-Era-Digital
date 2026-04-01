CREATE TABLE IF NOT EXISTS public.checklist_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    itens JSONB NOT NULL DEFAULT '[]'::jsonb,
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    data_criacao TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "Todos podem ver templates" ON public.checklist_templates;
CREATE POLICY "Todos podem ver templates" ON public.checklist_templates
    FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Usuarios podem inserir templates" ON public.checklist_templates;
CREATE POLICY "Usuarios podem inserir templates" ON public.checklist_templates
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Usuarios gerenciam proprios templates" ON public.checklist_templates;
CREATE POLICY "Usuarios gerenciam proprios templates" ON public.checklist_templates
    FOR UPDATE TO authenticated
    USING (auth.uid() = usuario_id)
    WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Usuarios deletam proprios templates" ON public.checklist_templates;
CREATE POLICY "Usuarios deletam proprios templates" ON public.checklist_templates
    FOR DELETE TO authenticated
    USING (auth.uid() = usuario_id);

ALTER TABLE public.checklist_templates ENABLE ROW LEVEL SECURITY;
