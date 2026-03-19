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
          email: string
          empresa: string | null
          id: string
          nome: string
          telefone: string | null
        }
        Insert: {
          cnpj?: string | null
          data_criacao?: string
          email: string
          empresa?: string | null
          id?: string
          nome: string
          telefone?: string | null
        }
        Update: {
          cnpj?: string | null
          data_criacao?: string
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
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: clientes_externos
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   empresa: text (nullable)
//   email: text (not null)
//   telefone: text (nullable)
//   cnpj: text (nullable)
//   data_criacao: timestamp with time zone (not null, default: now())
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
// Table: logs_auditoria
//   id: uuid (not null, default: gen_random_uuid())
//   demanda_id: uuid (nullable)
//   usuario_id: uuid (nullable)
//   acao: text (not null)
//   detalhes: text (nullable)
//   dados_anteriores: jsonb (nullable)
//   dados_novos: jsonb (nullable)
//   data_criacao: timestamp with time zone (not null, default: now())
// Table: push_subscriptions
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   subscription_data: jsonb (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: usuarios
//   id: uuid (not null)
//   nome: text (not null, default: ''::text)
//   email: text (not null)
//   data_criacao: timestamp with time zone (not null, default: now())
//   perfil: text (not null, default: 'colaborador'::text)
//   ativo: boolean (not null, default: true)

// --- CONSTRAINTS ---
// Table: clientes_externos
//   PRIMARY KEY clientes_externos_pkey: PRIMARY KEY (id)
// Table: demandas
//   PRIMARY KEY demandas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY demandas_responsavel_id_fkey: FOREIGN KEY (responsavel_id) REFERENCES usuarios(id) ON DELETE SET NULL
//   FOREIGN KEY demandas_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: leads
//   PRIMARY KEY leads_pkey: PRIMARY KEY (id)
//   FOREIGN KEY leads_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: logs_auditoria
//   FOREIGN KEY logs_auditoria_demanda_id_fkey: FOREIGN KEY (demanda_id) REFERENCES demandas(id) ON DELETE SET NULL
//   PRIMARY KEY logs_auditoria_pkey: PRIMARY KEY (id)
//   FOREIGN KEY logs_auditoria_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
// Table: push_subscriptions
//   PRIMARY KEY push_subscriptions_pkey: PRIMARY KEY (id)
//   FOREIGN KEY push_subscriptions_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: usuarios
//   FOREIGN KEY usuarios_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY usuarios_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: clientes_externos
//   Policy "Admins_gerenciam_clientes_externos" (ALL, PERMISSIVE) roles={authenticated}
//     USING: is_admin()
//     WITH CHECK: is_admin()
// Table: demandas
//   Policy "Admins podem gerenciar tudo em demandas" (ALL, PERMISSIVE) roles={authenticated}
//     USING: is_admin()
//     WITH CHECK: is_admin()
//   Policy "Responsaveis podem atualizar demandas" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = responsavel_id)
//     WITH CHECK: (auth.uid() = responsavel_id)
//   Policy "Responsaveis podem ver demandas" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = responsavel_id)
//   Policy "Usuarios gerenciam proprias demandas" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = usuario_id)
//     WITH CHECK: (auth.uid() = usuario_id)
//   Policy "Usuarios podem aceitar demandas nao atribuidas" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (responsavel_id IS NULL)
//   Policy "Usuarios podem ver demandas nao atribuidas" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (responsavel_id IS NULL)
// Table: leads
//   Policy "Admins podem gerenciar tudo em leads" (ALL, PERMISSIVE) roles={authenticated}
//     USING: is_admin()
//     WITH CHECK: is_admin()
//   Policy "Usuarios gerenciam proprios leads" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = usuario_id)
//     WITH CHECK: (auth.uid() = usuario_id)
// Table: logs_auditoria
//   Policy "Admins podem ver logs_auditoria" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: is_admin()
// Table: push_subscriptions
//   Policy "Enable delete for authenticated users" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = usuario_id)
//   Policy "Enable insert for authenticated users" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (auth.uid() = usuario_id)
//   Policy "Enable select for authenticated users" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = usuario_id)
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

// --- DATABASE FUNCTIONS ---
// FUNCTION handle_new_user()
//   CREATE OR REPLACE FUNCTION public.handle_new_user()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     INSERT INTO public.usuarios (id, email, nome, perfil)
//     VALUES (
//       new.id,
//       new.email,
//       COALESCE(new.raw_user_meta_data->>'full_name', ''),
//       COALESCE(new.raw_user_meta_data->>'perfil', 'colaborador')
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

// --- TRIGGERS ---
// Table: demandas
//   on_demanda_change_log: CREATE TRIGGER on_demanda_change_log AFTER INSERT OR UPDATE ON public.demandas FOR EACH ROW EXECUTE FUNCTION log_demanda_changes()
//   on_demanda_push_notify: CREATE TRIGGER on_demanda_push_notify AFTER UPDATE ON public.demandas FOR EACH ROW EXECUTE FUNCTION trigger_demanda_push_notification()
