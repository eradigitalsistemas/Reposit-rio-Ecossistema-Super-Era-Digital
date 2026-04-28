// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      agenda_eventos: {
        Row: {
          data_criacao: string | null
          data_fim: string
          data_inicio: string
          descricao: string | null
          id: string
          privado: boolean | null
          tipo: string | null
          titulo: string
          usuario_id: string | null
        }
        Insert: {
          data_criacao?: string | null
          data_fim: string
          data_inicio: string
          descricao?: string | null
          id?: string
          privado?: boolean | null
          tipo?: string | null
          titulo: string
          usuario_id?: string | null
        }
        Update: {
          data_criacao?: string | null
          data_fim?: string
          data_inicio?: string
          descricao?: string | null
          id?: string
          privado?: boolean | null
          tipo?: string | null
          titulo?: string
          usuario_id?: string | null
        }
        Relationships: []
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
          id: string
          nome: string
          telefone: string | null
        }
        Insert: {
          cnpj?: string | null
          data_criacao?: string | null
          documentos?: Json | null
          email?: string | null
          empresa?: string | null
          id?: string
          nome: string
          telefone?: string | null
        }
        Update: {
          cnpj?: string | null
          data_criacao?: string | null
          documentos?: Json | null
          email?: string | null
          empresa?: string | null
          id?: string
          nome?: string
          telefone?: string | null
        }
        Relationships: []
      }
      colaboradores: {
        Row: {
          ativo: boolean | null
          data_cadastro: string | null
          email: string
          especialidades: string[] | null
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean | null
          data_cadastro?: string | null
          email: string
          especialidades?: string[] | null
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean | null
          data_cadastro?: string | null
          email?: string
          especialidades?: string[] | null
          id?: string
          nome?: string
        }
        Relationships: []
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
            foreignKeyName: "contact_identity_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "user_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      demandas: {
        Row: {
          anexos: Json | null
          checklist: Json | null
          cliente_id: string | null
          data_atualizacao: string | null
          data_conclusao: string | null
          data_criacao: string | null
          data_resposta: string | null
          data_vencimento: string | null
          descricao: string | null
          detalhes_adicionais: string | null
          id: string
          prazo: string | null
          prioridade: string | null
          responsavel_id: string | null
          resposta: string | null
          status: string | null
          tipo_demanda: string
          titulo: string | null
          usuario_id: string | null
        }
        Insert: {
          anexos?: Json | null
          checklist?: Json | null
          cliente_id?: string | null
          data_atualizacao?: string | null
          data_conclusao?: string | null
          data_criacao?: string | null
          data_resposta?: string | null
          data_vencimento?: string | null
          descricao?: string | null
          detalhes_adicionais?: string | null
          id?: string
          prazo?: string | null
          prioridade?: string | null
          responsavel_id?: string | null
          resposta?: string | null
          status?: string | null
          tipo_demanda: string
          titulo?: string | null
          usuario_id?: string | null
        }
        Update: {
          anexos?: Json | null
          checklist?: Json | null
          cliente_id?: string | null
          data_atualizacao?: string | null
          data_conclusao?: string | null
          data_criacao?: string | null
          data_resposta?: string | null
          data_vencimento?: string | null
          descricao?: string | null
          detalhes_adicionais?: string | null
          id?: string
          prazo?: string | null
          prioridade?: string | null
          responsavel_id?: string | null
          resposta?: string | null
          status?: string | null
          tipo_demanda?: string
          titulo?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "demandas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes_externos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demandas_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
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
            foreignKeyName: "departments_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
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
            foreignKeyName: "disc_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
            foreignKeyName: "educations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
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
            foreignKeyName: "emails_sent_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
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
            foreignKeyName: "employees_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
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
            foreignKeyName: "experiences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
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
        }
        Insert: {
          contato_nome?: string | null
          data_criacao?: string | null
          detalhes?: string | null
          forma_contato?: string | null
          id?: string
          lead_id?: string | null
        }
        Update: {
          contato_nome?: string | null
          data_criacao?: string | null
          detalhes?: string | null
          forma_contato?: string | null
          id?: string
          lead_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "historico_leads_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
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
            foreignKeyName: "logs_auditoria_demanda_id_fkey"
            columns: ["demanda_id"]
            isOneToOne: false
            referencedRelation: "demandas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "logs_auditoria_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
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
            foreignKeyName: "midia_demanda_demanda_id_fkey"
            columns: ["demanda_id"]
            isOneToOne: false
            referencedRelation: "demandas"
            referencedColumns: ["id"]
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
            foreignKeyName: "notificacoes_demanda_id_fkey"
            columns: ["demanda_id"]
            isOneToOne: false
            referencedRelation: "demandas"
            referencedColumns: ["id"]
          },
        ]
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
          error_message: string | null
          from_me: boolean | null
          id: string
          instance_id: string | null
          is_read: boolean | null
          media_type: string | null
          media_url: string | null
          message_id: string
          raw: Json | null
          status: string | null
          text: string | null
          timestamp: string | null
          type: string | null
          uazapi_message_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          contact_id?: string | null
          correlation_id?: string | null
          created_at?: string | null
          error_message?: string | null
          from_me?: boolean | null
          id?: string
          instance_id?: string | null
          is_read?: boolean | null
          media_type?: string | null
          media_url?: string | null
          message_id: string
          raw?: Json | null
          status?: string | null
          text?: string | null
          timestamp?: string | null
          type?: string | null
          uazapi_message_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          contact_id?: string | null
          correlation_id?: string | null
          created_at?: string | null
          error_message?: string | null
          from_me?: boolean | null
          id?: string
          instance_id?: string | null
          is_read?: boolean | null
          media_type?: string | null
          media_url?: string | null
          message_id?: string
          raw?: Json | null
          status?: string | null
          text?: string | null
          timestamp?: string | null
          type?: string | null
          uazapi_message_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_contacts"
            referencedColumns: ["id"]
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const


// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: agenda_eventos
//   id: uuid (not null, default: gen_random_uuid())
//   titulo: text (not null)
//   descricao: text (nullable)
//   data_inicio: timestamp with time zone (not null)
//   data_fim: timestamp with time zone (not null)
//   tipo: text (nullable)
//   privado: boolean (nullable, default: false)
//   usuario_id: uuid (nullable)
//   data_criacao: timestamp with time zone (nullable, default: now())
// Table: auth_logs
//   id: uuid (not null, default: gen_random_uuid())
//   ip_address: text (nullable)
//   email: text (nullable)
//   event_type: text (nullable)
//   details: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: candidates
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   email: text (not null)
//   profession: text (nullable)
//   status: text (nullable, default: 'Novo'::text)
//   disc_result: jsonb (nullable)
//   resume_data: jsonb (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: candidatos
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   email: text (not null)
//   telefone: text (nullable)
//   formacoes: jsonb (nullable)
//   experiencias: jsonb (nullable)
//   curriculo_url: text (nullable)
//   disc_respondido: boolean (nullable, default: false)
//   disc_resultado: jsonb (nullable)
//   status: text (nullable, default: 'novo'::text)
//   origem: text (nullable, default: 'site'::text)
//   data_cadastro: timestamp without time zone (nullable, default: now())
//   data_atualizacao: timestamp without time zone (nullable, default: now())
//   empresa_id: uuid (not null, default: '00000000-0000-0000-0000-000000000000'::uuid)
// Table: certificates
//   id: uuid (not null, default: gen_random_uuid())
//   title: text (not null)
//   description: text (not null)
//   benefits: _text (not null)
//   created_at: timestamp with time zone (not null, default: timezone('utc'::text, now()))
// Table: checklist_templates
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   itens: jsonb (nullable, default: '[]'::jsonb)
//   usuario_id: uuid (nullable)
//   data_criacao: timestamp with time zone (nullable, default: now())
// Table: clientes
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   telefone: text (not null)
//   email: text (nullable)
//   empresa: text (nullable)
//   data_cadastro: timestamp without time zone (nullable, default: now())
//   ativo: boolean (nullable, default: true)
// Table: clientes_externos
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   empresa: text (nullable)
//   email: text (nullable)
//   telefone: text (nullable)
//   cnpj: text (nullable)
//   documentos: jsonb (nullable, default: '[]'::jsonb)
//   data_criacao: timestamp with time zone (nullable, default: now())
// Table: colaboradores
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   email: text (not null)
//   especialidades: _text (nullable)
//   ativo: boolean (nullable, default: true)
//   data_cadastro: timestamp without time zone (nullable, default: now())
// Table: configuracoes
//   id: uuid (not null, default: gen_random_uuid())
//   chave: text (not null)
//   valor: jsonb (nullable)
//   data_criacao: timestamp with time zone (nullable, default: now())
//   data_atualizacao: timestamp with time zone (nullable, default: now())
// Table: contact_identity
//   id: uuid (not null, default: gen_random_uuid())
//   instance_id: uuid (nullable)
//   user_id: uuid (nullable)
//   canonical_phone: text (nullable)
//   phone_jid: text (nullable)
//   lid_jid: text (nullable)
//   display_name: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: demandas
//   id: uuid (not null, default: gen_random_uuid())
//   cliente_id: uuid (nullable)
//   tipo_demanda: text (not null)
//   descricao: text (nullable)
//   prazo: text (nullable)
//   detalhes_adicionais: text (nullable)
//   status: text (nullable, default: 'pendente'::text)
//   responsavel_id: uuid (nullable)
//   data_criacao: timestamp without time zone (nullable, default: now())
//   data_atualizacao: timestamp without time zone (nullable, default: now())
//   titulo: text (nullable)
//   prioridade: text (nullable, default: 'Pode Ficar para Amanhã'::text)
//   data_vencimento: timestamp with time zone (nullable)
//   checklist: jsonb (nullable, default: '[]'::jsonb)
//   anexos: jsonb (nullable, default: '[]'::jsonb)
//   resposta: text (nullable)
//   data_resposta: timestamp with time zone (nullable)
//   data_conclusao: timestamp with time zone (nullable)
//   usuario_id: uuid (nullable)
// Table: departments
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   manager_id: uuid (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: disc_results
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (nullable)
//   tipo_perfil: text (nullable)
//   pontuacao_d: integer (nullable)
//   pontuacao_i: integer (nullable)
//   pontuacao_s: integer (nullable)
//   pontuacao_c: integer (nullable)
//   data_teste: timestamp with time zone (nullable, default: now())
//   created_at: timestamp with time zone (not null, default: now())
// Table: educations
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (nullable)
//   instituicao: text (nullable)
//   curso: text (nullable)
//   data_inicio: text (nullable)
//   data_fim: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: emails_sent
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (nullable)
//   email: text (not null)
//   status: text (not null, default: 'pending'::text)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: employees
//   id: uuid (not null, default: gen_random_uuid())
//   cpf: text (not null)
//   rg: text (nullable)
//   salary: numeric (nullable)
//   status: text (nullable, default: 'Ativo'::text)
//   hire_date: date (nullable)
//   department_id: uuid (nullable)
//   personal_data: jsonb (nullable)
//   professional_data: jsonb (nullable)
//   experience_end_date: date (nullable)
//   candidate_id: uuid (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: experiences
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (nullable)
//   empresa: text (nullable)
//   cargo: text (nullable)
//   data_inicio: text (nullable)
//   data_fim: text (nullable)
//   descricao: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: historico_leads
//   id: uuid (not null, default: gen_random_uuid())
//   lead_id: uuid (nullable)
//   contato_nome: text (nullable)
//   forma_contato: text (nullable)
//   detalhes: text (nullable)
//   data_criacao: timestamp with time zone (nullable, default: now())
// Table: leads
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   email: text (not null)
//   phone: text (not null)
//   company: text (not null)
//   details: text (not null)
//   created_at: timestamp with time zone (not null, default: timezone('utc'::text, now()))
//   estagio: text (not null, default: 'Novo Lead'::text)
//   status_interesse: text (not null, default: 'Interessado'::text)
//   endereco: text (nullable)
//   observacoes: text (nullable)
//   usuario_id: uuid (nullable)
//   nome: text (nullable)
//   telefone: text (nullable)
//   empresa: text (nullable)
// Table: leads_certificados
//   id: uuid (not null, default: gen_random_uuid())
//   email: text (nullable)
//   tipo_certificado: text (nullable)
//   telefone: text (nullable)
//   data_contato: timestamp with time zone (nullable, default: now())
//   created_at: timestamp with time zone (not null, default: now())
// Table: leads_erp
//   id: uuid (not null, default: gen_random_uuid())
//   email: text (nullable)
//   empresa: text (nullable)
//   telefone: text (nullable)
//   data_contato: timestamp with time zone (nullable, default: now())
//   created_at: timestamp with time zone (not null, default: now())
// Table: leads_parceiros
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   email: text (nullable)
//   telefone: text (nullable)
//   profissao: text (nullable)
//   data_criacao: timestamp with time zone (nullable, default: now())
// Table: logs_auditoria
//   id: uuid (not null, default: gen_random_uuid())
//   demanda_id: uuid (nullable)
//   usuario_id: uuid (nullable)
//   acao: text (not null)
//   detalhes: text (nullable)
//   dados_anteriores: jsonb (nullable)
//   dados_novos: jsonb (nullable)
//   data_criacao: timestamp with time zone (nullable, default: now())
// Table: mapeamento_demandas_responsaveis
//   id: uuid (not null, default: gen_random_uuid())
//   tipo_demanda: text (not null)
//   responsavel_id: uuid (nullable)
//   descricao: text (nullable)
//   data_criacao: timestamp without time zone (nullable, default: now())
// Table: midia_demanda
//   id: uuid (not null, default: gen_random_uuid())
//   demanda_id: uuid (nullable)
//   tipo_midia: text (nullable)
//   url_arquivo: text (nullable)
//   transcricao: text (nullable)
//   analise_conteudo: text (nullable)
//   data_upload: timestamp without time zone (nullable, default: now())
// Table: notificacoes
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (nullable)
//   titulo: text (not null)
//   mensagem: text (not null)
//   lida: boolean (nullable, default: false)
//   tipo: text (nullable)
//   referencia_id: text (nullable)
//   demanda_id: uuid (nullable)
//   data_criacao: timestamp with time zone (nullable, default: now())
// Table: ponto_configuracoes
//   id: bigint (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: sync_logs
//   id: uuid (not null, default: gen_random_uuid())
//   entity_type: text (not null)
//   entity_id: text (not null)
//   status: text (not null)
//   attempts: integer (nullable, default: 1)
//   error_message: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: user_integrations
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (nullable)
//   instance_name: text (not null)
//   evolution_api_url: text (nullable)
//   evolution_api_key: text (nullable)
//   status: text (nullable, default: 'DISCONNECTED'::text)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: users
//   id: uuid (not null, default: gen_random_uuid())
//   email: text (not null)
//   nome: text (not null)
//   telefone: text (not null)
//   data_nascimento: date (nullable)
//   foto_url: text (nullable)
//   endereco: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: usuarios
//   id: uuid (not null)
//   nome: text (not null)
//   email: text (not null)
//   perfil: text (nullable, default: 'colaborador'::text)
//   ativo: boolean (nullable, default: true)
//   telefone: text (nullable)
//   data_criacao: timestamp with time zone (nullable, default: now())
// Table: whatsapp_clicks
//   id: uuid (not null, default: gen_random_uuid())
//   phone_number: text (not null)
//   source: text (not null)
//   message: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: whatsapp_contacts
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (nullable)
//   remote_jid: text (not null)
//   phone_number: text (nullable)
//   push_name: text (nullable)
//   profile_pic_url: text (nullable)
//   last_message_at: timestamp with time zone (nullable, default: now())
//   pipeline_stage: text (nullable, default: 'Novo Lead'::text)
//   created_at: timestamp with time zone (nullable, default: now())
//   is_online: boolean (nullable, default: false)
//   last_seen: timestamp with time zone (nullable)
//   is_group: boolean (nullable, default: false)
//   verified_name: text (nullable)
//   sync_status: text (nullable, default: 'pending'::text)
//   sync_error_message: text (nullable)
//   instance_id: text (nullable)
//   updated_at: timestamp with time zone (nullable, default: now())
//   unread_count: integer (nullable, default: 0)
//   last_message_text: text (nullable)
//   last_message_type: text (nullable)
//   last_message_from_me: boolean (nullable)
//   is_archived: boolean (nullable, default: false)
//   is_pinned: boolean (nullable, default: false)
//   is_blocked: boolean (nullable, default: false)
// Table: whatsapp_events
//   id: uuid (not null, default: gen_random_uuid())
//   instance_name: text (not null)
//   event_type: text (not null)
//   payload: jsonb (not null)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: whatsapp_instances
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (nullable)
//   instance_id: text (not null)
//   instance_name: text (nullable)
//   status: text (nullable, default: 'disconnected'::text)
//   phone_number: text (nullable)
//   webhook_url: text (nullable)
//   webhook_status: text (nullable, default: 'inactive'::text)
//   webhook_last_success: timestamp with time zone (nullable)
//   webhook_failure_count: integer (nullable, default: 0)
//   last_activity: timestamp with time zone (nullable)
//   connection_error: text (nullable)
//   sync_status: text (nullable, default: 'idle'::text)
//   last_sync: timestamp with time zone (nullable)
//   messages_synced: integer (nullable, default: 0)
//   contacts_synced: integer (nullable, default: 0)
//   config: jsonb (nullable, default: '{}'::jsonb)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: whatsapp_messages
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (nullable)
//   contact_id: uuid (nullable)
//   message_id: text (not null)
//   from_me: boolean (nullable, default: false)
//   type: text (nullable, default: 'text'::text)
//   text: text (nullable)
//   raw: jsonb (nullable)
//   timestamp: timestamp with time zone (nullable, default: now())
//   created_at: timestamp with time zone (nullable, default: now())
//   status: text (nullable, default: 'pending'::text)
//   correlation_id: text (nullable)
//   media_url: text (nullable)
//   media_type: text (nullable)
//   uazapi_message_id: text (nullable)
//   is_read: boolean (nullable, default: false)
//   error_message: text (nullable)
//   updated_at: timestamp with time zone (nullable, default: now())
//   instance_id: text (nullable)
// Table: whatsapp_webhooks
//   id: text (not null)
//   instance_id: text (nullable)
//   url: text (not null)
//   events: jsonb (nullable)
//   enabled: boolean (nullable)

// --- CONSTRAINTS ---
// Table: agenda_eventos
//   PRIMARY KEY agenda_eventos_pkey: PRIMARY KEY (id)
//   FOREIGN KEY agenda_eventos_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES auth.users(id)
// Table: auth_logs
//   PRIMARY KEY auth_logs_pkey: PRIMARY KEY (id)
// Table: candidates
//   UNIQUE candidates_email_key: UNIQUE (email)
//   PRIMARY KEY candidates_pkey: PRIMARY KEY (id)
// Table: candidatos
//   PRIMARY KEY candidatos_pkey: PRIMARY KEY (id)
// Table: certificates
//   PRIMARY KEY certificates_pkey: PRIMARY KEY (id)
// Table: checklist_templates
//   PRIMARY KEY checklist_templates_pkey: PRIMARY KEY (id)
//   FOREIGN KEY checklist_templates_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE SET NULL
// Table: clientes
//   PRIMARY KEY clientes_pkey: PRIMARY KEY (id)
//   UNIQUE clientes_telefone_key: UNIQUE (telefone)
// Table: clientes_externos
//   PRIMARY KEY clientes_externos_pkey: PRIMARY KEY (id)
// Table: colaboradores
//   UNIQUE colaboradores_email_key: UNIQUE (email)
//   PRIMARY KEY colaboradores_pkey: PRIMARY KEY (id)
// Table: configuracoes
//   UNIQUE configuracoes_chave_key: UNIQUE (chave)
//   PRIMARY KEY configuracoes_pkey: PRIMARY KEY (id)
// Table: contact_identity
//   UNIQUE contact_identity_instance_id_canonical_phone_key: UNIQUE (instance_id, canonical_phone)
//   FOREIGN KEY contact_identity_instance_id_fkey: FOREIGN KEY (instance_id) REFERENCES user_integrations(id) ON DELETE CASCADE
//   PRIMARY KEY contact_identity_pkey: PRIMARY KEY (id)
//   FOREIGN KEY contact_identity_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: demandas
//   FOREIGN KEY demandas_cliente_id_fkey: FOREIGN KEY (cliente_id) REFERENCES clientes_externos(id) ON DELETE SET NULL
//   PRIMARY KEY demandas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY demandas_responsavel_id_fkey: FOREIGN KEY (responsavel_id) REFERENCES usuarios(id) ON DELETE SET NULL
// Table: departments
//   FOREIGN KEY departments_manager_id_fkey: FOREIGN KEY (manager_id) REFERENCES usuarios(id) ON DELETE SET NULL
//   PRIMARY KEY departments_pkey: PRIMARY KEY (id)
// Table: disc_results
//   PRIMARY KEY disc_results_pkey: PRIMARY KEY (id)
//   FOREIGN KEY disc_results_user_id_fkey: FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
// Table: educations
//   PRIMARY KEY educations_pkey: PRIMARY KEY (id)
//   FOREIGN KEY educations_user_id_fkey: FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
// Table: emails_sent
//   PRIMARY KEY emails_sent_pkey: PRIMARY KEY (id)
//   FOREIGN KEY emails_sent_user_id_fkey: FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
// Table: employees
//   FOREIGN KEY employees_candidate_id_fkey: FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE SET NULL
//   UNIQUE employees_cpf_key: UNIQUE (cpf)
//   FOREIGN KEY employees_department_id_fkey: FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
//   PRIMARY KEY employees_pkey: PRIMARY KEY (id)
// Table: experiences
//   PRIMARY KEY experiences_pkey: PRIMARY KEY (id)
//   FOREIGN KEY experiences_user_id_fkey: FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
// Table: historico_leads
//   FOREIGN KEY historico_leads_lead_id_fkey: FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
//   PRIMARY KEY historico_leads_pkey: PRIMARY KEY (id)
// Table: leads
//   PRIMARY KEY leads_pkey: PRIMARY KEY (id)
//   FOREIGN KEY leads_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE SET NULL
// Table: leads_certificados
//   PRIMARY KEY leads_certificados_pkey: PRIMARY KEY (id)
// Table: leads_erp
//   PRIMARY KEY leads_erp_pkey: PRIMARY KEY (id)
// Table: leads_parceiros
//   PRIMARY KEY leads_parceiros_pkey: PRIMARY KEY (id)
// Table: logs_auditoria
//   FOREIGN KEY logs_auditoria_demanda_id_fkey: FOREIGN KEY (demanda_id) REFERENCES demandas(id) ON DELETE CASCADE
//   PRIMARY KEY logs_auditoria_pkey: PRIMARY KEY (id)
//   FOREIGN KEY logs_auditoria_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
// Table: mapeamento_demandas_responsaveis
//   PRIMARY KEY mapeamento_demandas_responsaveis_pkey: PRIMARY KEY (id)
//   UNIQUE mapeamento_demandas_responsaveis_tipo_demanda_key: UNIQUE (tipo_demanda)
// Table: midia_demanda
//   FOREIGN KEY midia_demanda_demanda_id_fkey: FOREIGN KEY (demanda_id) REFERENCES demandas(id)
//   PRIMARY KEY midia_demanda_pkey: PRIMARY KEY (id)
// Table: notificacoes
//   FOREIGN KEY notificacoes_demanda_id_fkey: FOREIGN KEY (demanda_id) REFERENCES demandas(id) ON DELETE CASCADE
//   PRIMARY KEY notificacoes_pkey: PRIMARY KEY (id)
//   FOREIGN KEY notificacoes_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: ponto_configuracoes
//   PRIMARY KEY ponto_configuracoes_pkey: PRIMARY KEY (id)
// Table: sync_logs
//   PRIMARY KEY sync_logs_pkey: PRIMARY KEY (id)
// Table: user_integrations
//   UNIQUE user_integrations_instance_name_key: UNIQUE (instance_name)
//   PRIMARY KEY user_integrations_pkey: PRIMARY KEY (id)
//   FOREIGN KEY user_integrations_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: users
//   UNIQUE users_email_key: UNIQUE (email)
//   PRIMARY KEY users_pkey: PRIMARY KEY (id)
// Table: usuarios
//   UNIQUE usuarios_email_key: UNIQUE (email)
//   FOREIGN KEY usuarios_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY usuarios_pkey: PRIMARY KEY (id)
// Table: whatsapp_clicks
//   PRIMARY KEY whatsapp_clicks_pkey: PRIMARY KEY (id)
// Table: whatsapp_contacts
//   PRIMARY KEY whatsapp_contacts_pkey: PRIMARY KEY (id)
//   UNIQUE whatsapp_contacts_remote_jid_key: UNIQUE (remote_jid)
//   CHECK whatsapp_contacts_sync_status_check: CHECK ((sync_status = ANY (ARRAY['pending'::text, 'synced'::text, 'failed'::text])))
//   FOREIGN KEY whatsapp_contacts_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: whatsapp_events
//   PRIMARY KEY whatsapp_events_pkey: PRIMARY KEY (id)
// Table: whatsapp_instances
//   UNIQUE whatsapp_instances_instance_id_key: UNIQUE (instance_id)
//   PRIMARY KEY whatsapp_instances_pkey: PRIMARY KEY (id)
// Table: whatsapp_messages
//   FOREIGN KEY whatsapp_messages_contact_id_fkey: FOREIGN KEY (contact_id) REFERENCES whatsapp_contacts(id) ON DELETE CASCADE
//   UNIQUE whatsapp_messages_correlation_id_key: UNIQUE (correlation_id)
//   UNIQUE whatsapp_messages_message_id_key: UNIQUE (message_id)
//   PRIMARY KEY whatsapp_messages_pkey: PRIMARY KEY (id)
//   CHECK whatsapp_messages_status_check: CHECK (((status IS NULL) OR (status = ANY (ARRAY['pending'::text, 'sent'::text, 'delivered'::text, 'read'::text, 'played'::text, 'failed'::text, 'received'::text, ''::text]))))
//   UNIQUE whatsapp_messages_uazapi_message_id_key: UNIQUE (uazapi_message_id)
//   FOREIGN KEY whatsapp_messages_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: whatsapp_webhooks
//   PRIMARY KEY whatsapp_webhooks_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: agenda_eventos
//   Policy "allow_all_agenda_eventos" (ALL, PERMISSIVE) roles={public}
//     USING: true
// Table: auth_logs
//   Policy "allow_insert_auth_logs" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: true
// Table: candidates
//   Policy "allow_all_candidates" (ALL, PERMISSIVE) roles={public}
//     USING: true
// Table: candidatos
//   Policy "Usuários podem atualizar candidatos" (UPDATE, PERMISSIVE) roles={public}
//     USING: (empresa_id = ((auth.jwt() ->> 'empresa_id'::text))::uuid)
//   Policy "Usuários podem inserir candidatos" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: (empresa_id = ((auth.jwt() ->> 'empresa_id'::text))::uuid)
//   Policy "Usuários veem candidatos da sua empresa" (SELECT, PERMISSIVE) roles={public}
//     USING: (empresa_id = ((auth.jwt() ->> 'empresa_id'::text))::uuid)
// Table: certificates
//   Policy "Allow public select from certificates" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: checklist_templates
//   Policy "allow_all_checklist_templates" (ALL, PERMISSIVE) roles={public}
//     USING: true
// Table: clientes
//   Policy "allow_all_clientes" (ALL, PERMISSIVE) roles={public}
//     USING: true
// Table: clientes_externos
//   Policy "allow_all_clientes_externos" (ALL, PERMISSIVE) roles={public}
//     USING: true
// Table: colaboradores
//   Policy "allow_all_colaboradores" (ALL, PERMISSIVE) roles={public}
//     USING: true
// Table: configuracoes
//   Policy "allow_all_configuracoes" (ALL, PERMISSIVE) roles={public}
//     USING: true
// Table: contact_identity
//   Policy "Users can manage their own identities" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: demandas
//   Policy "allow_all_demandas" (ALL, PERMISSIVE) roles={public}
//     USING: true
// Table: departments
//   Policy "allow_all_departments" (ALL, PERMISSIVE) roles={public}
//     USING: true
// Table: disc_results
//   Policy "anon_insert_disc" (INSERT, PERMISSIVE) roles={anon,authenticated}
//     WITH CHECK: true
//   Policy "auth_read_disc" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: educations
//   Policy "anon_insert_educations" (INSERT, PERMISSIVE) roles={anon,authenticated}
//     WITH CHECK: true
//   Policy "auth_read_educations" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: emails_sent
//   Policy "anon_insert_emails_sent" (INSERT, PERMISSIVE) roles={anon,authenticated}
//     WITH CHECK: true
//   Policy "auth_read_emails_sent" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: employees
//   Policy "allow_all_employees" (ALL, PERMISSIVE) roles={public}
//     USING: true
// Table: experiences
//   Policy "anon_insert_experiences" (INSERT, PERMISSIVE) roles={anon,authenticated}
//     WITH CHECK: true
//   Policy "auth_read_experiences" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: historico_leads
//   Policy "allow_all_historico_leads" (ALL, PERMISSIVE) roles={public}
//     USING: true
// Table: leads
//   Policy "Allow public insert to leads" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: true
//   Policy "allow_all_leads" (ALL, PERMISSIVE) roles={public}
//     USING: true
// Table: leads_certificados
//   Policy "anon_insert_certificados" (INSERT, PERMISSIVE) roles={anon,authenticated}
//     WITH CHECK: true
//   Policy "auth_read_certificados" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: leads_erp
//   Policy "anon_insert_erp" (INSERT, PERMISSIVE) roles={anon,authenticated}
//     WITH CHECK: true
//   Policy "auth_read_erp" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: leads_parceiros
//   Policy "allow_all_leads_parceiros" (ALL, PERMISSIVE) roles={public}
//     USING: true
// Table: logs_auditoria
//   Policy "allow_all_logs_auditoria" (ALL, PERMISSIVE) roles={public}
//     USING: true
// Table: mapeamento_demandas_responsaveis
//   Policy "allow_all_mapeamento_demandas_responsaveis" (ALL, PERMISSIVE) roles={public}
//     USING: true
// Table: midia_demanda
//   Policy "allow_all_midia_demanda" (ALL, PERMISSIVE) roles={public}
//     USING: true
// Table: notificacoes
//   Policy "allow_all_notificacoes" (ALL, PERMISSIVE) roles={public}
//     USING: true
// Table: ponto_configuracoes
//   Policy "allow_all_ponto_configuracoes" (ALL, PERMISSIVE) roles={public}
//     USING: true
// Table: sync_logs
//   Policy "anon_insert_sync_logs" (INSERT, PERMISSIVE) roles={anon,authenticated}
//     WITH CHECK: true
//   Policy "auth_read_sync_logs" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "auth_update_sync_logs" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: user_integrations
//   Policy "Users can manage their own integrations" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: users
//   Policy "anon_insert_users" (INSERT, PERMISSIVE) roles={anon,authenticated}
//     WITH CHECK: true
//   Policy "auth_read_users" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: usuarios
//   Policy "allow_all_usuarios" (ALL, PERMISSIVE) roles={public}
//     USING: true
// Table: whatsapp_clicks
//   Policy "anon_insert_whatsapp_clicks" (INSERT, PERMISSIVE) roles={anon,authenticated}
//     WITH CHECK: true
//   Policy "auth_read_whatsapp_clicks" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: whatsapp_contacts
//   Policy "Users can manage their own whatsapp contacts" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: whatsapp_instances
//   Policy "whatsapp_instances_insert" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: true
//   Policy "whatsapp_instances_select" (SELECT, PERMISSIVE) roles={public}
//     USING: true
//   Policy "whatsapp_instances_update" (UPDATE, PERMISSIVE) roles={public}
//     USING: true
// Table: whatsapp_messages
//   Policy "Users can manage their own whatsapp messages" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true

// --- WARNING: TABLES WITH RLS ENABLED BUT NO POLICIES ---
// These tables have Row Level Security enabled but NO policies defined.
// This means ALL queries (SELECT, INSERT, UPDATE, DELETE) will return ZERO rows
// for non-superuser roles (including the anon and authenticated roles used by the app).
// You MUST create RLS policies for these tables to allow data access.
//   - whatsapp_events
//   - whatsapp_webhooks

// --- DATABASE FUNCTIONS ---
// FUNCTION fn_mark_chat_read(uuid)
//   CREATE OR REPLACE FUNCTION public.fn_mark_chat_read(p_contact_id uuid)
//    RETURNS void
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//    SET search_path TO 'public'
//   AS $function$
//   BEGIN
//     -- Zera unread_count do contato
//     UPDATE public.whatsapp_contacts
//        SET unread_count = 0,
//            updated_at   = NOW()
//      WHERE id = p_contact_id;
//   
//     -- Marca todas as mensagens recebidas como lidas
//     UPDATE public.whatsapp_messages
//        SET is_read    = true,
//            status     = CASE WHEN status IN ('sent','delivered') THEN 'read' ELSE status END,
//            updated_at = NOW()
//      WHERE contact_id = p_contact_id
//        AND COALESCE(from_me, false) = false
//        AND COALESCE(is_read, false) = false;
//   END;
//   $function$
//   
// FUNCTION fn_update_contact_on_message()
//   CREATE OR REPLACE FUNCTION public.fn_update_contact_on_message()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//    SET search_path TO 'public'
//   AS $function$
//   DECLARE
//     v_preview text;
//   BEGIN
//     -- Define o preview baseado no tipo da mensagem
//     v_preview := CASE
//       WHEN NEW.type = 'text' THEN COALESCE(NEW.text, '')
//       WHEN NEW.type = 'image' THEN '[Foto]'
//       WHEN NEW.type = 'audio' THEN '[Áudio]'
//       WHEN NEW.type = 'video' THEN '[Vídeo]'
//       WHEN NEW.type = 'document' THEN '[Documento]'
//       WHEN NEW.type = 'sticker' THEN '[Sticker]'
//       WHEN NEW.type = 'location' THEN '[Localização]'
//       WHEN NEW.type = 'contact' THEN '[Contato]'
//       ELSE COALESCE(NEW.text, '[Mensagem]')
//     END;
//   
//     -- Atualiza o contato vinculado
//     UPDATE public.whatsapp_contacts
//        SET last_message_text      = LEFT(v_preview, 500),
//            last_message_at        = NEW."timestamp",
//            last_message_type      = NEW.type,
//            last_message_from_me   = COALESCE(NEW.from_me, false),
//            unread_count           = CASE
//                                       WHEN COALESCE(NEW.from_me, false) = false
//                                       THEN COALESCE(unread_count, 0) + 1
//                                       ELSE COALESCE(unread_count, 0)
//                                     END,
//            updated_at             = NOW()
//      WHERE id = NEW.contact_id;
//   
//     RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION handle_new_auth_user()
//   CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     INSERT INTO public.usuarios (id, email, nome, perfil)
//     VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), COALESCE(NEW.raw_user_meta_data->>'perfil', 'colaborador'))
//     ON CONFLICT (id) DO NOTHING;
//     RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION rls_auto_enable()
//   CREATE OR REPLACE FUNCTION public.rls_auto_enable()
//    RETURNS event_trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//    SET search_path TO 'pg_catalog'
//   AS $function$
//   DECLARE
//     cmd record;
//   BEGIN
//     FOR cmd IN
//       SELECT *
//       FROM pg_event_trigger_ddl_commands()
//       WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
//         AND object_type IN ('table','partitioned table')
//     LOOP
//        IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
//         BEGIN
//           EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
//           RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
//         EXCEPTION
//           WHEN OTHERS THEN
//             RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
//         END;
//        ELSE
//           RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
//        END IF;
//     END LOOP;
//   END;
//   $function$
//   
// FUNCTION set_updated_at_timestamp()
//   CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//     NEW.updated_at = NOW();
//     RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION update_chats_updated_at()
//   CREATE OR REPLACE FUNCTION public.update_chats_updated_at()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//       UPDATE public.chats
//       SET updated_at = now()
//       WHERE id = NEW.chat_id;
//       RETURN NEW;
//   END;
//   $function$
//   

// --- TRIGGERS ---
// Table: emails_sent
//   set_public_emails_sent_updated_at: CREATE TRIGGER set_public_emails_sent_updated_at BEFORE UPDATE ON public.emails_sent FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp()
// Table: users
//   set_public_users_updated_at: CREATE TRIGGER set_public_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp()
// Table: whatsapp_messages
//   trg_update_contact_on_message: CREATE TRIGGER trg_update_contact_on_message AFTER INSERT ON public.whatsapp_messages FOR EACH ROW EXECUTE FUNCTION fn_update_contact_on_message()

// --- INDEXES ---
// Table: candidates
//   CREATE UNIQUE INDEX candidates_email_key ON public.candidates USING btree (email)
// Table: candidatos
//   CREATE INDEX idx_candidatos_email ON public.candidatos USING btree (email)
//   CREATE INDEX idx_candidatos_empresa ON public.candidatos USING btree (empresa_id)
//   CREATE INDEX idx_candidatos_status ON public.candidatos USING btree (status)
// Table: clientes
//   CREATE UNIQUE INDEX clientes_telefone_key ON public.clientes USING btree (telefone)
//   CREATE INDEX idx_clientes_telefone ON public.clientes USING btree (telefone)
// Table: colaboradores
//   CREATE UNIQUE INDEX colaboradores_email_key ON public.colaboradores USING btree (email)
//   CREATE INDEX idx_colaboradores_especialidades ON public.colaboradores USING gin (especialidades)
// Table: configuracoes
//   CREATE UNIQUE INDEX configuracoes_chave_key ON public.configuracoes USING btree (chave)
// Table: contact_identity
//   CREATE UNIQUE INDEX contact_identity_instance_id_canonical_phone_key ON public.contact_identity USING btree (instance_id, canonical_phone)
// Table: demandas
//   CREATE INDEX idx_demandas_cliente ON public.demandas USING btree (cliente_id)
//   CREATE INDEX idx_demandas_responsavel ON public.demandas USING btree (responsavel_id)
//   CREATE INDEX idx_demandas_tipo ON public.demandas USING btree (tipo_demanda)
// Table: emails_sent
//   CREATE INDEX idx_emails_sent_status ON public.emails_sent USING btree (status)
// Table: employees
//   CREATE UNIQUE INDEX employees_cpf_key ON public.employees USING btree (cpf)
// Table: mapeamento_demandas_responsaveis
//   CREATE UNIQUE INDEX mapeamento_demandas_responsaveis_tipo_demanda_key ON public.mapeamento_demandas_responsaveis USING btree (tipo_demanda)
// Table: midia_demanda
//   CREATE INDEX idx_midia_demanda ON public.midia_demanda USING btree (demanda_id)
// Table: user_integrations
//   CREATE UNIQUE INDEX user_integrations_instance_name_key ON public.user_integrations USING btree (instance_name)
// Table: users
//   CREATE INDEX idx_users_created_at ON public.users USING btree (created_at)
//   CREATE INDEX idx_users_email ON public.users USING btree (email)
//   CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email)
// Table: usuarios
//   CREATE UNIQUE INDEX usuarios_email_key ON public.usuarios USING btree (email)
// Table: whatsapp_contacts
//   CREATE INDEX idx_contacts_instance_lastmsg ON public.whatsapp_contacts USING btree (instance_id, last_message_at DESC)
//   CREATE INDEX idx_contacts_instance_remote ON public.whatsapp_contacts USING btree (instance_id, remote_jid)
//   CREATE INDEX idx_whatsapp_contacts_instance_id ON public.whatsapp_contacts USING btree (instance_id)
//   CREATE INDEX idx_whatsapp_contacts_is_online ON public.whatsapp_contacts USING btree (is_online)
//   CREATE INDEX idx_whatsapp_contacts_last_seen ON public.whatsapp_contacts USING btree (last_seen DESC)
//   CREATE INDEX idx_whatsapp_contacts_remote_jid ON public.whatsapp_contacts USING btree (remote_jid)
//   CREATE INDEX idx_whatsapp_contacts_user_id ON public.whatsapp_contacts USING btree (user_id)
//   CREATE UNIQUE INDEX whatsapp_contacts_remote_jid_key ON public.whatsapp_contacts USING btree (remote_jid)
// Table: whatsapp_events
//   CREATE INDEX idx_events_instance_created ON public.whatsapp_events USING btree (instance_name, created_at DESC)
// Table: whatsapp_instances
//   CREATE INDEX idx_whatsapp_instances_instance_id ON public.whatsapp_instances USING btree (instance_id)
//   CREATE INDEX idx_whatsapp_instances_status ON public.whatsapp_instances USING btree (status)
//   CREATE INDEX idx_whatsapp_instances_user_id ON public.whatsapp_instances USING btree (user_id)
//   CREATE UNIQUE INDEX whatsapp_instances_instance_id_key ON public.whatsapp_instances USING btree (instance_id)
// Table: whatsapp_messages
//   CREATE INDEX idx_messages_contact_ts ON public.whatsapp_messages USING btree (contact_id, "timestamp" DESC)
//   CREATE INDEX idx_messages_instance_ts ON public.whatsapp_messages USING btree (instance_id, "timestamp" DESC)
//   CREATE INDEX idx_messages_message_id ON public.whatsapp_messages USING btree (message_id)
//   CREATE INDEX idx_whatsapp_messages_contact_id_timestamp ON public.whatsapp_messages USING btree (contact_id, "timestamp" DESC)
//   CREATE INDEX idx_whatsapp_messages_created_at ON public.whatsapp_messages USING btree (created_at DESC)
//   CREATE INDEX idx_whatsapp_messages_is_read ON public.whatsapp_messages USING btree (is_read)
//   CREATE INDEX idx_whatsapp_messages_status ON public.whatsapp_messages USING btree (status)
//   CREATE INDEX idx_whatsapp_messages_uazapi_message_id ON public.whatsapp_messages USING btree (uazapi_message_id)
//   CREATE UNIQUE INDEX whatsapp_messages_correlation_id_key ON public.whatsapp_messages USING btree (correlation_id)
//   CREATE UNIQUE INDEX whatsapp_messages_message_id_key ON public.whatsapp_messages USING btree (message_id)
//   CREATE UNIQUE INDEX whatsapp_messages_uazapi_message_id_key ON public.whatsapp_messages USING btree (uazapi_message_id)

