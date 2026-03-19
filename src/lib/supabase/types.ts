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
            foreignKeyName: 'demandas_responsavel_id_fkey'
            columns: ['responsavel_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
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
          estagio: string
          id: string
          nome: string
          observacoes: string | null
          telefone: string | null
          usuario_id: string
        }
        Insert: {
          data_criacao?: string
          email: string
          empresa?: string | null
          estagio: string
          id?: string
          nome: string
          observacoes?: string | null
          telefone?: string | null
          usuario_id?: string
        }
        Update: {
          data_criacao?: string
          email?: string
          empresa?: string | null
          estagio?: string
          id?: string
          nome?: string
          observacoes?: string | null
          telefone?: string | null
          usuario_id?: string
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
      usuarios: {
        Row: {
          ativo: boolean
          data_criacao: string
          email: string
          id: string
          nome: string
          perfil: string
        }
        Insert: {
          ativo?: boolean
          data_criacao?: string
          email: string
          id: string
          nome?: string
          perfil?: string
        }
        Update: {
          ativo?: boolean
          data_criacao?: string
          email?: string
          id?: string
          nome?: string
          perfil?: string
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
// Table: historico_leads
//   id: uuid (not null, default: gen_random_uuid())
//   lead_id: uuid (not null)
//   usuario_id: uuid (not null, default: auth.uid())
//   contato_nome: text (not null)
//   forma_contato: text (not null)
//   detalhes: text (not null)
//   data_criacao: timestamp with time zone (not null, default: now())

// --- CONSTRAINTS ---
// Table: historico_leads
//   PRIMARY KEY historico_leads_pkey: PRIMARY KEY (id)
//   FOREIGN KEY historico_leads_lead_id_fkey: FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
//   FOREIGN KEY historico_leads_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE
