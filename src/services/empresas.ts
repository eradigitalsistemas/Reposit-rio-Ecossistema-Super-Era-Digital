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

export async function createEmpresa(payload: {
  nome: string
  empresa?: string | null
  cnpj?: string | null
  email?: string | null
  telefone?: string | null
  endereco_logradouro?: string | null
  endereco_numero?: string | null
  endereco_bairro?: string | null
  endereco_cep?: string | null
  endereco_cidade?: string | null
  endereco_estado?: string | null
}): Promise<Empresa> {
  const { data, error } = await supabase
    .from('clientes_externos')
    .insert(payload)
    .select('id, nome, empresa, cnpj, email, telefone')
    .single()
  if (error) throw error
  return data as Empresa
}

export async function checkDuplicateCpfs(empresaId: string, cpfs: string[]): Promise<Set<string>> {
  const cleanCpfs = cpfs.map((c) => c.replace(/\D/g, '')).filter(Boolean)
  if (cleanCpfs.length === 0) return new Set()
  const { data, error } = await supabase
    .from('colaboradores')
    .select('cpf')
    .eq('empresa_id', empresaId)
  if (error || !data) return new Set()
  const existing = new Set(data.map((d) => d.cpf?.replace(/\D/g, '')).filter(Boolean) as string[])
  return new Set(cleanCpfs.filter((cpf) => existing.has(cpf)))
}

export async function batchCreateColaboradores(
  empresaId: string,
  colaboradores: Array<{
    nome: string
    cpf: string | null
    email: string
    especialidades: string[]
    ativo: boolean
  }>,
): Promise<{ success: number; errors: number }> {
  let success = 0
  let errors = 0
  for (const c of colaboradores) {
    const { error } = await supabase.from('colaboradores').insert({
      nome: c.nome,
      cpf: c.cpf,
      email: c.email,
      especialidades: c.especialidades.length > 0 ? c.especialidades : null,
      ativo: c.ativo,
      empresa_id: empresaId,
    })
    if (error) errors++
    else success++
  }
  return { success, errors }
}
