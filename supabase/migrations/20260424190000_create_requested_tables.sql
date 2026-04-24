-- 1. CRM e Gestão de Leads
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT,
    email TEXT,
    telefone TEXT,
    empresa TEXT,
    estagio TEXT DEFAULT 'Novo Lead',
    status_interesse TEXT DEFAULT 'Interessado',
    observacoes TEXT,
    endereco TEXT,
    data_criacao TIMESTAMPTZ DEFAULT NOW(),
    name TEXT,
    phone TEXT,
    company TEXT,
    details TEXT,
    usuario_id UUID
);

ALTER TABLE public.leads 
  ADD COLUMN IF NOT EXISTS nome TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS telefone TEXT,
  ADD COLUMN IF NOT EXISTS empresa TEXT,
  ADD COLUMN IF NOT EXISTS estagio TEXT DEFAULT 'Novo Lead',
  ADD COLUMN IF NOT EXISTS status_interesse TEXT DEFAULT 'Interessado',
  ADD COLUMN IF NOT EXISTS observacoes TEXT,
  ADD COLUMN IF NOT EXISTS endereco TEXT;

CREATE TABLE IF NOT EXISTS public.historico_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    contato_nome TEXT,
    forma_contato TEXT,
    detalhes TEXT,
    data_criacao TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Clientes e Parceiros
CREATE TABLE IF NOT EXISTS public.clientes_externos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    empresa TEXT,
    email TEXT,
    telefone TEXT,
    cnpj TEXT,
    documentos JSONB DEFAULT '[]'::jsonb,
    data_criacao TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.leads_parceiros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    email TEXT,
    telefone TEXT,
    profissao TEXT,
    data_criacao TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Administração e Controle
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    perfil TEXT DEFAULT 'colaborador',
    ativo BOOLEAN DEFAULT true,
    telefone TEXT,
    data_criacao TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'usuarios_id_fkey') THEN
    ALTER TABLE public.usuarios ADD CONSTRAINT usuarios_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 3. Operacional e Demandas (Kanban)
CREATE TABLE IF NOT EXISTS public.demandas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID,
    tipo_demanda TEXT,
    descricao TEXT,
    prazo TEXT,
    detalhes_adicionais TEXT,
    status TEXT DEFAULT 'Pendente',
    responsavel_id UUID,
    data_criacao TIMESTAMPTZ DEFAULT NOW(),
    data_atualizacao TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.demandas
  ADD COLUMN IF NOT EXISTS titulo TEXT,
  ADD COLUMN IF NOT EXISTS prioridade TEXT DEFAULT 'Pode Ficar para Amanhã',
  ADD COLUMN IF NOT EXISTS data_vencimento TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS checklist JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS anexos JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS resposta TEXT,
  ADD COLUMN IF NOT EXISTS data_resposta TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS data_conclusao TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS usuario_id UUID;

ALTER TABLE public.demandas DROP CONSTRAINT IF EXISTS demandas_cliente_id_fkey;
ALTER TABLE public.demandas ADD CONSTRAINT demandas_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes_externos(id) ON DELETE SET NULL;

ALTER TABLE public.demandas DROP CONSTRAINT IF EXISTS demandas_responsavel_id_fkey;
ALTER TABLE public.demandas ADD CONSTRAINT demandas_responsavel_id_fkey FOREIGN KEY (responsavel_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.agenda_eventos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    descricao TEXT,
    data_inicio TIMESTAMPTZ NOT NULL,
    data_fim TIMESTAMPTZ NOT NULL,
    tipo TEXT,
    privado BOOLEAN DEFAULT false,
    usuario_id UUID REFERENCES auth.users(id),
    data_criacao TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Módulo de RH e Colaboradores
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    manager_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    profession TEXT,
    status TEXT DEFAULT 'Novo',
    disc_result JSONB,
    resume_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cpf TEXT UNIQUE NOT NULL,
    rg TEXT,
    salary NUMERIC,
    status TEXT DEFAULT 'Ativo',
    hire_date DATE,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    personal_data JSONB,
    professional_data JSONB,
    experience_end_date DATE,
    candidate_id UUID REFERENCES public.candidates(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notificacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    lida BOOLEAN DEFAULT false,
    tipo TEXT,
    referencia_id TEXT,
    demanda_id UUID REFERENCES public.demandas(id) ON DELETE CASCADE,
    data_criacao TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.configuracoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chave TEXT UNIQUE NOT NULL,
    valor JSONB,
    data_criacao TIMESTAMPTZ DEFAULT NOW(),
    data_atualizacao TIMESTAMPTZ DEFAULT NOW()
);

-- Additional dependencies
CREATE TABLE IF NOT EXISTS public.logs_auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    demanda_id UUID REFERENCES public.demandas(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    acao TEXT NOT NULL,
    detalhes TEXT,
    dados_anteriores JSONB,
    dados_novos JSONB,
    data_criacao TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.checklist_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    itens JSONB DEFAULT '[]'::jsonb,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    data_criacao TIMESTAMPTZ DEFAULT NOW()
);

-- Auto creation of usuarios profile
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, email, nome, perfil)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), COALESCE(NEW.raw_user_meta_data->>'perfil', 'colaborador'))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_usuarios ON auth.users;
CREATE TRIGGER on_auth_user_created_usuarios
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- RLS Setup
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_clientes" ON public.clientes;
CREATE POLICY "allow_all_clientes" ON public.clientes FOR ALL USING (true);

