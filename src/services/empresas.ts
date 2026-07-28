import { supabase } from '@/lib/supabase/client'

export interface Empresa {
  id: string
  nome: string
  empresa: string | null
  cnpj: string | null
  email: string | null
  telefone: string | null
}

export interface ColaboradorSimples {
  id: string
  nome: string
  cpf: string | null
  email: string | null
}

export async function fetchEmpresas(): Promise<Empresa[]> {
  const { data, error } = await supabase
    .from('clientes_externos')
    .select('id, nome, empresa, cnpj, email, telefone')
    .order('nome', { ascending: true })
  if (error) throw error
  return (data || []) as Empresa[]
}

export async function fetchColaboradoresByEmpresaId(
  empresaId: string,
): Promise<ColaboradorSimples[]> {
  const { data, error } = await supabase
    .from('colaboradores')
    .select('id, nome, cpf, email')
    .eq('empresa_id', empresaId)
    .order('nome', { ascending: true })
  if (error) throw error
  return (data || []) as ColaboradorSimples[]
}

export async function createColaboradorForEmpresa(
  empresaId: string,
  payload: { nome: string; cpf: string },
): Promise<ColaboradorSimples> {
  const { data, error } = await supabase
    .from('colaboradores')
    .insert({
      nome: payload.nome,
      cpf: payload.cpf,
      empresa_id: empresaId,
      email: `${crypto.randomUUID()}@placeholder.com`,
      ativo: true,
    })
    .select('id, nome, cpf, email')
    .single()
  if (error) throw error
  return data as ColaboradorSimples
}
