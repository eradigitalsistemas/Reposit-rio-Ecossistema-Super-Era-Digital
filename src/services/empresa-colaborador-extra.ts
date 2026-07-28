import { supabase } from '@/lib/supabase/client'
import { uploadColaboradorFile, deleteEmpresaFile } from '@/services/empresa-files'

export interface Atestado {
  id: string
  colaborador_id: string
  tipo: string
  aso_url: string | null
  data: string | null
  medico: string | null
  created_at: string
  data_vencimento: string | null
  email_empresa: string | null
  whatsapp_empresa: string | null
  email_funcionario: string | null
  whatsapp_funcionario: string | null
}

export interface AtestadoInput {
  file: File
  tipo: string
  dataExame: string
  medico: string
  dataVencimento: string
  emailEmpresa: string
  whatsappEmpresa: string
  emailFuncionario: string
  whatsappFuncionario: string
}

export interface Periodico {
  id: string
  colaborador_id: string
  exames: string | null
  periodicidade: string | null
  arquivo_url: string | null
  created_at: string
}

export interface CATRecord {
  id: string
  colaborador_id: string
  tipo: string
  numero: string | null
  arquivo_url: string | null
  created_at: string
}

export async function fetchAtestados(colaboradorId: string): Promise<Atestado[]> {
  const { data, error } = await supabase
    .from('colaborador_atestados')
    .select('*')
    .eq('colaborador_id', colaboradorId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []) as Atestado[]
}

export async function createAtestado(
  colaboradorId: string,
  input: AtestadoInput,
): Promise<Atestado> {
  const path = await uploadColaboradorFile(colaboradorId, input.file, 'atestado')
  const { data: result, error } = await supabase
    .from('colaborador_atestados')
    .insert({
      colaborador_id: colaboradorId,
      aso_url: path,
      data: input.dataExame || null,
      medico: input.medico || null,
      tipo: input.tipo || 'Admissional',
      data_vencimento: input.dataVencimento || null,
      email_empresa: input.emailEmpresa || null,
      whatsapp_empresa: input.whatsappEmpresa || null,
      email_funcionario: input.emailFuncionario || null,
      whatsapp_funcionario: input.whatsappFuncionario || null,
    })
    .select('*')
    .single()
  if (error) throw error
  return result as Atestado
}

export async function deleteAtestado(id: string, url: string | null): Promise<void> {
  if (url) await deleteEmpresaFile(url)
  const { error } = await supabase.from('colaborador_atestados').delete().eq('id', id)
  if (error) throw error
}

export async function createAtestadoNotification(
  colaboradorNome: string,
  atestadoId: string,
  diasParaVencer: number,
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')
  const mensagem = `O Atestado Ocupacional do colaborador (${colaboradorNome}) vencerá em ${diasParaVencer} dias`
  const { error } = await supabase.from('notificacoes').insert({
    usuario_id: user.id,
    titulo: 'Vencimento de Atestado',
    mensagem,
    tipo: 'atestado_vencimento',
    referencia_id: `atestado_${atestadoId}_${diasParaVencer}`,
  })
  if (error) throw error
}

export async function fetchPeriodicos(colaboradorId: string): Promise<Periodico[]> {
  const { data, error } = await supabase
    .from('colaborador_periodicos')
    .select('*')
    .eq('colaborador_id', colaboradorId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []) as Periodico[]
}

export async function createPeriodico(
  colaboradorId: string,
  file: File | null,
  exames: string,
  periodicidade: string,
): Promise<Periodico> {
  let path: string | null = null
  if (file) path = await uploadColaboradorFile(colaboradorId, file, 'periodico')
  const { data, error } = await supabase
    .from('colaborador_periodicos')
    .insert({ colaborador_id: colaboradorId, exames, periodicidade, arquivo_url: path })
    .select('*')
    .single()
  if (error) throw error
  return data as Periodico
}

export async function deletePeriodico(id: string, url: string | null): Promise<void> {
  if (url) await deleteEmpresaFile(url)
  const { error } = await supabase.from('colaborador_periodicos').delete().eq('id', id)
  if (error) throw error
}

export async function fetchCATs(colaboradorId: string): Promise<CATRecord[]> {
  const { data, error } = await supabase
    .from('colaborador_cat')
    .select('*')
    .eq('colaborador_id', colaboradorId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []) as CATRecord[]
}

export async function createCAT(
  colaboradorId: string,
  tipo: string,
  numero: string,
  file: File | null,
): Promise<CATRecord> {
  let path: string | null = null
  if (file) path = await uploadColaboradorFile(colaboradorId, file, 'cat')
  const { data, error } = await supabase
    .from('colaborador_cat')
    .insert({ colaborador_id: colaboradorId, tipo, numero: numero || null, arquivo_url: path })
    .select('*')
    .single()
  if (error) throw error
  return data as CATRecord
}

export async function deleteCAT(id: string, url: string | null): Promise<void> {
  if (url) await deleteEmpresaFile(url)
  const { error } = await supabase.from('colaborador_cat').delete().eq('id', id)
  if (error) throw error
}
