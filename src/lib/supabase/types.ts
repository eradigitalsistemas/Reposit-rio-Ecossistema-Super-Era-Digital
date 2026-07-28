// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.4'
  }
  public: {
    Tables: {
      agenda_eventos: {
        Row: {
          cliente_id: string | null
          criado_por: string | null
          data_criacao: string | null
          data_fim: string
          data_inicio: string
          demanda_id: string | null
          descricao: string | null
          id: string
          lead_id: string | null
          privado: boolean | null
          tipo: string | null
          titulo: string
          usuario_id: string | null
        }
        Insert: {
          cliente_id?: string | null
          criado_por?: string | null
          data_criacao?: string | null
          data_fim: string
          data_inicio: string
          demanda_id?: string | null
          descricao?: string | null
          id?: string
          lead_id?: string | null
          privado?: boolean | null
          tipo?: string | null
          titulo: string
          usuario_id?: string | null
        }
        Update: {
          cliente_id?: string | null
          criado_por?: string | null
          data_criacao?: string | null
          data_fim?: string
          data_inicio?: string
          demanda_id?: string | null
          descricao?: string | null
          id?: string
          lead_id?: string | null
          privado?: boolean | null
          tipo?: string | null
          titulo?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'agenda_eventos_cliente_id_fkey'
            columns: ['cliente_id']
            isOneToOne: false
            referencedRelation: 'clientes_externos'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'agenda_eventos_demanda_id_fkey'
            columns: ['demanda_id']
            isOneToOne: false
            referencedRelation: 'demandas'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'agenda_eventos_lead_id_fkey'
            columns: ['lead_id']
            isOneToOne: false
            referencedRelation: 'leads'
            referencedColumns: ['id']
          },
        ]
      }
      auth_logs: {
        Row: {
          created_at: string | null
          details: string | null
          email: string | null
          event_type: string | null
          id: string
          ip_address: string | null
        }
        Insert: {
          created_at?: string | null
          details?: string | null
          email?: string | null
          event_type?: string | null
          id?: string
          ip_address?: string | null
        }
        Update: {
          created_at?: string | null
          details?: string | null
          email?: string | null
          event_type?: string | null
          id?: string
          ip_address?: string | null
        }
        Relationships: []
      }
      candidates: {
        Row: {
          created_at: string | null
          disc_result: Json | null
          email: string
          id: string
          name: string
          profession: string | null
          resume_data: Json | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          disc_result?: Json | null
          email: string
          id?: string
          name: string
          profession?: string | null
          resume_data?: Json | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          disc_result?: Json | null
          email?: string
          id?: string
          name?: string
          profession?: string | null
          resume_data?: Json | null
          status?: string | null
        }
        Relationships: []
      }
      candidatos: {
        Row: {
          curriculo_url: string | null
          data_atualizacao: string | null
          data_cadastro: string | null
          disc_respondido: boolean | null
          disc_resultado: Json | null
          email: string
          empresa_id: string
          experiencias: Json | null
          formacoes: Json | null
          id: string
          nome: string
          origem: string | null
          status: string | null
          telefone: string | null
        }
        Insert: {
          curriculo_url?: string | null
          data_atualizacao?: string | null
          data_cadastro?: string | null
          disc_respondido?: boolean | null
          disc_resultado?: Json | null
          email: string
          empresa_id?: string
          experiencias?: Json | null
          formacoes?: Json | null
          id?: string
          nome: string
          origem?: string | null
          status?: string | null
          telefone?: string | null
        }
        Update: {
          curriculo_url?: string | null
          data_atualizacao?: string | null
          data_cadastro?: string | null
          disc_respondido?: boolean | null
          disc_resultado?: Json | null
          email?: string
          empresa_id?: string
          experiencias?: Json | null
          formacoes?: Json | null
          id?: string
          nome?: string
          origem?: string | null
          status?: string | null
          telefone?: string | null
        }
        Relationships: []
      }
      certificates: {
        Row: {
          benefits: string[]
          created_at: string
          description: string
          id: string
          title: string
        }
        Insert: {
          benefits: string[]
          created_at?: string
          description: string
          id?: string
          title: string
        }
        Update: {
          benefits?: string[]
          created_at?: string
          description?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      checklist_templates: {
        Row: {
          data_criacao: string | null
          id: string
          itens: Json | null
          nome: string
          usuario_id: string | null
        }
        Insert: {
          data_criacao?: string | null
          id?: string
          itens?: Json | null
          nome: string
          usuario_id?: string | null
        }
        Update: {
          data_criacao?: string | null
          id?: string
          itens?: Json | null
          nome?: string
          usuario_id?: string | null
        }
        Relationships: []
      }
      clientes: {
        Row: {
          ativo: boolean | null
          data_cadastro: string | null
          email: string | null
          empresa: string | null
          id: string
          nome: string
          telefone: string
        }
        Insert: {
          ativo?: boolean | null
          data_cadastro?: string | null
          email?: string | null
          empresa?: string | null
          id?: string
          nome: string
          telefone: string
        }
        Update: {
          ativo?: boolean | null
          data_cadastro?: string | null
          email?: string | null
          empresa?: string | null
          id?: string
          nome?: string
          telefone?: string
        }
        Relationships: []
      }
      clientes_externos: {
        Row: {
          cnpj: string | null
          data_criacao: string | null
          documentos: Json | null
          email: string | null
          empresa: string | null
          endereco_bairro: string | null
          endereco_cep: string | null
          endereco_cidade: string | null
          endereco_estado: string | null
          endereco_logradouro: string | null
          endereco_numero: string | null
          id: string
          nome: string
          servicos: Json | null
          telefone: string | null
        }
        Insert: {
          cnpj?: string | null
          data_criacao?: string | null
          documentos?: Json | null
          email?: string | null
          empresa?: string | null
          endereco_bairro?: string | null
          endereco_cep?: string | null
          endereco_cidade?: string | null
          endereco_estado?: string | null
          endereco_logradouro?: string | null
          endereco_numero?: string | null
          id?: string
          nome: string
          servicos?: Json | null
          telefone?: string | null
        }
        Update: {
          cnpj?: string | null
          data_criacao?: string | null
          documentos?: Json | null
          email?: string | null
          empresa?: string | null
          endereco_bairro?: string | null
          endereco_cep?: string | null
          endereco_cidade?: string | null
          endereco_estado?: string | null
          endereco_logradouro?: string | null
          endereco_numero?: string | null
          id?: string
          nome?: string
          servicos?: Json | null
          telefone?: string | null
        }
        Relationships: []
      }
      colaborador_atestados: {
        Row: {
          aso_url: string | null
          colaborador_id: string
          created_at: string
          data: string | null
          id: string
          medico: string | null
          tipo: string
        }
        Insert: {
          aso_url?: string | null
          colaborador_id: string
          created_at?: string
          data?: string | null
          id?: string
          medico?: string | null
          tipo?: string
        }
        Update: {
          aso_url?: string | null
          colaborador_id?: string
          created_at?: string
          data?: string | null
          id?: string
          medico?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: 'colaborador_atestados_colaborador_id_fkey'
            columns: ['colaborador_id']
            isOneToOne: false
            referencedRelation: 'colaboradores'
            referencedColumns: ['id']
          },
        ]
      }
      colaborador_cat: {
        Row: {
          arquivo_url: string | null
          colaborador_id: string
          created_at: string
          id: string
          numero: string | null
          tipo: string
        }
        Insert: {
          arquivo_url?: string | null
          colaborador_id: string
          created_at?: string
          id?: string
          numero?: string | null
          tipo: string
        }
        Update: {
          arquivo_url?: string | null
          colaborador_id?: string
          created_at?: string
          id?: string
          numero?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: 'colaborador_cat_colaborador_id_fkey'
            columns: ['colaborador_id']
            isOneToOne: false
            referencedRelation: 'colaboradores'
            referencedColumns: ['id']
          },
        ]
      }
      colaborador_documentos: {
        Row: {
          colaborador_id: string
          created_at: string
          id: string
          nome_arquivo: string | null
          status: string | null
          tipo: string
          url: string
          validade: string | null
        }
        Insert: {
          colaborador_id: string
          created_at?: string
          id?: string
          nome_arquivo?: string | null
          status?: string | null
          tipo: string
          url: string
          validade?: string | null
        }
        Update: {
          colaborador_id?: string
          created_at?: string
          id?: string
          nome_arquivo?: string | null
          status?: string | null
          tipo?: string
          url?: string
          validade?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'colaborador_documentos_colaborador_id_fkey'
            columns: ['colaborador_id']
            isOneToOne: false
            referencedRelation: 'colaboradores'
            referencedColumns: ['id']
          },
        ]
      }
      colaborador_periodicos: {
        Row: {
          arquivo_url: string | null
          colaborador_id: string
          created_at: string
          exames: string | null
          id: string
          periodicidade: string | null
        }
        Insert: {
          arquivo_url?: string | null
          colaborador_id: string
          created_at?: string
          exames?: string | null
          id?: string
          periodicidade?: string | null
        }
        Update: {
          arquivo_url?: string | null
          colaborador_id?: string
          created_at?: string
          exames?: string | null
          id?: string
          periodicidade?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'colaborador_periodicos_colaborador_id_fkey'
            columns: ['colaborador_id']
            isOneToOne: false
            referencedRelation: 'colaboradores'
            referencedColumns: ['id']
          },
        ]
      }
      colaboradores: {
        Row: {
          ativo: boolean | null
          cpf: string | null
          data_cadastro: string | null
          email: string
          empresa_doc_id: string | null
          empresa_id: string | null
          especialidades: string[] | null
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean | null
          cpf?: string | null
          data_cadastro?: string | null
          email: string
          empresa_doc_id?: string | null
          empresa_id?: string | null
          especialidades?: string[] | null
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean | null
          cpf?: string | null
          data_cadastro?: string | null
          email?: string
          empresa_doc_id?: string | null
          empresa_id?: string | null
          especialidades?: string[] | null
          id?: string
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: 'colaboradores_empresa_doc_id_fkey'
            columns: ['empresa_doc_id']
            isOneToOne: false
            referencedRelation: 'documentos_empresa'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'colaboradores_empresa_id_fkey'
            columns: ['empresa_id']
            isOneToOne: false
            referencedRelation: 'clientes_externos'
            referencedColumns: ['id']
          },
        ]
      }
      configuracoes: {
        Row: {
          chave: string
          data_atualizacao: string | null
          data_criacao: string | null
          id: string
          valor: Json | null
        }
        Insert: {
          chave: string
          data_atualizacao?: string | null
          data_criacao?: string | null
          id?: string
          valor?: Json | null
        }
        Update: {
          chave?: string
          data_atualizacao?: string | null
          data_criacao?: string | null
          id?: string
          valor?: Json | null
        }
        Relationships: []
      }
      contact_identity: {
        Row: {
          canonical_phone: string | null
          created_at: string | null
          display_name: string | null
          id: string
          instance_id: string | null
          lid_jid: string | null
          phone_jid: string | null
          user_id: string | null
        }
        Insert: {
          canonical_phone?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          instance_id?: string | null
          lid_jid?: string | null
          phone_jid?: string | null
          user_id?: string | null
        }
        Update: {
          canonical_phone?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          instance_id?: string | null
          lid_jid?: string | null
          phone_jid?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'contact_identity_instance_id_fkey'
            columns: ['instance_id']
            isOneToOne: false
            referencedRelation: 'user_integrations'
            referencedColumns: ['id']
          },
        ]
      }
      demand_templates: {
        Row: {
          checklist_id: string | null
          data_criacao: string | null
          departamento: string | null
          descricao: string | null
          id: string
          nome: string
          prioridade: string | null
          responsavel_id: string | null
          tipo_demanda: string | null
          titulo: string
          usuario_id: string | null
        }
        Insert: {
          checklist_id?: string | null
          data_criacao?: string | null
          departamento?: string | null
          descricao?: string | null
          id?: string
          nome: string
          prioridade?: string | null
          responsavel_id?: string | null
          tipo_demanda?: string | null
          titulo: string
          usuario_id?: string | null
        }
        Update: {
          checklist_id?: string | null
          data_criacao?: string | null
          departamento?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          prioridade?: string | null
          responsavel_id?: string | null
          tipo_demanda?: string | null
          titulo?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'demand_templates_checklist_id_fkey'
            columns: ['checklist_id']
            isOneToOne: false
            referencedRelation: 'checklist_templates'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'demand_templates_responsavel_id_fkey'
            columns: ['responsavel_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      demandas: {
        Row: {
          anexos: Json | null
          checklist: Json | null
          cliente_id: string | null
          data_aceite: string | null
          data_atualizacao: string | null
          data_conclusao: string | null
          data_conclusao_treinamento: string | null
          data_criacao: string | null
          data_proxima_acao: string | null
          data_resposta: string | null
          data_vencimento: string | null
          descricao: string | null
          detalhes_adicionais: string | null
          id: string
          last_status_change_at: string | null
          pos_venda_alvo: string | null
          pos_venda_fase: string | null
          prazo: string | null
          prioridade: string | null
          protocolo: string
          responsavel_id: string | null
          resposta: string | null
          status: string | null
          time_in_progress_ms: number | null
          time_pending_ms: number | null
          tipo_demanda: string
          titulo: string | null
          usuario_id: string | null
          workflow_tipo: string | null
        }
        Insert: {
          anexos?: Json | null
          checklist?: Json | null
          cliente_id?: string | null
          data_aceite?: string | null
          data_atualizacao?: string | null
          data_conclusao?: string | null
          data_conclusao_treinamento?: string | null
          data_criacao?: string | null
          data_proxima_acao?: string | null
          data_resposta?: string | null
          data_vencimento?: string | null
          descricao?: string | null
          detalhes_adicionais?: string | null
          id?: string
          last_status_change_at?: string | null
          pos_venda_alvo?: string | null
          pos_venda_fase?: string | null
          prazo?: string | null
          prioridade?: string | null
          protocolo: string
          responsavel_id?: string | null
          resposta?: string | null
          status?: string | null
          time_in_progress_ms?: number | null
          time_pending_ms?: number | null
          tipo_demanda: string
          titulo?: string | null
          usuario_id?: string | null
          workflow_tipo?: string | null
        }
        Update: {
          anexos?: Json | null
          checklist?: Json | null
          cliente_id?: string | null
          data_aceite?: string | null
          data_atualizacao?: string | null
          data_conclusao?: string | null
          data_conclusao_treinamento?: string | null
          data_criacao?: string | null
          data_proxima_acao?: string | null
          data_resposta?: string | null
          data_vencimento?: string | null
          descricao?: string | null
          detalhes_adicionais?: string | null
          id?: string
          last_status_change_at?: string | null
          pos_venda_alvo?: string | null
          pos_venda_fase?: string | null
          prazo?: string | null
          prioridade?: string | null
          protocolo?: string
          responsavel_id?: string | null
          resposta?: string | null
          status?: string | null
          time_in_progress_ms?: number | null
          time_pending_ms?: number | null
          tipo_demanda?: string
          titulo?: string | null
          usuario_id?: string | null
          workflow_tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'demandas_cliente_id_fkey'
            columns: ['cliente_id']
            isOneToOne: false
            referencedRelation: 'clientes_externos'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'demandas_responsavel_id_fkey'
            columns: ['responsavel_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      departments: {
        Row: {
          created_at: string | null
          id: string
          manager_id: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          manager_id?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          manager_id?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: 'departments_manager_id_fkey'
            columns: ['manager_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      disc_results: {
        Row: {
          created_at: string
          data_teste: string | null
          id: string
          pontuacao_c: number | null
          pontuacao_d: number | null
          pontuacao_i: number | null
          pontuacao_s: number | null
          tipo_perfil: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          data_teste?: string | null
          id?: string
          pontuacao_c?: number | null
          pontuacao_d?: number | null
          pontuacao_i?: number | null
          pontuacao_s?: number | null
          tipo_perfil?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          data_teste?: string | null
          id?: string
          pontuacao_c?: number | null
          pontuacao_d?: number | null
          pontuacao_i?: number | null
          pontuacao_s?: number | null
          tipo_perfil?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'disc_results_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      documentos_constituicao: {
        Row: {
          arquivo_url: string | null
          created_at: string
          empresa_id: string
          id: string
          status: string
          tipo: string
        }
        Insert: {
          arquivo_url?: string | null
          created_at?: string
          empresa_id: string
          id?: string
          status?: string
          tipo: string
        }
        Update: {
          arquivo_url?: string | null
          created_at?: string
          empresa_id?: string
          id?: string
          status?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: 'documentos_constituicao_empresa_id_fkey'
            columns: ['empresa_id']
            isOneToOne: false
            referencedRelation: 'clientes_externos'
            referencedColumns: ['id']
          },
        ]
      }
      documentos_empresa: {
        Row: {
          cnpj: string | null
          cpf_socio: string | null
          created_at: string
          documentos: Json | null
          email: string | null
          empresa: string
          id: string
          responsavel: string | null
          senhas_acesso: Json | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cnpj?: string | null
          cpf_socio?: string | null
          created_at?: string
          documentos?: Json | null
          email?: string | null
          empresa?: string
          id?: string
          responsavel?: string | null
          senhas_acesso?: Json | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cnpj?: string | null
          cpf_socio?: string | null
          created_at?: string
          documentos?: Json | null
          email?: string | null
          empresa?: string
          id?: string
          responsavel?: string | null
          senhas_acesso?: Json | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      educations: {
        Row: {
          created_at: string
          curso: string | null
          data_fim: string | null
          data_inicio: string | null
          id: string
          instituicao: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          curso?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          instituicao?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          curso?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          instituicao?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'educations_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      emails_sent: {
        Row: {
          created_at: string
          email: string
          id: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'emails_sent_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      employees: {
        Row: {
          candidate_id: string | null
          cpf: string
          created_at: string | null
          department_id: string | null
          experience_end_date: string | null
          hire_date: string | null
          id: string
          personal_data: Json | null
          professional_data: Json | null
          rg: string | null
          salary: number | null
          status: string | null
        }
        Insert: {
          candidate_id?: string | null
          cpf: string
          created_at?: string | null
          department_id?: string | null
          experience_end_date?: string | null
          hire_date?: string | null
          id?: string
          personal_data?: Json | null
          professional_data?: Json | null
          rg?: string | null
          salary?: number | null
          status?: string | null
        }
        Update: {
          candidate_id?: string | null
          cpf?: string
          created_at?: string | null
          department_id?: string | null
          experience_end_date?: string | null
          hire_date?: string | null
          id?: string
          personal_data?: Json | null
          professional_data?: Json | null
          rg?: string | null
          salary?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'employees_candidate_id_fkey'
            columns: ['candidate_id']
            isOneToOne: false
            referencedRelation: 'candidates'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'employees_department_id_fkey'
            columns: ['department_id']
            isOneToOne: false
            referencedRelation: 'departments'
            referencedColumns: ['id']
          },
        ]
      }
      experiences: {
        Row: {
          cargo: string | null
          created_at: string
          data_fim: string | null
          data_inicio: string | null
          descricao: string | null
          empresa: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          cargo?: string | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          empresa?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          cargo?: string | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          empresa?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'experiences_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      historico_leads: {
        Row: {
          contato_nome: string | null
          data_criacao: string | null
          detalhes: string | null
          forma_contato: string | null
          id: string
          lead_id: string | null
          usuario_id: string | null
        }
        Insert: {
          contato_nome?: string | null
          data_criacao?: string | null
          detalhes?: string | null
          forma_contato?: string | null
          id?: string
          lead_id?: string | null
          usuario_id?: string | null
        }
        Update: {
          contato_nome?: string | null
          data_criacao?: string | null
          detalhes?: string | null
          forma_contato?: string | null
          id?: string
          lead_id?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'historico_leads_lead_id_fkey'
            columns: ['lead_id']
            isOneToOne: false
            referencedRelation: 'leads'
            referencedColumns: ['id']
          },
        ]
      }
      leads: {
        Row: {
          company: string
          created_at: string
          details: string
          email: string
          empresa: string | null
          endereco: string | null
          estagio: string
          id: string
          name: string
          nome: string | null
          observacoes: string | null
          phone: string
          status_interesse: string
          telefone: string | null
          usuario_id: string | null
        }
        Insert: {
          company: string
          created_at?: string
          details: string
          email: string
          empresa?: string | null
          endereco?: string | null
          estagio?: string
          id?: string
          name: string
          nome?: string | null
          observacoes?: string | null
          phone: string
          status_interesse?: string
          telefone?: string | null
          usuario_id?: string | null
        }
        Update: {
          company?: string
          created_at?: string
          details?: string
          email?: string
          empresa?: string | null
          endereco?: string | null
          estagio?: string
          id?: string
          name?: string
          nome?: string | null
          observacoes?: string | null
          phone?: string
          status_interesse?: string
          telefone?: string | null
          usuario_id?: string | null
        }
        Relationships: []
      }
      leads_certificados: {
        Row: {
          created_at: string
          data_contato: string | null
          email: string | null
          id: string
          telefone: string | null
          tipo_certificado: string | null
        }
        Insert: {
          created_at?: string
          data_contato?: string | null
          email?: string | null
          id?: string
          telefone?: string | null
          tipo_certificado?: string | null
        }
        Update: {
          created_at?: string
          data_contato?: string | null
          email?: string | null
          id?: string
          telefone?: string | null
          tipo_certificado?: string | null
        }
        Relationships: []
      }
      leads_erp: {
        Row: {
          created_at: string
          data_contato: string | null
          email: string | null
          empresa: string | null
          id: string
          telefone: string | null
        }
        Insert: {
          created_at?: string
          data_contato?: string | null
          email?: string | null
          empresa?: string | null
          id?: string
          telefone?: string | null
        }
        Update: {
          created_at?: string
          data_contato?: string | null
          email?: string | null
          empresa?: string | null
          id?: string
          telefone?: string | null
        }
        Relationships: []
      }
      leads_parceiros: {
        Row: {
          data_criacao: string | null
          email: string | null
          id: string
          nome: string
          profissao: string | null
          telefone: string | null
        }
        Insert: {
          data_criacao?: string | null
          email?: string | null
          id?: string
          nome: string
          profissao?: string | null
          telefone?: string | null
        }
        Update: {
          data_criacao?: string | null
          email?: string | null
          id?: string
          nome?: string
          profissao?: string | null
          telefone?: string | null
        }
        Relationships: []
      }
      logs_auditoria: {
        Row: {
          acao: string
          dados_anteriores: Json | null
          dados_novos: Json | null
          data_criacao: string | null
          demanda_id: string | null
          detalhes: string | null
          id: string
          usuario_id: string | null
        }
        Insert: {
          acao: string
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          data_criacao?: string | null
          demanda_id?: string | null
          detalhes?: string | null
          id?: string
          usuario_id?: string | null
        }
        Update: {
          acao?: string
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          data_criacao?: string | null
          demanda_id?: string | null
          detalhes?: string | null
          id?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'logs_auditoria_demanda_id_fkey'
            columns: ['demanda_id']
            isOneToOne: false
            referencedRelation: 'demandas'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'logs_auditoria_usuario_id_fkey'
            columns: ['usuario_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      mapeamento_demandas_responsaveis: {
        Row: {
          data_criacao: string | null
          descricao: string | null
          id: string
          responsavel_id: string | null
          tipo_demanda: string
        }
        Insert: {
          data_criacao?: string | null
          descricao?: string | null
          id?: string
          responsavel_id?: string | null
          tipo_demanda: string
        }
        Update: {
          data_criacao?: string | null
          descricao?: string | null
          id?: string
          responsavel_id?: string | null
          tipo_demanda?: string
        }
        Relationships: []
      }
      midia_demanda: {
        Row: {
          analise_conteudo: string | null
          data_upload: string | null
          demanda_id: string | null
          id: string
          tipo_midia: string | null
          transcricao: string | null
          url_arquivo: string | null
        }
        Insert: {
          analise_conteudo?: string | null
          data_upload?: string | null
          demanda_id?: string | null
          id?: string
          tipo_midia?: string | null
          transcricao?: string | null
          url_arquivo?: string | null
        }
        Update: {
          analise_conteudo?: string | null
          data_upload?: string | null
          demanda_id?: string | null
          id?: string
          tipo_midia?: string | null
          transcricao?: string | null
          url_arquivo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'midia_demanda_demanda_id_fkey'
            columns: ['demanda_id']
            isOneToOne: false
            referencedRelation: 'demandas'
            referencedColumns: ['id']
          },
        ]
      }
      notificacoes: {
        Row: {
          data_criacao: string | null
          demanda_id: string | null
          id: string
          lida: boolean | null
          mensagem: string
          referencia_id: string | null
          tipo: string | null
          titulo: string
          usuario_id: string | null
        }
        Insert: {
          data_criacao?: string | null
          demanda_id?: string | null
          id?: string
          lida?: boolean | null
          mensagem: string
          referencia_id?: string | null
          tipo?: string | null
          titulo: string
          usuario_id?: string | null
        }
        Update: {
          data_criacao?: string | null
          demanda_id?: string | null
          id?: string
          lida?: boolean | null
          mensagem?: string
          referencia_id?: string | null
          tipo?: string | null
          titulo?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'notificacoes_demanda_id_fkey'
            columns: ['demanda_id']
            isOneToOne: false
            referencedRelation: 'demandas'
            referencedColumns: ['id']
          },
        ]
      }
      parceiros_certificados: {
        Row: {
          data_criacao: string | null
          id: string
          nome: string
        }
        Insert: {
          data_criacao?: string | null
          id?: string
          nome: string
        }
        Update: {
          data_criacao?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      ponto_configuracoes: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      protocolos_certificados: {
        Row: {
          cliente: string
          data_criacao: string | null
          id: string
          numero: string
          parceiro: string
          tipo: string
          usuario_id: string | null
        }
        Insert: {
          cliente: string
          data_criacao?: string | null
          id?: string
          numero: string
          parceiro?: string
          tipo: string
          usuario_id?: string | null
        }
        Update: {
          cliente?: string
          data_criacao?: string | null
          id?: string
          numero?: string
          parceiro?: string
          tipo?: string
          usuario_id?: string | null
        }
        Relationships: []
      }
      rescisao_checklist: {
        Row: {
          arquivo_url: string | null
          colaborador_id: string
          created_at: string
          empresa_id: string
          id: string
          item: string
          status: string
        }
        Insert: {
          arquivo_url?: string | null
          colaborador_id: string
          created_at?: string
          empresa_id: string
          id?: string
          item: string
          status?: string
        }
        Update: {
          arquivo_url?: string | null
          colaborador_id?: string
          created_at?: string
          empresa_id?: string
          id?: string
          item?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: 'rescisao_checklist_colaborador_id_fkey'
            columns: ['colaborador_id']
            isOneToOne: false
            referencedRelation: 'colaboradores'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'rescisao_checklist_empresa_id_fkey'
            columns: ['empresa_id']
            isOneToOne: false
            referencedRelation: 'clientes_externos'
            referencedColumns: ['id']
          },
        ]
      }
      sst_documents: {
        Row: {
          arquivo_url: string | null
          categoria: string
          created_at: string
          data_emissao: string | null
          data_validade: string | null
          empresa_id: string
          id: string
        }
        Insert: {
          arquivo_url?: string | null
          categoria: string
          created_at?: string
          data_emissao?: string | null
          data_validade?: string | null
          empresa_id: string
          id?: string
        }
        Update: {
          arquivo_url?: string | null
          categoria?: string
          created_at?: string
          data_emissao?: string | null
          data_validade?: string | null
          empresa_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'sst_documents_empresa_id_fkey'
            columns: ['empresa_id']
            isOneToOne: false
            referencedRelation: 'clientes_externos'
            referencedColumns: ['id']
          },
        ]
      }
      sync_logs: {
        Row: {
          attempts: number | null
          created_at: string
          entity_id: string
          entity_type: string
          error_message: string | null
          id: string
          status: string
          updated_at: string
        }
        Insert: {
          attempts?: number | null
          created_at?: string
          entity_id: string
          entity_type: string
          error_message?: string | null
          id?: string
          status: string
          updated_at?: string
        }
        Update: {
          attempts?: number | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          error_message?: string | null
          id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_integrations: {
        Row: {
          created_at: string | null
          evolution_api_key: string | null
          evolution_api_url: string | null
          id: string
          instance_name: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          evolution_api_key?: string | null
          evolution_api_url?: string | null
          id?: string
          instance_name: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          evolution_api_key?: string | null
          evolution_api_url?: string | null
          id?: string
          instance_name?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          data_nascimento: string | null
          email: string
          endereco: string | null
          foto_url: string | null
          id: string
          nome: string
          telefone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_nascimento?: string | null
          email: string
          endereco?: string | null
          foto_url?: string | null
          id?: string
          nome: string
          telefone: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_nascimento?: string | null
          email?: string
          endereco?: string | null
          foto_url?: string | null
          id?: string
          nome?: string
          telefone?: string
          updated_at?: string
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          ativo: boolean | null
          data_criacao: string | null
          email: string
          id: string
          nome: string
          perfil: string | null
          telefone: string | null
        }
        Insert: {
          ativo?: boolean | null
          data_criacao?: string | null
          email: string
          id: string
          nome: string
          perfil?: string | null
          telefone?: string | null
        }
        Update: {
          ativo?: boolean | null
          data_criacao?: string | null
          email?: string
          id?: string
          nome?: string
          perfil?: string | null
          telefone?: string | null
        }
        Relationships: []
      }
      whatsapp_clicks: {
        Row: {
          created_at: string
          id: string
          message: string | null
          phone_number: string
          source: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          phone_number: string
          source: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          phone_number?: string
          source?: string
        }
        Relationships: []
      }
      whatsapp_contacts: {
        Row: {
          created_at: string | null
          id: string
          instance_id: string | null
          is_archived: boolean | null
          is_blocked: boolean | null
          is_group: boolean | null
          is_online: boolean | null
          is_pinned: boolean | null
          last_message_at: string | null
          last_message_from_me: boolean | null
          last_message_status: string | null
          last_message_text: string | null
          last_message_type: string | null
          last_seen: string | null
          phone_number: string | null
          pipeline_stage: string | null
          profile_pic_url: string | null
          push_name: string | null
          remote_jid: string
          sync_error_message: string | null
          sync_status: string | null
          unread_count: number | null
          updated_at: string | null
          user_id: string | null
          verified_name: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          instance_id?: string | null
          is_archived?: boolean | null
          is_blocked?: boolean | null
          is_group?: boolean | null
          is_online?: boolean | null
          is_pinned?: boolean | null
          last_message_at?: string | null
          last_message_from_me?: boolean | null
          last_message_status?: string | null
          last_message_text?: string | null
          last_message_type?: string | null
          last_seen?: string | null
          phone_number?: string | null
          pipeline_stage?: string | null
          profile_pic_url?: string | null
          push_name?: string | null
          remote_jid: string
          sync_error_message?: string | null
          sync_status?: string | null
          unread_count?: number | null
          updated_at?: string | null
          user_id?: string | null
          verified_name?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          instance_id?: string | null
          is_archived?: boolean | null
          is_blocked?: boolean | null
          is_group?: boolean | null
          is_online?: boolean | null
          is_pinned?: boolean | null
          last_message_at?: string | null
          last_message_from_me?: boolean | null
          last_message_status?: string | null
          last_message_text?: string | null
          last_message_type?: string | null
          last_seen?: string | null
          phone_number?: string | null
          pipeline_stage?: string | null
          profile_pic_url?: string | null
          push_name?: string | null
          remote_jid?: string
          sync_error_message?: string | null
          sync_status?: string | null
          unread_count?: number | null
          updated_at?: string | null
          user_id?: string | null
          verified_name?: string | null
        }
        Relationships: []
      }
      whatsapp_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          instance_name: string
          payload: Json
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          instance_name: string
          payload: Json
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          instance_name?: string
          payload?: Json
        }
        Relationships: []
      }
      whatsapp_instances: {
        Row: {
          config: Json | null
          connection_error: string | null
          contacts_synced: number | null
          created_at: string | null
          id: string
          instance_id: string
          instance_name: string | null
          last_activity: string | null
          last_sync: string | null
          messages_synced: number | null
          phone_number: string | null
          status: string | null
          sync_status: string | null
          updated_at: string | null
          user_id: string | null
          webhook_failure_count: number | null
          webhook_last_success: string | null
          webhook_status: string | null
          webhook_url: string | null
        }
        Insert: {
          config?: Json | null
          connection_error?: string | null
          contacts_synced?: number | null
          created_at?: string | null
          id?: string
          instance_id: string
          instance_name?: string | null
          last_activity?: string | null
          last_sync?: string | null
          messages_synced?: number | null
          phone_number?: string | null
          status?: string | null
          sync_status?: string | null
          updated_at?: string | null
          user_id?: string | null
          webhook_failure_count?: number | null
          webhook_last_success?: string | null
          webhook_status?: string | null
          webhook_url?: string | null
        }
        Update: {
          config?: Json | null
          connection_error?: string | null
          contacts_synced?: number | null
          created_at?: string | null
          id?: string
          instance_id?: string
          instance_name?: string | null
          last_activity?: string | null
          last_sync?: string | null
          messages_synced?: number | null
          phone_number?: string | null
          status?: string | null
          sync_status?: string | null
          updated_at?: string | null
          user_id?: string | null
          webhook_failure_count?: number | null
          webhook_last_success?: string | null
          webhook_status?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      whatsapp_messages: {
        Row: {
          contact_id: string | null
          correlation_id: string | null
          created_at: string | null
          delivered_at: string | null
          error_message: string | null
          from_me: boolean | null
          id: string
          instance_id: string | null
          is_read: boolean | null
          media_description: string | null
          media_type: string | null
          media_url: string | null
          message_id: string
          raw: Json | null
          read_at: string | null
          status: string | null
          text: string | null
          timestamp: string | null
          transcription: string | null
          transcription_completed_at: string | null
          transcription_error: string | null
          transcription_status: string | null
          type: string | null
          uazapi_message_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          contact_id?: string | null
          correlation_id?: string | null
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          from_me?: boolean | null
          id?: string
          instance_id?: string | null
          is_read?: boolean | null
          media_description?: string | null
          media_type?: string | null
          media_url?: string | null
          message_id: string
          raw?: Json | null
          read_at?: string | null
          status?: string | null
          text?: string | null
          timestamp?: string | null
          transcription?: string | null
          transcription_completed_at?: string | null
          transcription_error?: string | null
          transcription_status?: string | null
          type?: string | null
          uazapi_message_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          contact_id?: string | null
          correlation_id?: string | null
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          from_me?: boolean | null
          id?: string
          instance_id?: string | null
          is_read?: boolean | null
          media_description?: string | null
          media_type?: string | null
          media_url?: string | null
          message_id?: string
          raw?: Json | null
          read_at?: string | null
          status?: string | null
          text?: string | null
          timestamp?: string | null
          transcription?: string | null
          transcription_completed_at?: string | null
          transcription_error?: string | null
          transcription_status?: string | null
          type?: string | null
          uazapi_message_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'whatsapp_messages_contact_id_fkey'
            columns: ['contact_id']
            isOneToOne: false
            referencedRelation: 'whatsapp_contacts'
            referencedColumns: ['id']
          },
        ]
      }
      whatsapp_webhooks: {
        Row: {
          enabled: boolean | null
          events: Json | null
          id: string
          instance_id: string | null
          url: string
        }
        Insert: {
          enabled?: boolean | null
          events?: Json | null
          id: string
          instance_id?: string | null
          url: string
        }
        Update: {
          enabled?: boolean | null
          events?: Json | null
          id?: string
          instance_id?: string | null
          url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_demand_with_event: {
        Args: {
          p_anexos: Json
          p_checklist: Json
          p_cliente_id: string
          p_create_event: boolean
          p_data_vencimento: string
          p_descricao: string
          p_event_data_fim: string
          p_event_data_inicio: string
          p_event_descricao: string
          p_event_tipo: string
          p_event_titulo: string
          p_prioridade: string
          p_responsavel_id: string
          p_status: string
          p_tipo_demanda: string
          p_titulo: string
          p_usuario_id: string
        }
        Returns: Json
      }
      fn_mark_chat_read: { Args: { p_contact_id: string }; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