ALTER TABLE public.colaboradores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_colaboradores" ON public.colaboradores;
CREATE POLICY "allow_all_colaboradores" ON public.colaboradores FOR ALL USING (true);

ALTER TABLE public.demandas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_demandas" ON public.demandas;
CREATE POLICY "allow_all_demandas" ON public.demandas FOR ALL USING (true);

ALTER TABLE public.mapeamento_demandas_responsaveis ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_mapeamento_demandas_responsaveis" ON public.mapeamento_demandas_responsaveis;
CREATE POLICY "allow_all_mapeamento_demandas_responsaveis" ON public.mapeamento_demandas_responsaveis FOR ALL USING (true);

ALTER TABLE public.midia_demanda ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_midia_demanda" ON public.midia_demanda;
CREATE POLICY "allow_all_midia_demanda" ON public.midia_demanda FOR ALL USING (true);

ALTER TABLE public.ponto_configuracoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_ponto_configuracoes" ON public.ponto_configuracoes;
CREATE POLICY "allow_all_ponto_configuracoes" ON public.ponto_configuracoes FOR ALL USING (true);

ALTER TABLE public.clientes_externos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_clientes_externos" ON public.clientes_externos;
CREATE POLICY "allow_all_clientes_externos" ON public.clientes_externos FOR ALL USING (true);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_leads" ON public.leads;
CREATE POLICY "allow_all_leads" ON public.leads FOR ALL USING (true);

ALTER TABLE public.historico_leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_historico_leads" ON public.historico_leads;
CREATE POLICY "allow_all_historico_leads" ON public.historico_leads FOR ALL USING (true);

ALTER TABLE public.leads_parceiros ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_leads_parceiros" ON public.leads_parceiros;
CREATE POLICY "allow_all_leads_parceiros" ON public.leads_parceiros FOR ALL USING (true);

ALTER TABLE public.agenda_eventos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_agenda_eventos" ON public.agenda_eventos;
CREATE POLICY "allow_all_agenda_eventos" ON public.agenda_eventos FOR ALL USING (true);

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_departments" ON public.departments;
CREATE POLICY "allow_all_departments" ON public.departments FOR ALL USING (true);

ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_candidates" ON public.candidates;
CREATE POLICY "allow_all_candidates" ON public.candidates FOR ALL USING (true);

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_employees" ON public.employees;
CREATE POLICY "allow_all_employees" ON public.employees FOR ALL USING (true);

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_usuarios" ON public.usuarios;
CREATE POLICY "allow_all_usuarios" ON public.usuarios FOR ALL USING (true);

ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_notificacoes" ON public.notificacoes;
CREATE POLICY "allow_all_notificacoes" ON public.notificacoes FOR ALL USING (true);

ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_configuracoes" ON public.configuracoes;
CREATE POLICY "allow_all_configuracoes" ON public.configuracoes FOR ALL USING (true);

ALTER TABLE public.logs_auditoria ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_logs_auditoria" ON public.logs_auditoria;
CREATE POLICY "allow_all_logs_auditoria" ON public.logs_auditoria FOR ALL USING (true);

ALTER TABLE public.checklist_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_checklist_templates" ON public.checklist_templates;
CREATE POLICY "allow_all_checklist_templates" ON public.checklist_templates FOR ALL USING (true);
