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
      demandas: {
        Row: {
          anexos: Json | null
          checklist: Json | null
          cliente_id: string | null
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
      notificacoes: {
        Row: {
          data_criacao: string
          demanda_id: string | null
          id: string
          lida: boolean
          mensagem: string
          titulo: string
          usuario_id: string
        }
        Insert: {
          data_criacao?: string
          demanda_id?: string | null
          id?: string
          lida?: boolean
          mensagem: string
          titulo: string
          usuario_id: string
        }
        Update: {
          data_criacao?: string
          demanda_id?: string | null
          id?: string
          lida?: boolean
          mensagem?: string
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
      is_admin: { Args: never; Returns: boolean }
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
// Table: notificacoes
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   titulo: text (not null)
//   mensagem: text (not null)
//   lida: boolean (not null, default: false)
//   demanda_id: uuid (nullable)
//   data_criacao: timestamp with time zone (not null, default: now())
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
// Table: checklist_templates
//   PRIMARY KEY checklist_templates_pkey: PRIMARY KEY (id)
//   FOREIGN KEY checklist_templates_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: clientes_externos
//   PRIMARY KEY clientes_externos_pkey: PRIMARY KEY (id)
// Table: demandas
//   FOREIGN KEY demandas_cliente_id_fkey: FOREIGN KEY (cliente_id) REFERENCES clientes_externos(id) ON DELETE SET NULL
//   PRIMARY KEY demandas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY demandas_responsavel_id_fkey: FOREIGN KEY (responsavel_id) REFERENCES usuarios(id) ON DELETE SET NULL
//   FOREIGN KEY demandas_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: disc_results
//   PRIMARY KEY disc_results_pkey: PRIMARY KEY (id)
//   FOREIGN KEY disc_results_user_id_fkey: FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
// Table: educations
//   PRIMARY KEY educations_pkey: PRIMARY KEY (id)
//   FOREIGN KEY educations_user_id_fkey: FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
// Table: emails_sent
//   PRIMARY KEY emails_sent_pkey: PRIMARY KEY (id)
//   FOREIGN KEY emails_sent_user_id_fkey: FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
// Table: notificacoes
//   FOREIGN KEY notificacoes_demanda_id_fkey: FOREIGN KEY (demanda_id) REFERENCES demandas(id) ON DELETE CASCADE
//   PRIMARY KEY notificacoes_pkey: PRIMARY KEY (id)
//   FOREIGN KEY notificacoes_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: push_subscriptions
//   PRIMARY KEY push_subscriptions_pkey: PRIMARY KEY (id)
//   FOREIGN KEY push_subscriptions_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: sync_logs
//   PRIMARY KEY sync_logs_pkey: PRIMARY KEY (id)
// Table: users
//   UNIQUE users_email_key: UNIQUE (email)
//   PRIMARY KEY users_pkey: PRIMARY KEY (id)
// Table: usuarios
//   FOREIGN KEY usuarios_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY usuarios_pkey: PRIMARY KEY (id)
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
// Table: notificacoes
//   Policy "Sistema pode inserir notificacoes" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Usuarios podem atualizar proprias notificacoes" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = usuario_id)
//     WITH CHECK: (auth.uid() = usuario_id)
//   Policy "Usuarios podem ver proprias notificacoes" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = usuario_id)
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
// Table: whatsapp_clicks
//   Policy "anon_insert_whatsapp_clicks" (INSERT, PERMISSIVE) roles={anon,authenticated}
//     WITH CHECK: true
//   Policy "auth_read_whatsapp_clicks" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true

// --- DATABASE FUNCTIONS ---
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

// --- TRIGGERS ---
// Table: clientes_externos
//   on_cliente_documento_change_notify: CREATE TRIGGER on_cliente_documento_change_notify AFTER UPDATE OF documentos ON public.clientes_externos FOR EACH ROW EXECUTE FUNCTION trigger_notify_automation()
// Table: demandas
//   on_demanda_atribuida_notificacao: CREATE TRIGGER on_demanda_atribuida_notificacao AFTER INSERT OR UPDATE ON public.demandas FOR EACH ROW EXECUTE FUNCTION trigger_nova_notificacao_demanda()
//   on_demanda_change_log: CREATE TRIGGER on_demanda_change_log AFTER INSERT OR UPDATE ON public.demandas FOR EACH ROW EXECUTE FUNCTION log_demanda_changes()
//   on_demanda_push_notify: CREATE TRIGGER on_demanda_push_notify AFTER UPDATE ON public.demandas FOR EACH ROW EXECUTE FUNCTION trigger_demanda_push_notification()
//   on_demanda_status_change_notify: CREATE TRIGGER on_demanda_status_change_notify AFTER UPDATE OF status ON public.demandas FOR EACH ROW EXECUTE FUNCTION trigger_notify_automation()
// Table: emails_sent
//   set_public_emails_sent_updated_at: CREATE TRIGGER set_public_emails_sent_updated_at BEFORE UPDATE ON public.emails_sent FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp()
// Table: users
//   set_public_users_updated_at: CREATE TRIGGER set_public_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp()

// --- INDEXES ---
// Table: agenda_eventos
//   CREATE INDEX idx_agenda_eventos_cliente_id ON public.agenda_eventos USING btree (cliente_id)
//   CREATE INDEX idx_agenda_eventos_data_inicio ON public.agenda_eventos USING btree (data_inicio)
//   CREATE INDEX idx_agenda_eventos_usuario_id ON public.agenda_eventos USING btree (usuario_id)
// Table: demandas
//   CREATE INDEX idx_demandas_cliente_id ON public.demandas USING btree (cliente_id)
// Table: emails_sent
//   CREATE INDEX idx_emails_sent_status ON public.emails_sent USING btree (status)
// Table: users
//   CREATE INDEX idx_users_created_at ON public.users USING btree (created_at)
//   CREATE INDEX idx_users_email ON public.users USING btree (email)
//   CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email)
