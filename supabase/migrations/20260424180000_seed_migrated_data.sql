DO $DO$
DECLARE
  v_admin_id UUID;
  v_lead1_id UUID := gen_random_uuid();
  v_lead2_id UUID := gen_random_uuid();
  v_lead3_id UUID := gen_random_uuid();
  v_cliente1_id UUID := gen_random_uuid();
  v_cliente2_id UUID := gen_random_uuid();
  v_demanda1_id UUID := gen_random_uuid();
  v_demanda2_id UUID := gen_random_uuid();
  v_demanda3_id UUID := gen_random_uuid();
  v_dept_id UUID := gen_random_uuid();
BEGIN
  -- Tenta encontrar o usuário comercial (admin), ou qualquer outro usuário existente como fallback
  SELECT id INTO v_admin_id FROM auth.users WHERE email = 'comercial@areradigital.com.br' LIMIT 1;
  
  IF v_admin_id IS NULL THEN
    SELECT id INTO v_admin_id FROM auth.users LIMIT 1;
  END IF;

  IF v_admin_id IS NOT NULL THEN
    -- 1. Inserir Leads Migrados
    INSERT INTO public.leads (id, nome, email, telefone, empresa, estagio, usuario_id, status_interesse, observacoes)
    VALUES 
      (v_lead1_id, 'João Silva', 'joao.silva@exemplo.com', '11999999999', 'Tech Corp', 'Captado', v_admin_id, 'Interessado', 'Lead migrado do sistema anterior.'),
      (v_lead2_id, 'Maria Oliveira', 'maria.o@empresa.com.br', '11988888888', 'Serviços SA', 'Qualificado', v_admin_id, 'Muito Interessado', 'Aguardando proposta.'),
      (v_lead3_id, 'Roberto Costa', 'roberto@comercio.com', '11977777777', 'Comércio RC', 'Apresentação', v_admin_id, 'Interessado', 'Reunião agendada.')
    ON CONFLICT (id) DO NOTHING;

    -- 2. Inserir Clientes Externos Migrados
    INSERT INTO public.clientes_externos (id, nome, empresa, email, telefone, cnpj)
    VALUES 
      (v_cliente1_id, 'Carlos Santos', 'Mega Varejo', 'carlos@megavarejo.com', '11966666666', '12345678000199'),
      (v_cliente2_id, 'Fernanda Lima', 'Logística Express', 'fernanda@logexpress.com', '11955555555', '98765432000188')
    ON CONFLICT (id) DO NOTHING;

    -- 3. Inserir Demandas Migradas
    INSERT INTO public.demandas (id, titulo, descricao, prioridade, status, usuario_id, responsavel_id, cliente_id)
    VALUES 
      (v_demanda1_id, 'Implementação de ERP', 'Configurar módulos financeiro e estoque.', 'Alta', 'Pendente', v_admin_id, v_admin_id, v_cliente1_id),
      (v_demanda2_id, 'Suporte Técnico - Rede', 'Verificar instabilidade na filial principal.', 'Urgente', 'Em Andamento', v_admin_id, v_admin_id, v_cliente1_id),
      (v_demanda3_id, 'Treinamento de Equipe', 'Capacitação no novo sistema de Kanban.', 'Média', 'Concluído', v_admin_id, v_admin_id, v_cliente2_id)
    ON CONFLICT (id) DO NOTHING;

    -- 4. Inserir Departamentos Migrados
    INSERT INTO public.departments (id, name, manager_id)
    VALUES 
      (v_dept_id, 'Tecnologia da Informação', v_admin_id),
      (gen_random_uuid(), 'Recursos Humanos', v_admin_id),
      (gen_random_uuid(), 'Comercial e Vendas', v_admin_id)
    ON CONFLICT (id) DO NOTHING;

    -- 5. Inserir Candidatos Migrados (Banco de Talentos)
    INSERT INTO public.candidates (email, name, status, profession)
    VALUES 
      ('pedro.dev@email.com', 'Pedro Desenvolvedor', 'Entrevistado', 'Desenvolvedor Frontend'),
      ('ana.rh@email.com', 'Ana RH', 'Novo', 'Analista de RH'),
      ('lucas.suporte@email.com', 'Lucas Suporte', 'Contratado', 'Suporte Técnico')
    ON CONFLICT (email) DO NOTHING;

    -- 6. Inserir Histórico de Leads Migrados
    INSERT INTO public.historico_leads (lead_id, usuario_id, contato_nome, forma_contato, detalhes)
    VALUES
      (v_lead1_id, v_admin_id, 'Contato Inicial', 'WhatsApp', 'Primeira abordagem feita com sucesso.'),
      (v_lead2_id, v_admin_id, 'Envio de Proposta', 'Email', 'Proposta comercial enviada em anexo.')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $DO$;
