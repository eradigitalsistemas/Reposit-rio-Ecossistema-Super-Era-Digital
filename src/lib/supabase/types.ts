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
          data_criacao: string
          data_fim: string
          data_inicio: string
          demanda_id: string | null
          descricao: string | null
          id: string
          lead_id: string | null
          privado: boolean
          tipo: string
          titulo: string
          usuario_id: string
        }
        Insert: {
          cliente_id?: string | null
          criado_por?: string | null
          data_criacao?: string
          data_fim: string
          data_inicio: string
          demanda_id?: string | null
          descricao?: string | null
          id?: string
          lead_id?: string | null
          privado?: boolean
          tipo?: string
          titulo: string
          usuario_id: string
        }
        Update: {
          cliente_id?: string | null
          criado_por?: string | null
          data_criacao?: string
          data_fim?: string
          data_inicio?: string
          demanda_id?: string | null
          descricao?: string | null
          id?: string
          lead_id?: string | null
          privado?: boolean
          tipo?: string
          titulo?: string
          usuario_id?: string
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
          created_at: string
          details: string | null
          email: string | null
          event_type: string
          id: string
          ip_address: string | null
        }
        Insert: {
          created_at?: string
          details?: string | null
          email?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
        }
        Update: {
          created_at?: string
          details?: string | null
          email?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
        }
        Relationships: []
      }
      candidates: {
        Row: {
          created_at: string
          disc_result: Json | null
          email: string
          id: string
          name: string
          observations: string | null
          profession: string | null
          resume_data: Json | null
          status: string
        }
        Insert: {
          created_at?: string
          disc_result?: Json | null
          email: string
          id?: string
          name: string
          observations?: string | null
          profession?: string | null
          resume_data?: Json | null
          status?: string
        }
        Update: {
          created_at?: string
          disc_result?: Json | null
          email?: string
          id?: string
          name?: string
          observations?: string | null
          profession?: string | null
          resume_data?: Json | null
          status?: string
        }
        Relationships: []
      }
      checklist_templates: {
        Row: {
          data_criacao: string
          id: string
          itens: Json
          nome: string
          usuario_id: string
        }
        Insert: {
          data_criacao?: string
          id?: string
          itens?: Json
          nome: string
          usuario_id: string
        }
        Update: {
          data_criacao?: string
          id?: string
          itens?: Json
          nome?: string
          usuario_id?: string
        }
        Relationships: []
      }
      clientes_externos: {
        Row: {
          cnpj: string | null
          data_criacao: string
          documentos: Json | null
          email: string
          empresa: string | null
          id: string
          nome: string
          telefone: string | null
        }
        Insert: {
          cnpj?: string | null
          data_criacao?: string
          documentos?: Json | null
          email: string
          empresa?: string | null
          id?: string
          nome: string
          telefone?: string | null
        }
        Update: {
          cnpj?: string | null
          data_criacao?: string
          documentos?: Json | null
          email?: string
          empresa?: string | null
          id?: string
          nome?: string
          telefone?: string | null
        }
        Relationships: []
      }
      cron_logs: {
        Row: {
          completed_at: string | null
          errors: Json | null
          id: string
          job_name: string
          records_processed: number | null
          started_at: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          errors?: Json | null
          id?: string
          job_name: string
          records_processed?: number | null
          started_at?: string
          status: string
        }
        Update: {
          completed_at?: string | null
          errors?: Json | null
          id?: string
          job_name?: string
          records_processed?: number | null
          started_at?: string
          status?: string
        }
        Relationships: []
      }
      demandas: {
        Row: {
          anexos: Json | null
          checklist: Json | null
          cliente_id: string | null
          data_atribuicao: string | null
          data_conclusao: string | null
          data_criacao: string
          data_resposta: string | null
          data_vencimento: string | null
          descricao: string | null
          id: string
          prioridade: string
          responsavel_id: string | null
          resposta: string | null
          status: string
          titulo: string
          usuario_id: string
        }
        Insert: {
          anexos?: Json | null
          checklist?: Json | null
          cliente_id?: string | null
          data_atribuicao?: string | null
          data_conclusao?: string | null
          data_criacao?: string
          data_resposta?: string | null
          data_vencimento?: string | null
          descricao?: string | null
          id?: string
          prioridade: string
          responsavel_id?: string | null
          resposta?: string | null
          status: string
          titulo: string
          usuario_id?: string
        }
        Update: {
          anexos?: Json | null
          checklist?: Json | null
          cliente_id?: string | null
          data_atribuicao?: string | null
          data_conclusao?: string | null
          data_criacao?: string
          data_resposta?: string | null
          data_vencimento?: string | null
          descricao?: string | null
          id?: string
          prioridade?: string
          responsavel_id?: string | null
          resposta?: string | null
          status?: string
          titulo?: string
          usuario_id?: string
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
      department_schedules: {
        Row: {
          created_at: string
          department_id: string
          end_time: string
          id: string
          lunch_duration_minutes: number
          organization_id: string
          start_time: string
          tolerance_minutes: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          department_id: string
          end_time: string
          id?: string
          lunch_duration_minutes: number
          organization_id: string
          start_time: string
          tolerance_minutes: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          department_id?: string
          end_time?: string
          id?: string
          lunch_duration_minutes?: number
          organization_id?: string
          start_time?: string
          tolerance_minutes?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'department_schedules_department_id_fkey'
            columns: ['department_id']
            isOneToOne: false
            referencedRelation: 'departments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'department_schedules_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          id: string
          manager_id: string | null
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          manager_id?: string | null
          name: string
        }
        Update: {
          created_at?: string
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
      documents: {
        Row: {
          created_at: string
          document_type: string
          employee_id: string
          expiration_date: string | null
          file_path: string
          id: string
          status: string
          upload_date: string
        }
        Insert: {
          created_at?: string
          document_type: string
          employee_id: string
          expiration_date?: string | null
          file_path: string
          id?: string
          status?: string
          upload_date?: string
        }
        Update: {
          created_at?: string
          document_type?: string
          employee_id?: string
          expiration_date?: string | null
          file_path?: string
          id?: string
          status?: string
          upload_date?: string
        }
        Relationships: [
          {
            foreignKeyName: 'documents_employee_id_fkey'
            columns: ['employee_id']
            isOneToOne: false
            referencedRelation: 'employees'
            referencedColumns: ['id']
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
          created_at: string
          department_id: string | null
          experience_end_date: string | null
          hire_date: string
          id: string
          personal_data: Json | null
          professional_data: Json | null
          rg: string | null
          salary: number | null
          status: string
          updated_at: string
        }
        Insert: {
          candidate_id?: string | null
          cpf: string
          created_at?: string
          department_id?: string | null
          experience_end_date?: string | null
          hire_date: string
          id?: string
          personal_data?: Json | null
          professional_data?: Json | null
          rg?: string | null
          salary?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          candidate_id?: string | null
          cpf?: string
          created_at?: string
          department_id?: string | null
          experience_end_date?: string | null
          hire_date?: string
          id?: string
          personal_data?: Json | null
          professional_data?: Json | null
          rg?: string | null
          salary?: number | null
          status?: string
          updated_at?: string
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
          contato_nome: string
          data_criacao: string
          detalhes: string
          forma_contato: string
          id: string
          lead_id: string
          usuario_id: string
        }
        Insert: {
          contato_nome: string
          data_criacao?: string
          detalhes: string
          forma_contato: string
          id?: string
          lead_id: string
          usuario_id?: string
        }
        Update: {
          contato_nome?: string
          data_criacao?: string
          detalhes?: string
          forma_contato?: string
          id?: string
          lead_id?: string
          usuario_id?: string
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
          data_criacao: string
          email: string
          empresa: string | null
          endereco: string | null
          estagio: string
          id: string
          nome: string
          observacoes: string | null
          status_interesse: string
          telefone: string | null
          usuario_id: string
        }
        Insert: {
          data_criacao?: string
          email: string
          empresa?: string | null
          endereco?: string | null
          estagio: string
          id?: string
          nome: string
          observacoes?: string | null
          status_interesse?: string
          telefone?: string | null
          usuario_id?: string
        }
        Update: {
          data_criacao?: string
          email?: string
          empresa?: string | null
          endereco?: string | null
          estagio?: string
          id?: string
          nome?: string
          observacoes?: string | null
          status_interesse?: string
          telefone?: string | null
          usuario_id?: string
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
      logs_auditoria: {
        Row: {
          acao: string
          dados_anteriores: Json | null
          dados_novos: Json | null
          data_criacao: string
          demanda_id: string | null
          detalhes: string | null
          id: string
          usuario_id: string | null
        }
        Insert: {
          acao: string
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          data_criacao?: string
          demanda_id?: string | null
          detalhes?: string | null
          id?: string
          usuario_id?: string | null
        }
        Update: {
          acao?: string
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          data_criacao?: string
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
      monthly_timesheets: {
        Row: {
          days_worked: number
          employee_id: string
          generated_at: string
          generated_by: string | null
          id: string
          month: number
          organization_id: string
          total_absences: number
          total_delays_minutes: number
          total_extra_hours: number
          total_hours_worked: number
          year: number
        }
        Insert: {
          days_worked?: number
          employee_id: string
          generated_at?: string
          generated_by?: string | null
          id?: string
          month: number
          organization_id: string
          total_absences?: number
          total_delays_minutes?: number
          total_extra_hours?: number
          total_hours_worked?: number
          year: number
        }
        Update: {
          days_worked?: number
          employee_id?: string
          generated_at?: string
          generated_by?: string | null
          id?: string
          month?: number
          organization_id?: string
          total_absences?: number
          total_delays_minutes?: number
          total_extra_hours?: number
          total_hours_worked?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: 'monthly_timesheets_employee_id_fkey'
            columns: ['employee_id']
            isOneToOne: false
            referencedRelation: 'employees'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'monthly_timesheets_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      notificacoes: {
        Row: {
          data_criacao: string
          demanda_id: string | null
          id: string
          lida: boolean
          mensagem: string
          referencia_id: string | null
          tipo: string | null
          titulo: string
          usuario_id: string
        }
        Insert: {
          data_criacao?: string
          demanda_id?: string | null
          id?: string
          lida?: boolean
          mensagem: string
          referencia_id?: string | null
          tipo?: string | null
          titulo: string
          usuario_id: string
        }
        Update: {
          data_criacao?: string
          demanda_id?: string | null
          id?: string
          lida?: boolean
          mensagem?: string
          referencia_id?: string | null
          tipo?: string | null
          titulo?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'notificacoes_demanda_id_fkey'
            columns: ['demanda_id']
            isOneToOne: false
            referencedRelation: 'demandas'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'notificacoes_usuario_id_fkey'
            columns: ['usuario_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      onboarding_checklist: {
        Row: {
          assigned_to: string | null
          completed: boolean
          completed_at: string | null
          created_at: string
          employee_id: string
          id: string
          task_id: string | null
          task_name: string
        }
        Insert: {
          assigned_to?: string | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          employee_id: string
          id?: string
          task_id?: string | null
          task_name: string
        }
        Update: {
          assigned_to?: string | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          employee_id?: string
          id?: string
          task_id?: string | null
          task_name?: string
        }
        Relationships: [
          {
            foreignKeyName: 'onboarding_checklist_assigned_to_fkey'
            columns: ['assigned_to']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'onboarding_checklist_employee_id_fkey'
            columns: ['employee_id']
            isOneToOne: false
            referencedRelation: 'employees'
            referencedColumns: ['id']
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          created_at: string
          id: string
          subscription_data: Json
          usuario_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          subscription_data: Json
          usuario_id: string
        }
        Update: {
          created_at?: string
          id?: string
          subscription_data?: Json
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'push_subscriptions_usuario_id_fkey'
            columns: ['usuario_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
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
      time_entries: {
        Row: {
          created_at: string
          created_by: string | null
          employee_id: string
          entry_date: string
          entry_type: string
          id: string
          notes: string | null
          organization_id: string
          timestamp: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          employee_id: string
          entry_date: string
          entry_type: string
          id?: string
          notes?: string | null
          organization_id: string
          timestamp: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          employee_id?: string
          entry_date?: string
          entry_type?: string
          id?: string
          notes?: string | null
          organization_id?: string
          timestamp?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'time_entries_employee_id_fkey'
            columns: ['employee_id']
            isOneToOne: false
            referencedRelation: 'employees'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'time_entries_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      time_entries_audit: {
        Row: {
          action: string
          changed_at: string
          changed_by: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          organization_id: string
          time_entry_id: string
        }
        Insert: {
          action: string
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          organization_id: string
          time_entry_id: string
        }
        Update: {
          action?: string
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string
          time_entry_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'time_entries_audit_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'time_entries_audit_time_entry_id_fkey'
            columns: ['time_entry_id']
            isOneToOne: false
            referencedRelation: 'time_entries'
            referencedColumns: ['id']
          },
        ]
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
          ativo: boolean
          data_criacao: string
          email: string
          id: string
          nome: string
          perfil: string
          telefone: string | null
        }
        Insert: {
          ativo?: boolean
          data_criacao?: string
          email: string
          id: string
          nome?: string
          perfil?: string
          telefone?: string | null
        }
        Update: {
          ativo?: boolean
          data_criacao?: string
          email?: string
          id?: string
          nome?: string
          perfil?: string
          telefone?: string | null
        }
        Relationships: []
      }
      vacation_balance: {
        Row: {
          created_at: string
          days_accrued: number
          days_remaining: number
          days_used: number
          employee_id: string
          expiration_date: string | null
          id: string
          year: number
        }
        Insert: {
          created_at?: string
          days_accrued?: number
          days_remaining?: number
          days_used?: number
          employee_id: string
          expiration_date?: string | null
          id?: string
          year: number
        }
        Update: {
          created_at?: string
          days_accrued?: number
          days_remaining?: number
          days_used?: number
          employee_id?: string
          expiration_date?: string | null
          id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: 'vacation_balance_employee_id_fkey'
            columns: ['employee_id']
            isOneToOne: false
            referencedRelation: 'employees'
            referencedColumns: ['id']
          },
        ]
      }
      vacation_requests: {
        Row: {
          approval_date: string | null
          approved_by: string | null
          created_at: string
          employee_id: string
          end_date: string
          id: string
          start_date: string
          status: string
          type: string
        }
        Insert: {
          approval_date?: string | null
          approved_by?: string | null
          created_at?: string
          employee_id: string
          end_date: string
          id?: string
          start_date: string
          status?: string
          type?: string
        }
        Update: {
          approval_date?: string | null
          approved_by?: string | null
          created_at?: string
          employee_id?: string
          end_date?: string
          id?: string
          start_date?: string
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: 'vacation_requests_approved_by_fkey'
            columns: ['approved_by']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'vacation_requests_employee_id_fkey'
            columns: ['employee_id']
            isOneToOne: false
            referencedRelation: 'employees'
            referencedColumns: ['id']
          },
        ]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_tolerance: {
        Args: { p_delay_minutes: number; p_tolerance_minutes: number }
        Returns: Json
      }
      calculate_daily_hours: {
        Args: {
          p_date: string
          p_employee_id: string
          p_organization_id: string
        }
        Returns: Json
      }
      calculate_monthly_totals: {
        Args: {
          p_employee_id: string
          p_month: number
          p_organization_id: string
          p_year: number
        }
        Returns: Json
      }
      get_employee_schedule: {
        Args: { p_employee_id: string; p_organization_id: string }
        Returns: Json
      }
      get_user_employee_id: { Args: never; Returns: string }
      get_user_org_id: { Args: never; Returns: string }
      get_user_role: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      validate_time_entry_sequence: {
        Args: {
          p_date: string
          p_employee_id: string
          p_new_entry_type: string
          p_new_timestamp: string
          p_organization_id: string
        }
        Returns: Json
      }
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
//   usuario_id: uuid (not null)
//   titulo: text (not null)
//   descricao: text (nullable)
//   data_inicio: timestamp with time zone (not null)
//   data_fim: timestamp with time zone (not null)
//   tipo: text (not null, default: 'Evento'::text)
//   privado: boolean (not null, default: false)
//   data_criacao: timestamp with time zone (not null, default: now())
//   cliente_id: uuid (nullable)
//   criado_por: text (nullable)
//   lead_id: uuid (nullable)
//   demanda_id: uuid (nullable)
// Table: auth_logs
//   id: uuid (not null, default: gen_random_uuid())
//   ip_address: text (nullable)
//   email: text (nullable)
//   event_type: text (not null)
//   details: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: candidates
//   id: uuid (not null, default: gen_random_uuid())
//   email: text (not null)
//   name: text (not null)
//   resume_data: jsonb (nullable, default: '{}'::jsonb)
//   disc_result: jsonb (nullable, default: '{}'::jsonb)
//   status: text (not null, default: 'Novo'::text)
//   created_at: timestamp with time zone (not null, default: now())
//   observations: text (nullable, default: ''::text)
//   profession: text (nullable, default: ''::text)
// Table: checklist_templates
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   itens: jsonb (not null, default: '[]'::jsonb)
//   usuario_id: uuid (not null)
//   data_criacao: timestamp with time zone (not null, default: now())
// Table: clientes_externos
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   empresa: text (nullable)
//   email: text (not null)
//   telefone: text (nullable)
//   cnpj: text (nullable)
//   data_criacao: timestamp with time zone (not null, default: now())
//   documentos: jsonb (nullable, default: '[]'::jsonb)
// Table: cron_logs
//   id: uuid (not null, default: gen_random_uuid())
//   job_name: text (not null)
//   status: text (not null)
//   records_processed: integer (nullable, default: 0)
//   errors: jsonb (nullable, default: '[]'::jsonb)
//   started_at: timestamp with time zone (not null, default: now())
//   completed_at: timestamp with time zone (nullable)
// Table: demandas
//   id: uuid (not null, default: gen_random_uuid())
//   titulo: text (not null)
//   descricao: text (nullable)
//   prioridade: text (not null)
//   status: text (not null)
//   data_criacao: timestamp with time zone (not null, default: now())
//   data_vencimento: timestamp with time zone (nullable)
//   usuario_id: uuid (not null, default: auth.uid())
//   responsavel_id: uuid (nullable)
//   resposta: text (nullable)
//   data_resposta: timestamp with time zone (nullable)
//   anexos: jsonb (nullable, default: '[]'::jsonb)
//   checklist: jsonb (nullable, default: '[]'::jsonb)
//   cliente_id: uuid (nullable)
//   data_atribuicao: timestamp with time zone (nullable)
//   data_conclusao: timestamp with time zone (nullable)
// Table: department_schedules
//   id: uuid (not null, default: gen_random_uuid())
//   organization_id: uuid (not null)
//   department_id: uuid (not null)
//   start_time: time without time zone (not null)
//   end_time: time without time zone (not null)
//   lunch_duration_minutes: integer (not null)
//   tolerance_minutes: integer (not null)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: departments
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   manager_id: uuid (nullable)
//   created_at: timestamp with time zone (not null, default: now())
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
// Table: documents
//   id: uuid (not null, default: gen_random_uuid())
//   employee_id: uuid (not null)
//   document_type: text (not null)
//   file_path: text (not null)
//   upload_date: timestamp with time zone (not null, default: now())
//   expiration_date: date (nullable)
//   status: text (not null, default: 'Válido'::text)
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
//   candidate_id: uuid (nullable)
//   cpf: text (not null)
//   rg: text (nullable)
//   personal_data: jsonb (nullable, default: '{}'::jsonb)
//   professional_data: jsonb (nullable, default: '{}'::jsonb)
//   salary: numeric (nullable)
//   department_id: uuid (nullable)
//   status: text (not null, default: 'Ativo'::text)
//   hire_date: date (not null)
//   experience_end_date: date (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
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
//   lead_id: uuid (not null)
//   usuario_id: uuid (not null, default: auth.uid())
//   contato_nome: text (not null)
//   forma_contato: text (not null)
//   detalhes: text (not null)
//   data_criacao: timestamp with time zone (not null, default: now())
// Table: leads
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   email: text (not null)
//   telefone: text (nullable)
//   empresa: text (nullable)
//   estagio: text (not null)
//   data_criacao: timestamp with time zone (not null, default: now())
//   usuario_id: uuid (not null, default: auth.uid())
//   observacoes: text (nullable, default: ''::text)
//   status_interesse: text (not null, default: 'Interessado'::text)
//   endereco: text (nullable)
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
// Table: logs_auditoria
//   id: uuid (not null, default: gen_random_uuid())
//   demanda_id: uuid (nullable)
//   usuario_id: uuid (nullable)
//   acao: text (not null)
//   detalhes: text (nullable)
//   dados_anteriores: jsonb (nullable)
//   dados_novos: jsonb (nullable)
//   data_criacao: timestamp with time zone (not null, default: now())
// Table: monthly_timesheets
//   id: uuid (not null, default: gen_random_uuid())
//   organization_id: uuid (not null)
//   employee_id: uuid (not null)
//   year: integer (not null)
//   month: integer (not null)
//   total_hours_worked: numeric (not null, default: 0)
//   total_extra_hours: numeric (not null, default: 0)
//   total_delays_minutes: integer (not null, default: 0)
//   total_absences: integer (not null, default: 0)
//   days_worked: integer (not null, default: 0)
//   generated_at: timestamp with time zone (not null, default: now())
//   generated_by: uuid (nullable)
// Table: notificacoes
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   titulo: text (not null)
//   mensagem: text (not null)
//   lida: boolean (not null, default: false)
//   demanda_id: uuid (nullable)
//   data_criacao: timestamp with time zone (not null, default: now())
//   tipo: text (nullable, default: 'info'::text)
//   referencia_id: text (nullable)
// Table: onboarding_checklist
//   id: uuid (not null, default: gen_random_uuid())
//   employee_id: uuid (not null)
//   task_id: text (nullable)
//   task_name: text (not null)
//   completed: boolean (not null, default: false)
//   completed_at: timestamp with time zone (nullable)
//   assigned_to: uuid (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: organizations
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: push_subscriptions
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   subscription_data: jsonb (not null)
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
// Table: time_entries
//   id: uuid (not null, default: gen_random_uuid())
//   organization_id: uuid (not null)
//   employee_id: uuid (not null)
//   entry_date: date (not null)
//   entry_type: text (not null)
//   timestamp: timestamp with time zone (not null)
//   notes: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   created_by: uuid (nullable)
// Table: time_entries_audit
//   id: uuid (not null, default: gen_random_uuid())
//   time_entry_id: uuid (not null)
//   organization_id: uuid (not null)
//   action: text (not null)
//   old_values: jsonb (nullable)
//   new_values: jsonb (nullable)
//   changed_by: uuid (nullable)
//   changed_at: timestamp with time zone (not null, default: now())
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
//   nome: text (not null, default: ''::text)
//   email: text (not null)
//   data_criacao: timestamp with time zone (not null, default: now())
//   perfil: text (not null, default: 'colaborador'::text)
//   ativo: boolean (not null, default: true)
//   telefone: text (nullable)
// Table: vacation_balance
//   id: uuid (not null, default: gen_random_uuid())
//   employee_id: uuid (not null)
//   year: integer (not null)
//   days_accrued: numeric (not null, default: 0)
//   days_used: numeric (not null, default: 0)
//   days_remaining: numeric (not null, default: 0)
//   expiration_date: date (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: vacation_requests
//   id: uuid (not null, default: gen_random_uuid())
//   employee_id: uuid (not null)
//   start_date: date (not null)
//   end_date: date (not null)
//   status: text (not null, default: 'Pendente'::text)
//   approved_by: uuid (nullable)
//   approval_date: timestamp with time zone (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   type: text (not null, default: 'Gozar'::text)
// Table: whatsapp_clicks
//   id: uuid (not null, default: gen_random_uuid())
//   phone_number: text (not null)
//   source: text (not null)
//   message: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())

// --- CONSTRAINTS ---
// Table: agenda_eventos
//   FOREIGN KEY agenda_eventos_cliente_id_fkey: FOREIGN KEY (cliente_id) REFERENCES clientes_externos(id) ON DELETE SET NULL
//   FOREIGN KEY agenda_eventos_demanda_id_fkey: FOREIGN KEY (demanda_id) REFERENCES demandas(id) ON DELETE CASCADE
//   FOREIGN KEY agenda_eventos_lead_id_fkey: FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
//   PRIMARY KEY agenda_eventos_pkey: PRIMARY KEY (id)
//   FOREIGN KEY agenda_eventos_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: auth_logs
//   PRIMARY KEY auth_logs_pkey: PRIMARY KEY (id)
// Table: candidates
//   UNIQUE candidates_email_key: UNIQUE (email)
//   PRIMARY KEY candidates_pkey: PRIMARY KEY (id)
// Table: checklist_templates
//   PRIMARY KEY checklist_templates_pkey: PRIMARY KEY (id)
//   FOREIGN KEY checklist_templates_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: clientes_externos
//   PRIMARY KEY clientes_externos_pkey: PRIMARY KEY (id)
// Table: cron_logs
//   PRIMARY KEY cron_logs_pkey: PRIMARY KEY (id)
// Table: demandas
//   FOREIGN KEY demandas_cliente_id_fkey: FOREIGN KEY (cliente_id) REFERENCES clientes_externos(id) ON DELETE SET NULL
//   PRIMARY KEY demandas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY demandas_responsavel_id_fkey: FOREIGN KEY (responsavel_id) REFERENCES usuarios(id) ON DELETE SET NULL
//   FOREIGN KEY demandas_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: department_schedules
//   CHECK check_lunch_duration: CHECK ((lunch_duration_minutes > 0))
//   CHECK check_start_end_time: CHECK ((start_time < end_time))
//   CHECK check_tolerance: CHECK ((tolerance_minutes >= 0))
//   FOREIGN KEY department_schedules_department_id_fkey: FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
//   FOREIGN KEY department_schedules_organization_id_fkey: FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
//   PRIMARY KEY department_schedules_pkey: PRIMARY KEY (id)
//   UNIQUE unique_org_dept_schedule: UNIQUE (organization_id, department_id)
// Table: departments
//   FOREIGN KEY departments_manager_id_fkey: FOREIGN KEY (manager_id) REFERENCES usuarios(id) ON DELETE SET NULL
//   PRIMARY KEY departments_pkey: PRIMARY KEY (id)
// Table: disc_results
//   PRIMARY KEY disc_results_pkey: PRIMARY KEY (id)
//   FOREIGN KEY disc_results_user_id_fkey: FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
// Table: documents
//   FOREIGN KEY documents_employee_id_fkey: FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
//   PRIMARY KEY documents_pkey: PRIMARY KEY (id)
// Table: educations
//   PRIMARY KEY educations_pkey: PRIMARY KEY (id)
//   FOREIGN KEY educations_user_id_fkey: FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
// Table: emails_sent
//   PRIMARY KEY emails_sent_pkey: PRIMARY KEY (id)
//   FOREIGN KEY emails_sent_user_id_fkey: FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
// Table: employees
//   CHECK check_experience_date: CHECK (((experience_end_date IS NULL) OR (experience_end_date >= hire_date)))
//   FOREIGN KEY employees_candidate_id_fkey: FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE SET NULL
//   UNIQUE employees_cpf_key: UNIQUE (cpf)
//   FOREIGN KEY employees_department_id_fkey: FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
//   PRIMARY KEY employees_pkey: PRIMARY KEY (id)
//   UNIQUE employees_rg_key: UNIQUE (rg)
// Table: experiences
//   PRIMARY KEY experiences_pkey: PRIMARY KEY (id)
//   FOREIGN KEY experiences_user_id_fkey: FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
// Table: historico_leads
//   FOREIGN KEY historico_leads_lead_id_fkey: FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
//   PRIMARY KEY historico_leads_pkey: PRIMARY KEY (id)
//   FOREIGN KEY historico_leads_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: leads
//   PRIMARY KEY leads_pkey: PRIMARY KEY (id)
//   FOREIGN KEY leads_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: leads_certificados
//   PRIMARY KEY leads_certificados_pkey: PRIMARY KEY (id)
// Table: leads_erp
//   PRIMARY KEY leads_erp_pkey: PRIMARY KEY (id)
// Table: logs_auditoria
//   FOREIGN KEY logs_auditoria_demanda_id_fkey: FOREIGN KEY (demanda_id) REFERENCES demandas(id) ON DELETE SET NULL
//   PRIMARY KEY logs_auditoria_pkey: PRIMARY KEY (id)
//   FOREIGN KEY logs_auditoria_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
// Table: monthly_timesheets
//   CHECK check_month: CHECK (((month >= 1) AND (month <= 12)))
//   CHECK check_year: CHECK ((year >= 2020))
//   FOREIGN KEY monthly_timesheets_employee_id_fkey: FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
//   FOREIGN KEY monthly_timesheets_generated_by_fkey: FOREIGN KEY (generated_by) REFERENCES auth.users(id) ON DELETE SET NULL
//   FOREIGN KEY monthly_timesheets_organization_id_fkey: FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
//   PRIMARY KEY monthly_timesheets_pkey: PRIMARY KEY (id)
//   UNIQUE unique_org_emp_year_month: UNIQUE (organization_id, employee_id, year, month)
// Table: notificacoes
//   FOREIGN KEY notificacoes_demanda_id_fkey: FOREIGN KEY (demanda_id) REFERENCES demandas(id) ON DELETE CASCADE
//   PRIMARY KEY notificacoes_pkey: PRIMARY KEY (id)
//   FOREIGN KEY notificacoes_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
//   UNIQUE unq_notificacoes_usuario_ref: UNIQUE (usuario_id, referencia_id)
// Table: onboarding_checklist
//   FOREIGN KEY onboarding_checklist_assigned_to_fkey: FOREIGN KEY (assigned_to) REFERENCES usuarios(id) ON DELETE SET NULL
//   FOREIGN KEY onboarding_checklist_employee_id_fkey: FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
//   PRIMARY KEY onboarding_checklist_pkey: PRIMARY KEY (id)
// Table: organizations
//   PRIMARY KEY organizations_pkey: PRIMARY KEY (id)
// Table: push_subscriptions
//   PRIMARY KEY push_subscriptions_pkey: PRIMARY KEY (id)
//   FOREIGN KEY push_subscriptions_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: sync_logs
//   PRIMARY KEY sync_logs_pkey: PRIMARY KEY (id)
// Table: time_entries
//   FOREIGN KEY time_entries_created_by_fkey: FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL
//   FOREIGN KEY time_entries_employee_id_fkey: FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
//   CHECK time_entries_entry_type_check: CHECK ((entry_type = ANY (ARRAY['entrada'::text, 'intervalo_saida'::text, 'intervalo_entrada'::text, 'saida'::text])))
//   FOREIGN KEY time_entries_organization_id_fkey: FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
//   PRIMARY KEY time_entries_pkey: PRIMARY KEY (id)
//   UNIQUE unique_daily_entry_type: UNIQUE (organization_id, employee_id, entry_date, entry_type)
// Table: time_entries_audit
//   CHECK time_entries_audit_action_check: CHECK ((action = ANY (ARRAY['created'::text, 'updated'::text, 'deleted'::text])))
//   FOREIGN KEY time_entries_audit_changed_by_fkey: FOREIGN KEY (changed_by) REFERENCES auth.users(id) ON DELETE SET NULL
//   FOREIGN KEY time_entries_audit_organization_id_fkey: FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
//   PRIMARY KEY time_entries_audit_pkey: PRIMARY KEY (id)
//   FOREIGN KEY time_entries_audit_time_entry_id_fkey: FOREIGN KEY (time_entry_id) REFERENCES time_entries(id) ON DELETE CASCADE
// Table: users
//   UNIQUE users_email_key: UNIQUE (email)
//   PRIMARY KEY users_pkey: PRIMARY KEY (id)
// Table: usuarios
//   FOREIGN KEY usuarios_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY usuarios_pkey: PRIMARY KEY (id)
// Table: vacation_balance
//   CHECK check_positive_balance: CHECK ((days_remaining >= (0)::numeric))
//   FOREIGN KEY vacation_balance_employee_id_fkey: FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
//   PRIMARY KEY vacation_balance_pkey: PRIMARY KEY (id)
// Table: vacation_requests
//   CHECK check_vacation_dates: CHECK ((end_date >= start_date))
//   FOREIGN KEY vacation_requests_approved_by_fkey: FOREIGN KEY (approved_by) REFERENCES usuarios(id) ON DELETE SET NULL
//   FOREIGN KEY vacation_requests_employee_id_fkey: FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
//   PRIMARY KEY vacation_requests_pkey: PRIMARY KEY (id)
// Table: whatsapp_clicks
//   PRIMARY KEY whatsapp_clicks_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: agenda_eventos
//   Policy "agenda_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//   Policy "agenda_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (usuario_id = auth.uid())
//   Policy "agenda_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((usuario_id = auth.uid()) OR ((privado = false) AND is_admin()))
//   Policy "agenda_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
// Table: auth_logs
//   Policy "auth_logs_admin_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: is_admin()
//   Policy "auth_logs_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
// Table: candidates
//   Policy "auth_all_candidates" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: checklist_templates
//   Policy "Todos podem ver templates" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Usuarios deletam proprios templates" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = usuario_id)
//   Policy "Usuarios gerenciam proprios templates" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = usuario_id)
//     WITH CHECK: (auth.uid() = usuario_id)
//   Policy "Usuarios podem inserir templates" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (auth.uid() = usuario_id)
// Table: clientes_externos
//   Policy "Admins_gerenciam_clientes_externos" (ALL, PERMISSIVE) roles={authenticated}
//     USING: is_admin()
//     WITH CHECK: is_admin()
// Table: cron_logs
//   Policy "auth_read_cron_logs" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: demandas
//   Policy "Admins podem gerenciar tudo em demandas" (ALL, PERMISSIVE) roles={authenticated}
//     USING: is_admin()
//     WITH CHECK: is_admin()
//   Policy "Colaboradores atualizam demandas" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: ((auth.uid() = responsavel_id) OR (auth.uid() = usuario_id) OR is_admin())
//     WITH CHECK: true
//   Policy "Colaboradores deletam demandas" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: ((auth.uid() = responsavel_id) OR (auth.uid() = usuario_id) OR is_admin())
//   Policy "Colaboradores inserem demandas" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Colaboradores veem proprias demandas" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((auth.uid() = responsavel_id) OR is_admin())
// Table: department_schedules
//   Policy "department_schedules_delete_policy" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: ((organization_id = get_user_org_id()) AND (get_user_role() = ANY (ARRAY['admin'::text, 'rh'::text])))
//   Policy "department_schedules_insert_policy" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: ((organization_id = get_user_org_id()) AND (get_user_role() = ANY (ARRAY['admin'::text, 'rh'::text])))
//   Policy "department_schedules_select_policy" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (organization_id = get_user_org_id())
//   Policy "department_schedules_update_policy" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: ((organization_id = get_user_org_id()) AND (get_user_role() = ANY (ARRAY['admin'::text, 'rh'::text])))
//     WITH CHECK: ((organization_id = get_user_org_id()) AND (get_user_role() = ANY (ARRAY['admin'::text, 'rh'::text])))
// Table: departments
//   Policy "auth_all_departments" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: disc_results
//   Policy "anon_insert_disc" (INSERT, PERMISSIVE) roles={anon,authenticated}
//     WITH CHECK: true
//   Policy "auth_read_disc" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: documents
//   Policy "auth_all_documents" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
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
//   Policy "auth_all_employees" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: experiences
//   Policy "anon_insert_experiences" (INSERT, PERMISSIVE) roles={anon,authenticated}
//     WITH CHECK: true
//   Policy "auth_read_experiences" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: historico_leads
//   Policy "Admins podem gerenciar tudo em historico_leads" (ALL, PERMISSIVE) roles={authenticated}
//     USING: is_admin()
//     WITH CHECK: is_admin()
//   Policy "Usuarios gerenciam interacoes de seus leads" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM leads l   WHERE ((l.id = historico_leads.lead_id) AND (l.usuario_id = auth.uid()))))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM leads l   WHERE ((l.id = historico_leads.lead_id) AND (l.usuario_id = auth.uid()))))
// Table: leads
//   Policy "Admins podem gerenciar tudo em leads" (ALL, PERMISSIVE) roles={authenticated}
//     USING: is_admin()
//     WITH CHECK: is_admin()
//   Policy "Usuarios gerenciam proprios leads" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = usuario_id)
//     WITH CHECK: (auth.uid() = usuario_id)
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
// Table: logs_auditoria
//   Policy "Admins podem ver logs_auditoria" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: is_admin()
//   Policy "Colaboradores podem inserir logs_auditoria" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (auth.uid() = usuario_id)
//   Policy "Usuarios podem ver logs_auditoria" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: monthly_timesheets
//   Policy "monthly_timesheets_delete_policy" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: ((organization_id = get_user_org_id()) AND (get_user_role() = ANY (ARRAY['admin'::text, 'rh'::text])))
//   Policy "monthly_timesheets_insert_policy" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: ((organization_id = get_user_org_id()) AND (get_user_role() = ANY (ARRAY['admin'::text, 'rh'::text])))
//   Policy "monthly_timesheets_select_policy" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((organization_id = get_user_org_id()) AND ((employee_id = get_user_employee_id()) OR (get_user_role() = ANY (ARRAY['admin'::text, 'rh'::text])) OR ((get_user_role() = 'gestor'::text) AND (employee_id IN ( SELECT employees.id    FROM employees   WHERE (employees.department_id IN ( SELECT departments.id            FROM departments           WHERE (departments.manager_id = auth.uid()))))))))
//   Policy "monthly_timesheets_update_policy" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: ((organization_id = get_user_org_id()) AND (get_user_role() = ANY (ARRAY['admin'::text, 'rh'::text])))
//     WITH CHECK: ((organization_id = get_user_org_id()) AND (get_user_role() = ANY (ARRAY['admin'::text, 'rh'::text])))
// Table: notificacoes
//   Policy "Sistema pode inserir notificacoes" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Usuarios podem atualizar proprias notificacoes" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = usuario_id)
//     WITH CHECK: (auth.uid() = usuario_id)
//   Policy "Usuarios podem ver proprias notificacoes" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = usuario_id)
// Table: onboarding_checklist
//   Policy "auth_all_onboarding_checklist" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: organizations
//   Policy "auth_all_organizations" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: push_subscriptions
//   Policy "Enable delete for authenticated users" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = usuario_id)
//   Policy "Enable insert for authenticated users" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (auth.uid() = usuario_id)
//   Policy "Enable select for authenticated users" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = usuario_id)
// Table: sync_logs
//   Policy "anon_insert_sync_logs" (INSERT, PERMISSIVE) roles={anon,authenticated}
//     WITH CHECK: true
//   Policy "auth_read_sync_logs" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "auth_update_sync_logs" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: time_entries
//   Policy "time_entries_delete_policy" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: ((organization_id = get_user_org_id()) AND (get_user_role() = ANY (ARRAY['admin'::text, 'rh'::text])))
//   Policy "time_entries_insert_policy" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: ((organization_id = get_user_org_id()) AND (((employee_id = get_user_employee_id()) AND (created_by = auth.uid())) OR (get_user_role() = ANY (ARRAY['admin'::text, 'rh'::text]))))
//   Policy "time_entries_select_policy" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((organization_id = get_user_org_id()) AND ((employee_id = get_user_employee_id()) OR (created_by = auth.uid()) OR (get_user_role() = ANY (ARRAY['admin'::text, 'rh'::text])) OR ((get_user_role() = 'gestor'::text) AND (employee_id IN ( SELECT employees.id    FROM employees   WHERE (employees.department_id IN ( SELECT departments.id            FROM departments           WHERE (departments.manager_id = auth.uid()))))))))
//   Policy "time_entries_update_policy" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: ((organization_id = get_user_org_id()) AND (get_user_role() = ANY (ARRAY['admin'::text, 'rh'::text])))
//     WITH CHECK: ((organization_id = get_user_org_id()) AND (get_user_role() = ANY (ARRAY['admin'::text, 'rh'::text])))
// Table: time_entries_audit
//   Policy "time_entries_audit_delete_policy" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: false
//   Policy "time_entries_audit_insert_policy" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: false
//   Policy "time_entries_audit_select_policy" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((organization_id = get_user_org_id()) AND (get_user_role() = ANY (ARRAY['admin'::text, 'rh'::text])))
//   Policy "time_entries_audit_update_policy" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: false
//     WITH CHECK: false
// Table: users
//   Policy "anon_insert_users" (INSERT, PERMISSIVE) roles={anon,authenticated}
//     WITH CHECK: true
//   Policy "auth_read_users" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: usuarios
//   Policy "Admins podem atualizar usuarios" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: is_admin()
//     WITH CHECK: is_admin()
//   Policy "Admins podem deletar usuarios" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: is_admin()
//   Policy "Usuarios podem atualizar o proprio perfil" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = id)
//     WITH CHECK: (auth.uid() = id)
//   Policy "Usuarios podem ver perfis" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: vacation_balance
//   Policy "auth_all_vacation_balance" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: vacation_requests
//   Policy "auth_all_vacation_requests" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: whatsapp_clicks
//   Policy "anon_insert_whatsapp_clicks" (INSERT, PERMISSIVE) roles={anon,authenticated}
//     WITH CHECK: true
//   Policy "auth_read_whatsapp_clicks" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true

// --- DATABASE FUNCTIONS ---
// FUNCTION apply_tolerance(integer, integer)
//   CREATE OR REPLACE FUNCTION public.apply_tolerance(p_delay_minutes integer, p_tolerance_minutes integer)
//    RETURNS jsonb
//    LANGUAGE plpgsql
//   AS $function$
//   DECLARE
//     v_final_delay INT;
//   BEGIN
//     IF p_delay_minutes <= p_tolerance_minutes THEN
//       v_final_delay := 0;
//     ELSE
//       v_final_delay := p_delay_minutes - p_tolerance_minutes;
//     END IF;
//
//     RETURN jsonb_build_object(
//       'original_delay', p_delay_minutes,
//       'tolerance', p_tolerance_minutes,
//       'final_delay', v_final_delay
//     );
//   END;
//   $function$
//
// FUNCTION audit_time_entries()
//   CREATE OR REPLACE FUNCTION public.audit_time_entries()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//       v_user_id UUID;
//   BEGIN
//       BEGIN
//           v_user_id := auth.uid();
//       EXCEPTION WHEN OTHERS THEN
//           v_user_id := NULL;
//       END;
//
//       IF TG_OP = 'INSERT' THEN
//           INSERT INTO public.time_entries_audit (time_entry_id, organization_id, action, new_values, changed_by)
//           VALUES (NEW.id, NEW.organization_id, 'created', to_jsonb(NEW), COALESCE(NEW.created_by, v_user_id));
//           RETURN NEW;
//       ELSIF TG_OP = 'UPDATE' THEN
//           INSERT INTO public.time_entries_audit (time_entry_id, organization_id, action, old_values, new_values, changed_by)
//           VALUES (NEW.id, NEW.organization_id, 'updated', to_jsonb(OLD), to_jsonb(NEW), v_user_id);
//           RETURN NEW;
//       ELSIF TG_OP = 'DELETE' THEN
//           INSERT INTO public.time_entries_audit (time_entry_id, organization_id, action, old_values, changed_by)
//           VALUES (OLD.id, OLD.organization_id, 'deleted', to_jsonb(OLD), v_user_id);
//           RETURN OLD;
//       END IF;
//       RETURN NULL;
//   END;
//   $function$
//
// FUNCTION calculate_daily_hours(uuid, uuid, date)
//   CREATE OR REPLACE FUNCTION public.calculate_daily_hours(p_organization_id uuid, p_employee_id uuid, p_date date)
//    RETURNS jsonb
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_schedule jsonb;
//     v_start_time TIME;
//     v_end_time TIME;
//     v_lunch_duration INT;
//     v_tolerance INT;
//
//     v_entrada TIMESTAMP WITH TIME ZONE;
//     v_int_saida TIMESTAMP WITH TIME ZONE;
//     v_int_entrada TIMESTAMP WITH TIME ZONE;
//     v_saida TIMESTAMP WITH TIME ZONE;
//
//     v_worked_minutes INT := 0;
//     v_extra_minutes INT := 0;
//     v_delay_minutes INT := 0;
//     v_status TEXT := 'incompleto';
//     v_notes TEXT := '';
//
//     v_expected_worked_minutes INT;
//   BEGIN
//     -- 1. Obter horários
//     v_schedule := public.get_employee_schedule(p_organization_id, p_employee_id);
//     v_start_time := (v_schedule->>'start_time')::time;
//     v_end_time := (v_schedule->>'end_time')::time;
//     v_lunch_duration := (v_schedule->>'lunch_duration_minutes')::int;
//     v_tolerance := (v_schedule->>'tolerance_minutes')::int;
//
//     v_expected_worked_minutes := EXTRACT(EPOCH FROM (v_end_time - v_start_time))/60 - v_lunch_duration;
//
//     -- 2. Buscar registros do dia
//     SELECT timestamp INTO v_entrada
//     FROM public.time_entries
//     WHERE organization_id = p_organization_id AND employee_id = p_employee_id AND entry_date = p_date AND entry_type = 'entrada'
//     ORDER BY timestamp ASC LIMIT 1;
//
//     SELECT timestamp INTO v_int_saida
//     FROM public.time_entries
//     WHERE organization_id = p_organization_id AND employee_id = p_employee_id AND entry_date = p_date AND entry_type = 'intervalo_saida'
//     ORDER BY timestamp ASC LIMIT 1;
//
//     SELECT timestamp INTO v_int_entrada
//     FROM public.time_entries
//     WHERE organization_id = p_organization_id AND employee_id = p_employee_id AND entry_date = p_date AND entry_type = 'intervalo_entrada'
//     ORDER BY timestamp ASC LIMIT 1;
//
//     SELECT timestamp INTO v_saida
//     FROM public.time_entries
//     WHERE organization_id = p_organization_id AND employee_id = p_employee_id AND entry_date = p_date AND entry_type = 'saida'
//     ORDER BY timestamp ASC LIMIT 1;
//
//     IF v_entrada IS NULL THEN
//       RETURN jsonb_build_object(
//         'date', p_date,
//         'worked_hours', 0,
//         'extra_hours', 0,
//         'delay_minutes', 0,
//         'status', 'falta',
//         'notes', 'Sem registro de entrada'
//       );
//     END IF;
//
//     -- 3. Calcular atraso
//     IF (v_entrada AT TIME ZONE 'America/Sao_Paulo')::time > v_start_time THEN
//       v_delay_minutes := EXTRACT(EPOCH FROM ((v_entrada AT TIME ZONE 'America/Sao_Paulo')::time - v_start_time))/60;
//       v_delay_minutes := (public.apply_tolerance(v_delay_minutes, v_tolerance)->>'final_delay')::int;
//     END IF;
//
//     -- 4. Calcular tempo trabalhado e horas extras
//     IF v_saida IS NOT NULL THEN
//       v_status := 'completo';
//       v_worked_minutes := EXTRACT(EPOCH FROM (v_saida - v_entrada))/60;
//
//       IF v_int_saida IS NOT NULL AND v_int_entrada IS NOT NULL THEN
//         v_worked_minutes := v_worked_minutes - EXTRACT(EPOCH FROM (v_int_entrada - v_int_saida))/60;
//       ELSE
//         -- Deduzir duração padrão do intervalo se não registrado
//         v_worked_minutes := GREATEST(0, v_worked_minutes - v_lunch_duration);
//       END IF;
//
//       IF v_worked_minutes > v_expected_worked_minutes THEN
//         v_extra_minutes := v_worked_minutes - v_expected_worked_minutes;
//       END IF;
//
//       IF v_delay_minutes = 0 AND v_extra_minutes > 0 THEN
//         v_notes := 'Sem atraso, ' || v_extra_minutes || 'min extras';
//       ELSIF v_delay_minutes = 0 THEN
//         v_notes := 'Sem atraso';
//       ELSE
//         v_notes := 'Atraso de ' || v_delay_minutes || 'min';
//       END IF;
//     ELSE
//       v_status := 'incompleto';
//       v_notes := 'Falta registro de saída';
//       -- Calcular tempo parcial até o momento
//       v_worked_minutes := EXTRACT(EPOCH FROM (COALESCE(v_int_saida, NOW()) - v_entrada))/60;
//     END IF;
//
//     RETURN jsonb_build_object(
//       'date', p_date,
//       'entry_time', TO_CHAR(v_entrada AT TIME ZONE 'America/Sao_Paulo', 'HH24:MI'),
//       'exit_time', CASE WHEN v_saida IS NOT NULL THEN TO_CHAR(v_saida AT TIME ZONE 'America/Sao_Paulo', 'HH24:MI') ELSE null END,
//       'worked_hours', ROUND((v_worked_minutes::numeric / 60.0), 2),
//       'extra_hours', ROUND((v_extra_minutes::numeric / 60.0), 2),
//       'delay_minutes', v_delay_minutes,
//       'status', v_status,
//       'notes', v_notes
//     );
//   END;
//   $function$
//
// FUNCTION calculate_monthly_totals(uuid, uuid, integer, integer)
//   CREATE OR REPLACE FUNCTION public.calculate_monthly_totals(p_organization_id uuid, p_employee_id uuid, p_year integer, p_month integer)
//    RETURNS jsonb
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_start_date DATE;
//     v_end_date DATE;
//     v_current_date DATE;
//     v_daily_result jsonb;
//
//     v_total_hours_worked NUMERIC := 0;
//     v_total_extra_hours NUMERIC := 0;
//     v_total_delays_minutes INT := 0;
//     v_days_worked INT := 0;
//     v_absences INT := 0;
//   BEGIN
//     v_start_date := MAKE_DATE(p_year, p_month, 1);
//     v_end_date := v_start_date + INTERVAL '1 month' - INTERVAL '1 day';
//     v_current_date := v_start_date;
//
//     WHILE v_current_date <= v_end_date AND v_current_date <= CURRENT_DATE LOOP
//       IF EXTRACT(ISODOW FROM v_current_date) < 6 THEN
//          -- Dia da semana
//          v_daily_result := public.calculate_daily_hours(p_organization_id, p_employee_id, v_current_date);
//
//          IF v_daily_result->>'status' = 'falta' THEN
//            v_absences := v_absences + 1;
//          ELSE
//            v_days_worked := v_days_worked + 1;
//            v_total_hours_worked := v_total_hours_worked + (v_daily_result->>'worked_hours')::numeric;
//            v_total_extra_hours := v_total_extra_hours + (v_daily_result->>'extra_hours')::numeric;
//            v_total_delays_minutes := v_total_delays_minutes + (v_daily_result->>'delay_minutes')::int;
//          END IF;
//       ELSE
//          -- Fim de semana
//          v_daily_result := public.calculate_daily_hours(p_organization_id, p_employee_id, v_current_date);
//          IF v_daily_result->>'status' != 'falta' THEN
//            v_days_worked := v_days_worked + 1;
//            v_total_hours_worked := v_total_hours_worked + (v_daily_result->>'worked_hours')::numeric;
//            v_total_extra_hours := v_total_extra_hours + (v_daily_result->>'extra_hours')::numeric;
//            v_total_delays_minutes := v_total_delays_minutes + (v_daily_result->>'delay_minutes')::int;
//          END IF;
//       END IF;
//
//       v_current_date := v_current_date + INTERVAL '1 day';
//     END LOOP;
//
//     INSERT INTO public.monthly_timesheets (
//       organization_id, employee_id, year, month,
//       total_hours_worked, total_extra_hours, total_delays_minutes, total_absences, days_worked, generated_at
//     ) VALUES (
//       p_organization_id, p_employee_id, p_year, p_month,
//       v_total_hours_worked, v_total_extra_hours, v_total_delays_minutes, v_absences, v_days_worked, NOW()
//     )
//     ON CONFLICT (organization_id, employee_id, year, month)
//     DO UPDATE SET
//       total_hours_worked = EXCLUDED.total_hours_worked,
//       total_extra_hours = EXCLUDED.total_extra_hours,
//       total_delays_minutes = EXCLUDED.total_delays_minutes,
//       total_absences = EXCLUDED.total_absences,
//       days_worked = EXCLUDED.days_worked,
//       generated_at = EXCLUDED.generated_at;
//
//     RETURN jsonb_build_object(
//       'employee_id', p_employee_id,
//       'year', p_year,
//       'month', p_month,
//       'total_hours_worked', v_total_hours_worked,
//       'total_extra_hours', v_total_extra_hours,
//       'total_delays_minutes', v_total_delays_minutes,
//       'days_worked', v_days_worked,
//       'absences', v_absences,
//       'status', 'generated'
//     );
//   END;
//   $function$
//
// FUNCTION check_duplicate_entry()
//   CREATE OR REPLACE FUNCTION public.check_duplicate_entry()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//     IF EXISTS (
//       SELECT 1 FROM public.time_entries
//       WHERE organization_id = NEW.organization_id
//       AND employee_id = NEW.employee_id
//       AND entry_date = NEW.entry_date
//       AND entry_type = NEW.entry_type
//       AND id != NEW.id
//     ) THEN
//       RAISE EXCEPTION 'DUPLICATE_ENTRY: Já existe um registro de % para esta data.', NEW.entry_type;
//     END IF;
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION check_entry_sequence()
//   CREATE OR REPLACE FUNCTION public.check_entry_sequence()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   DECLARE
//     v_last_entry RECORD;
//     v_expected_type VARCHAR;
//   BEGIN
//     SELECT * INTO v_last_entry
//     FROM public.time_entries
//     WHERE organization_id = NEW.organization_id
//     AND employee_id = NEW.employee_id
//     AND entry_date = NEW.entry_date
//     AND id != NEW.id
//     AND timestamp < NEW.timestamp
//     ORDER BY timestamp DESC
//     LIMIT 1;
//
//     IF v_last_entry IS NULL THEN
//       IF NEW.entry_type != 'entrada' THEN
//         RAISE EXCEPTION 'SEQUENCE_ERROR: O primeiro registro do dia deve ser uma entrada.';
//       END IF;
//     ELSE
//       CASE v_last_entry.entry_type
//         WHEN 'entrada' THEN
//           v_expected_type := 'intervalo_saida';
//         WHEN 'intervalo_saida' THEN
//           v_expected_type := 'intervalo_entrada';
//         WHEN 'intervalo_entrada' THEN
//           v_expected_type := 'saida';
//         WHEN 'saida' THEN
//           RAISE EXCEPTION 'SEQUENCE_ERROR: O dia já foi encerrado. Não é possível adicionar mais registros.';
//       END CASE;
//
//       IF NEW.entry_type != v_expected_type THEN
//         -- Permitir saída direta após entrada (trabalho sem intervalo)
//         IF NEW.entry_type = 'saida' AND v_last_entry.entry_type = 'entrada' THEN
//            -- OK
//         ELSE
//            RAISE EXCEPTION 'SEQUENCE_ERROR: Sequência inválida. Esperado %, recebido %.', v_expected_type, NEW.entry_type;
//         END IF;
//       END IF;
//     END IF;
//
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION fix_auth_users_nulls()
//   CREATE OR REPLACE FUNCTION public.fix_auth_users_nulls()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     IF NEW.confirmation_token IS NULL THEN NEW.confirmation_token := ''; END IF;
//     IF NEW.recovery_token IS NULL THEN NEW.recovery_token := ''; END IF;
//     IF NEW.email_change_token_new IS NULL THEN NEW.email_change_token_new := ''; END IF;
//     IF NEW.email_change IS NULL THEN NEW.email_change := ''; END IF;
//     IF NEW.email_change_token_current IS NULL THEN NEW.email_change_token_current := ''; END IF;
//     IF NEW.phone_change IS NULL THEN NEW.phone_change := ''; END IF;
//     IF NEW.phone_change_token IS NULL THEN NEW.phone_change_token := ''; END IF;
//     IF NEW.reauthentication_token IS NULL THEN NEW.reauthentication_token := ''; END IF;
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION get_employee_schedule(uuid, uuid)
//   CREATE OR REPLACE FUNCTION public.get_employee_schedule(p_organization_id uuid, p_employee_id uuid)
//    RETURNS jsonb
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_department_id UUID;
//     v_schedule RECORD;
//   BEGIN
//     SELECT department_id INTO v_department_id
//     FROM public.employees
//     WHERE id = p_employee_id;
//
//     SELECT start_time, end_time, lunch_duration_minutes, tolerance_minutes
//     INTO v_schedule
//     FROM public.department_schedules
//     WHERE organization_id = p_organization_id AND department_id = v_department_id
//     LIMIT 1;
//
//     IF NOT FOUND THEN
//       -- Default schedule se não configurado (8h as 17h, 1h almoço, 5min tolerância)
//       RETURN jsonb_build_object(
//         'start_time', '08:00:00'::time,
//         'end_time', '17:00:00'::time,
//         'lunch_duration_minutes', 60,
//         'tolerance_minutes', 5
//       );
//     END IF;
//
//     RETURN jsonb_build_object(
//       'start_time', v_schedule.start_time,
//       'end_time', v_schedule.end_time,
//       'lunch_duration_minutes', v_schedule.lunch_duration_minutes,
//       'tolerance_minutes', v_schedule.tolerance_minutes
//     );
//   END;
//   $function$
//
// FUNCTION get_user_employee_id()
//   CREATE OR REPLACE FUNCTION public.get_user_employee_id()
//    RETURNS uuid
//    LANGUAGE sql
//    STABLE SECURITY DEFINER
//   AS $function$
//     SELECT COALESCE(
//       (SELECT (raw_user_meta_data->>'employee_id')::uuid FROM auth.users WHERE id = auth.uid()),
//       (SELECT id FROM public.employees WHERE personal_data->>'email' = (SELECT email FROM auth.users WHERE id = auth.uid()) LIMIT 1)
//     );
//   $function$
//
// FUNCTION get_user_org_id()
//   CREATE OR REPLACE FUNCTION public.get_user_org_id()
//    RETURNS uuid
//    LANGUAGE sql
//    STABLE SECURITY DEFINER
//   AS $function$
//     SELECT COALESCE(
//       (raw_user_meta_data->>'organization_id')::uuid,
//       '00000000-0000-0000-0000-000000000001'::uuid
//     )
//     FROM auth.users WHERE id = auth.uid();
//   $function$
//
// FUNCTION get_user_role()
//   CREATE OR REPLACE FUNCTION public.get_user_role()
//    RETURNS text
//    LANGUAGE sql
//    STABLE SECURITY DEFINER
//   AS $function$
//     SELECT perfil FROM public.usuarios WHERE id = auth.uid();
//   $function$
//
// FUNCTION handle_new_user()
//   CREATE OR REPLACE FUNCTION public.handle_new_user()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     INSERT INTO public.usuarios (id, email, nome, perfil, telefone)
//     VALUES (
//       new.id,
//       new.email,
//       COALESCE(new.raw_user_meta_data->>'full_name', ''),
//       COALESCE(new.raw_user_meta_data->>'perfil', 'colaborador'),
//       new.raw_user_meta_data->>'telefone'
//     );
//     RETURN new;
//   END;
//   $function$
//
// FUNCTION is_admin()
//   CREATE OR REPLACE FUNCTION public.is_admin()
//    RETURNS boolean
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_perfil TEXT;
//   BEGIN
//     SELECT perfil INTO v_perfil FROM public.usuarios WHERE id = auth.uid();
//     RETURN v_perfil = 'admin';
//   END;
//   $function$
//
// FUNCTION log_demanda_changes()
//   CREATE OR REPLACE FUNCTION public.log_demanda_changes()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//       v_usuario_id UUID;
//   BEGIN
//       -- Try to get the current authenticated user's ID
//       BEGIN
//           v_usuario_id := auth.uid();
//       EXCEPTION WHEN OTHERS THEN
//           v_usuario_id := NULL;
//       END;
//
//       IF TG_OP = 'INSERT' THEN
//           INSERT INTO public.logs_auditoria (demanda_id, usuario_id, acao, detalhes, dados_novos)
//           VALUES (NEW.id, v_usuario_id, 'Criação', 'Demanda criada', to_jsonb(NEW));
//       ELSIF TG_OP = 'UPDATE' THEN
//           IF NEW.status IS DISTINCT FROM OLD.status THEN
//               INSERT INTO public.logs_auditoria (demanda_id, usuario_id, acao, detalhes, dados_anteriores, dados_novos)
//               VALUES (NEW.id, v_usuario_id, 'Alteração de Status', 'Status alterado de ' || OLD.status || ' para ' || NEW.status, jsonb_build_object('status', OLD.status), jsonb_build_object('status', NEW.status));
//           END IF;
//
//           IF NEW.prioridade IS DISTINCT FROM OLD.prioridade THEN
//               INSERT INTO public.logs_auditoria (demanda_id, usuario_id, acao, detalhes, dados_anteriores, dados_novos)
//               VALUES (NEW.id, v_usuario_id, 'Alteração de Prioridade', 'Prioridade alterada de ' || OLD.prioridade || ' para ' || NEW.prioridade, jsonb_build_object('prioridade', OLD.prioridade), jsonb_build_object('prioridade', NEW.prioridade));
//           END IF;
//
//           IF NEW.responsavel_id IS DISTINCT FROM OLD.responsavel_id THEN
//               INSERT INTO public.logs_auditoria (demanda_id, usuario_id, acao, detalhes, dados_anteriores, dados_novos)
//               VALUES (NEW.id, v_usuario_id, 'Atribuição', 'Responsável alterado', jsonb_build_object('responsavel_id', OLD.responsavel_id), jsonb_build_object('responsavel_id', NEW.responsavel_id));
//           END IF;
//
//           IF NEW.resposta IS DISTINCT FROM OLD.resposta AND NEW.resposta IS NOT NULL AND NEW.resposta != '' THEN
//               INSERT INTO public.logs_auditoria (demanda_id, usuario_id, acao, detalhes, dados_anteriores, dados_novos)
//               VALUES (NEW.id, v_usuario_id, 'Nova Mensagem', 'Nova nota interna adicionada', jsonb_build_object('resposta', OLD.resposta), jsonb_build_object('resposta', NEW.resposta));
//           END IF;
//       END IF;
//       RETURN NEW;
//   END;
//   $function$
//
// FUNCTION set_demanda_dates()
//   CREATE OR REPLACE FUNCTION public.set_demanda_dates()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//       IF TG_OP = 'INSERT' THEN
//           IF NEW.responsavel_id IS NOT NULL THEN
//               NEW.data_atribuicao := NOW();
//           END IF;
//           IF NEW.status = 'Concluído' THEN
//               NEW.data_conclusao := NOW();
//           END IF;
//       ELSIF TG_OP = 'UPDATE' THEN
//           IF NEW.responsavel_id IS NOT NULL AND (OLD.responsavel_id IS NULL OR NEW.responsavel_id != OLD.responsavel_id) THEN
//               NEW.data_atribuicao := NOW();
//           END IF;
//           IF NEW.status = 'Concluído' AND OLD.status != 'Concluído' THEN
//               NEW.data_conclusao := NOW();
//           ELSIF NEW.status != 'Concluído' THEN
//               NEW.data_conclusao := NULL;
//           END IF;
//       END IF;
//
//       RETURN NEW;
//   END;
//   $function$
//
// FUNCTION set_time_entries_updated_at()
//   CREATE OR REPLACE FUNCTION public.set_time_entries_updated_at()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//       NEW.updated_at = NOW();
//       RETURN NEW;
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
// FUNCTION trigger_demanda_push_notification()
//   CREATE OR REPLACE FUNCTION public.trigger_demanda_push_notification()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//       -- Using the project URL from the environment config
//       edge_function_url TEXT := 'https://fyiukfacrniwpzchpzpx.supabase.co/functions/v1/notify-push';
//       payload JSONB;
//       v_title TEXT;
//       v_body TEXT;
//       v_usuario_id UUID;
//   BEGIN
//       -- Scenario 1: Assignment
//       IF NEW.responsavel_id IS NOT NULL AND (OLD.responsavel_id IS NULL OR NEW.responsavel_id != OLD.responsavel_id) THEN
//           v_usuario_id := NEW.responsavel_id;
//           v_title := 'Nova Demanda Atribuída';
//           v_body := 'A demanda "' || NEW.titulo || '" foi atribuída a você.';
//
//           payload := jsonb_build_object('usuario_id', v_usuario_id, 'notification', jsonb_build_object('title', v_title, 'body', v_body));
//           PERFORM net.http_post(
//               url := edge_function_url,
//               headers := '{"Content-Type": "application/json", "x-webhook-secret": "super-secret-webhook-key-123"}'::jsonb,
//               body := payload
//           );
//       END IF;
//
//       -- Scenario 2: Escalation
//       IF NEW.prioridade = 'Urgente' AND OLD.prioridade = 'Pode Ficar para Amanhã' AND NEW.responsavel_id IS NOT NULL THEN
//           v_usuario_id := NEW.responsavel_id;
//           v_title := 'Demanda Escalada para Urgente';
//           v_body := 'A demanda "' || NEW.titulo || '" agora é Urgente.';
//
//           payload := jsonb_build_object('usuario_id', v_usuario_id, 'notification', jsonb_build_object('title', v_title, 'body', v_body));
//           PERFORM net.http_post(
//               url := edge_function_url,
//               headers := '{"Content-Type": "application/json", "x-webhook-secret": "super-secret-webhook-key-123"}'::jsonb,
//               body := payload
//           );
//       END IF;
//
//       RETURN NEW;
//   END;
//   $function$
//
// FUNCTION trigger_notify_automation()
//   CREATE OR REPLACE FUNCTION public.trigger_notify_automation()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//       -- Using the project URL for Edge Functions
//       edge_function_url TEXT := 'https://fyiukfacrniwpzchpzpx.supabase.co/functions/v1/notify-automation';
//       payload JSONB;
//   BEGIN
//       IF TG_TABLE_NAME = 'demandas' THEN
//           -- Check if the status has actually changed
//           IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
//               payload := jsonb_build_object(
//                   'type', 'demand_status_change',
//                   'record', to_jsonb(NEW),
//                   'old_record', to_jsonb(OLD)
//               );
//
//               -- Send async HTTP POST request
//               PERFORM net.http_post(
//                   url := edge_function_url,
//                   headers := '{"Content-Type": "application/json", "x-webhook-secret": "super-secret-webhook-key-123"}'::jsonb,
//                   body := payload
//               );
//           END IF;
//       ELSIF TG_TABLE_NAME = 'clientes_externos' THEN
//           -- Check if the documentos have been modified
//           IF TG_OP = 'UPDATE' AND NEW.documentos IS DISTINCT FROM OLD.documentos THEN
//               payload := jsonb_build_object(
//                   'type', 'client_document_upload',
//                   'record', to_jsonb(NEW),
//                   'old_record', to_jsonb(OLD)
//               );
//
//               -- Send async HTTP POST request
//               PERFORM net.http_post(
//                   url := edge_function_url,
//                   headers := '{"Content-Type": "application/json", "x-webhook-secret": "super-secret-webhook-key-123"}'::jsonb,
//                   body := payload
//               );
//           END IF;
//       END IF;
//
//       RETURN NEW;
//   END;
//   $function$
//
// FUNCTION trigger_nova_notificacao_demanda()
//   CREATE OR REPLACE FUNCTION public.trigger_nova_notificacao_demanda()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//       -- Scenario 1: New demand assigned
//       IF TG_OP = 'INSERT' AND NEW.responsavel_id IS NOT NULL THEN
//           INSERT INTO public.notificacoes (usuario_id, titulo, mensagem, demanda_id)
//           VALUES (NEW.responsavel_id, 'Nova Demanda Atribuída', 'A demanda "' || NEW.titulo || '" foi atribuída a você.', NEW.id);
//       END IF;
//
//       -- Scenario 2: Existing demand reassigned
//       IF TG_OP = 'UPDATE' AND NEW.responsavel_id IS NOT NULL AND NEW.responsavel_id IS DISTINCT FROM OLD.responsavel_id THEN
//           INSERT INTO public.notificacoes (usuario_id, titulo, mensagem, demanda_id)
//           VALUES (NEW.responsavel_id, 'Nova Demanda Atribuída', 'A demanda "' || NEW.titulo || '" foi atribuída a você.', NEW.id);
//       END IF;
//
//       RETURN NEW;
//   END;
//   $function$
//
// FUNCTION update_monthly_timesheet()
//   CREATE OR REPLACE FUNCTION public.update_monthly_timesheet()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   DECLARE
//       v_year INTEGER;
//       v_month INTEGER;
//   BEGIN
//       v_year := EXTRACT(YEAR FROM NEW.entry_date);
//       v_month := EXTRACT(MONTH FROM NEW.entry_date);
//
//       INSERT INTO public.monthly_timesheets (organization_id, employee_id, year, month, days_worked)
//       VALUES (NEW.organization_id, NEW.employee_id, v_year, v_month, 1)
//       ON CONFLICT (organization_id, employee_id, year, month) DO UPDATE
//       SET days_worked = public.monthly_timesheets.days_worked + 1;
//
//       RETURN NEW;
//   END;
//   $function$
//
// FUNCTION validate_time_entries_sequence()
//   CREATE OR REPLACE FUNCTION public.validate_time_entries_sequence()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   DECLARE
//       v_previous_entry TEXT;
//   BEGIN
//       SELECT entry_type INTO v_previous_entry
//       FROM public.time_entries
//       WHERE employee_id = NEW.employee_id
//         AND entry_date = NEW.entry_date
//         AND id != NEW.id
//       ORDER BY timestamp DESC
//       LIMIT 1;
//
//       IF NEW.entry_type = 'intervalo_saida' THEN
//           IF v_previous_entry IS NULL OR v_previous_entry != 'entrada' THEN
//               RAISE EXCEPTION 'A saída para intervalo só pode ocorrer após uma entrada.';
//           END IF;
//       ELSIF NEW.entry_type = 'intervalo_entrada' THEN
//           IF v_previous_entry IS NULL OR v_previous_entry != 'intervalo_saida' THEN
//               RAISE EXCEPTION 'O retorno do intervalo só pode ocorrer após uma saída para intervalo.';
//           END IF;
//       ELSIF NEW.entry_type = 'saida' THEN
//           IF v_previous_entry IS NULL OR v_previous_entry NOT IN ('entrada', 'intervalo_entrada') THEN
//               RAISE EXCEPTION 'A saída só pode ocorrer após uma entrada ou retorno de intervalo.';
//           END IF;
//       ELSIF NEW.entry_type = 'entrada' THEN
//           IF v_previous_entry IS NOT NULL THEN
//               RAISE EXCEPTION 'Já existe um registro para este dia anterior à entrada.';
//           END IF;
//       END IF;
//
//       RETURN NEW;
//   END;
//   $function$
//
// FUNCTION validate_time_entry_sequence(uuid, uuid, date, text, timestamp with time zone)
//   CREATE OR REPLACE FUNCTION public.validate_time_entry_sequence(p_organization_id uuid, p_employee_id uuid, p_date date, p_new_entry_type text, p_new_timestamp timestamp with time zone)
//    RETURNS jsonb
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_last_entry RECORD;
//     v_valid BOOLEAN := true;
//     v_message TEXT := 'Sequência válida';
//     v_next_expected TEXT := '';
//   BEGIN
//     SELECT entry_type, timestamp INTO v_last_entry
//     FROM public.time_entries
//     WHERE organization_id = p_organization_id
//       AND employee_id = p_employee_id
//       AND entry_date = p_date
//       AND timestamp < p_new_timestamp
//     ORDER BY timestamp DESC
//     LIMIT 1;
//
//     IF v_last_entry IS NULL THEN
//       IF p_new_entry_type != 'entrada' THEN
//         v_valid := false;
//         v_message := 'O primeiro registro do dia deve ser uma entrada';
//         v_next_expected := 'entrada';
//       ELSE
//         v_next_expected := 'intervalo_saida';
//       END IF;
//     ELSIF v_last_entry.entry_type = 'entrada' THEN
//       IF p_new_entry_type != 'intervalo_saida' AND p_new_entry_type != 'saida' THEN
//         v_valid := false;
//         v_message := 'Após a entrada, é esperado saída para intervalo ou saída final';
//         v_next_expected := 'intervalo_saida';
//       ELSE
//         IF p_new_entry_type = 'intervalo_saida' THEN
//           v_next_expected := 'intervalo_entrada';
//         ELSE
//           v_next_expected := 'fim';
//         END IF;
//       END IF;
//     ELSIF v_last_entry.entry_type = 'intervalo_saida' THEN
//       IF p_new_entry_type != 'intervalo_entrada' THEN
//         v_valid := false;
//         v_message := 'Após saída para intervalo, é esperado o retorno (intervalo_entrada)';
//         v_next_expected := 'intervalo_entrada';
//       ELSE
//         v_next_expected := 'saida';
//       END IF;
//     ELSIF v_last_entry.entry_type = 'intervalo_entrada' THEN
//       IF p_new_entry_type != 'saida' THEN
//         v_valid := false;
//         v_message := 'Após o retorno do intervalo, é esperada a saída final';
//         v_next_expected := 'saida';
//       ELSE
//         v_next_expected := 'fim';
//       END IF;
//     ELSIF v_last_entry.entry_type = 'saida' THEN
//       v_valid := false;
//       v_message := 'Não são permitidos registros após a saída final do dia';
//       v_next_expected := 'fim';
//     END IF;
//
//     RETURN jsonb_build_object(
//       'valid', v_valid,
//       'message', v_message,
//       'next_expected', v_next_expected
//     );
//   END;
//   $function$
//
// FUNCTION validate_work_schedule()
//   CREATE OR REPLACE FUNCTION public.validate_work_schedule()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   DECLARE
//     v_schedule RECORD;
//     v_entry_time TIME;
//   BEGIN
//     -- Buscar horário do departamento
//     SELECT ds.* INTO v_schedule
//     FROM public.department_schedules ds
//     JOIN public.employees e ON e.department_id = ds.department_id
//     WHERE ds.organization_id = NEW.organization_id
//     AND e.id = NEW.employee_id
//     LIMIT 1;
//
//     IF v_schedule IS NULL THEN
//       RETURN NEW; -- Se não tem horário configurado, ignora
//     END IF;
//
//     v_entry_time := (NEW.timestamp AT TIME ZONE 'America/Sao_Paulo')::TIME;
//
//     IF NEW.entry_type = 'entrada' THEN
//       IF v_entry_time < (v_schedule.start_time - INTERVAL '2 hours') THEN
//          RAISE EXCEPTION 'SCHEDULE_ERROR: Entrada muito antecipada (mais de 2 horas antes do horário).';
//       END IF;
//     END IF;
//
//     RETURN NEW;
//   END;
//   $function$
//

// --- TRIGGERS ---
// Table: clientes_externos
//   on_cliente_documento_change_notify: CREATE TRIGGER on_cliente_documento_change_notify AFTER UPDATE OF documentos ON public.clientes_externos FOR EACH ROW EXECUTE FUNCTION trigger_notify_automation()
// Table: demandas
//   on_demanda_atribuida_notificacao: CREATE TRIGGER on_demanda_atribuida_notificacao AFTER INSERT OR UPDATE ON public.demandas FOR EACH ROW EXECUTE FUNCTION trigger_nova_notificacao_demanda()
//   on_demanda_change_log: CREATE TRIGGER on_demanda_change_log AFTER INSERT OR UPDATE ON public.demandas FOR EACH ROW EXECUTE FUNCTION log_demanda_changes()
//   on_demanda_dates_trigger: CREATE TRIGGER on_demanda_dates_trigger BEFORE INSERT OR UPDATE ON public.demandas FOR EACH ROW EXECUTE FUNCTION set_demanda_dates()
//   on_demanda_push_notify: CREATE TRIGGER on_demanda_push_notify AFTER UPDATE ON public.demandas FOR EACH ROW EXECUTE FUNCTION trigger_demanda_push_notification()
//   on_demanda_status_change_notify: CREATE TRIGGER on_demanda_status_change_notify AFTER UPDATE OF status ON public.demandas FOR EACH ROW EXECUTE FUNCTION trigger_notify_automation()
// Table: department_schedules
//   trg_department_schedules_updated_at: CREATE TRIGGER trg_department_schedules_updated_at BEFORE UPDATE ON public.department_schedules FOR EACH ROW EXECUTE FUNCTION set_time_entries_updated_at()
// Table: emails_sent
//   set_public_emails_sent_updated_at: CREATE TRIGGER set_public_emails_sent_updated_at BEFORE UPDATE ON public.emails_sent FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp()
// Table: employees
//   set_public_employees_updated_at: CREATE TRIGGER set_public_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp()
// Table: time_entries
//   before_insert_check_duplicate: CREATE TRIGGER before_insert_check_duplicate BEFORE INSERT OR UPDATE ON public.time_entries FOR EACH ROW EXECUTE FUNCTION check_duplicate_entry()
//   before_insert_validate_schedule: CREATE TRIGGER before_insert_validate_schedule BEFORE INSERT OR UPDATE ON public.time_entries FOR EACH ROW EXECUTE FUNCTION validate_work_schedule()
//   trg_audit_time_entries: CREATE TRIGGER trg_audit_time_entries AFTER INSERT OR DELETE OR UPDATE ON public.time_entries FOR EACH ROW EXECUTE FUNCTION audit_time_entries()
//   trg_time_entries_updated_at: CREATE TRIGGER trg_time_entries_updated_at BEFORE UPDATE ON public.time_entries FOR EACH ROW EXECUTE FUNCTION set_time_entries_updated_at()
//   trg_update_monthly_timesheet: CREATE TRIGGER trg_update_monthly_timesheet AFTER INSERT ON public.time_entries FOR EACH ROW WHEN ((new.entry_type = 'entrada'::text)) EXECUTE FUNCTION update_monthly_timesheet()
//   trg_validate_time_entries_sequence_custom: CREATE TRIGGER trg_validate_time_entries_sequence_custom BEFORE INSERT OR UPDATE ON public.time_entries FOR EACH ROW EXECUTE FUNCTION check_entry_sequence()
// Table: users
//   set_public_users_updated_at: CREATE TRIGGER set_public_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp()

// --- INDEXES ---
// Table: agenda_eventos
//   CREATE INDEX idx_agenda_eventos_cliente_id ON public.agenda_eventos USING btree (cliente_id)
//   CREATE INDEX idx_agenda_eventos_data_inicio ON public.agenda_eventos USING btree (data_inicio)
//   CREATE INDEX idx_agenda_eventos_usuario_id ON public.agenda_eventos USING btree (usuario_id)
// Table: auth_logs
//   CREATE INDEX idx_auth_logs_created_at ON public.auth_logs USING btree (created_at)
//   CREATE INDEX idx_auth_logs_email ON public.auth_logs USING btree (email)
// Table: candidates
//   CREATE UNIQUE INDEX candidates_email_key ON public.candidates USING btree (email)
//   CREATE INDEX idx_candidates_created_at ON public.candidates USING btree (created_at)
//   CREATE INDEX idx_candidates_profession ON public.candidates USING btree (profession)
//   CREATE INDEX idx_candidates_status ON public.candidates USING btree (status)
// Table: demandas
//   CREATE INDEX idx_demandas_cliente_id ON public.demandas USING btree (cliente_id)
//   CREATE INDEX idx_demandas_data_conclusao ON public.demandas USING btree (data_conclusao)
//   CREATE INDEX idx_demandas_responsavel_id ON public.demandas USING btree (responsavel_id)
// Table: department_schedules
//   CREATE INDEX idx_dept_schedules_org_dept ON public.department_schedules USING btree (organization_id, department_id)
//   CREATE UNIQUE INDEX unique_org_dept_schedule ON public.department_schedules USING btree (organization_id, department_id)
// Table: documents
//   CREATE INDEX idx_documents_employee_id ON public.documents USING btree (employee_id)
//   CREATE INDEX idx_documents_status ON public.documents USING btree (status)
// Table: emails_sent
//   CREATE INDEX idx_emails_sent_status ON public.emails_sent USING btree (status)
// Table: employees
//   CREATE UNIQUE INDEX employees_cpf_key ON public.employees USING btree (cpf)
//   CREATE UNIQUE INDEX employees_rg_key ON public.employees USING btree (rg)
//   CREATE INDEX idx_employees_created_at ON public.employees USING btree (created_at)
//   CREATE INDEX idx_employees_department_id ON public.employees USING btree (department_id)
//   CREATE INDEX idx_employees_status ON public.employees USING btree (status)
// Table: monthly_timesheets
//   CREATE INDEX idx_monthly_timesheets_lookup ON public.monthly_timesheets USING btree (organization_id, employee_id, year, month)
//   CREATE INDEX idx_monthly_timesheets_org_date ON public.monthly_timesheets USING btree (organization_id, year, month)
//   CREATE UNIQUE INDEX unique_org_emp_year_month ON public.monthly_timesheets USING btree (organization_id, employee_id, year, month)
// Table: notificacoes
//   CREATE INDEX idx_notificacoes_data_criacao ON public.notificacoes USING btree (data_criacao)
//   CREATE INDEX idx_notificacoes_usuario_id_lida ON public.notificacoes USING btree (usuario_id, lida)
//   CREATE UNIQUE INDEX unq_notificacoes_usuario_ref ON public.notificacoes USING btree (usuario_id, referencia_id)
// Table: onboarding_checklist
//   CREATE INDEX idx_onboarding_checklist_employee_id ON public.onboarding_checklist USING btree (employee_id)
// Table: time_entries
//   CREATE INDEX idx_time_entries_emp_date ON public.time_entries USING btree (employee_id, entry_date)
//   CREATE INDEX idx_time_entries_org_date ON public.time_entries USING btree (organization_id, entry_date)
//   CREATE INDEX idx_time_entries_org_emp_date ON public.time_entries USING btree (organization_id, employee_id, entry_date)
//   CREATE UNIQUE INDEX unique_daily_entry_type ON public.time_entries USING btree (organization_id, employee_id, entry_date, entry_type)
// Table: time_entries_audit
//   CREATE INDEX idx_time_entries_audit_date ON public.time_entries_audit USING btree (organization_id, changed_at)
//   CREATE INDEX idx_time_entries_audit_lookup ON public.time_entries_audit USING btree (organization_id, time_entry_id)
// Table: users
//   CREATE INDEX idx_users_created_at ON public.users USING btree (created_at)
//   CREATE INDEX idx_users_email ON public.users USING btree (email)
//   CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email)
// Table: vacation_balance
//   CREATE INDEX idx_vacation_balance_employee_id ON public.vacation_balance USING btree (employee_id)
// Table: vacation_requests
//   CREATE INDEX idx_vacation_requests_employee_id ON public.vacation_requests USING btree (employee_id)
//   CREATE INDEX idx_vacation_requests_status ON public.vacation_requests USING btree (status)
