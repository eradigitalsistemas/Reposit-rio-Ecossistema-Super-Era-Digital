import { supabase } from '@/lib/supabase/client'
import { fetchColaboradoresByEmpresaId } from '@/services/empresas'

export interface ExpiringDoc {
  id: string
  tipo: string
  entidade: string
  dataValidade: string | null
  tabela: string
}

export async function fetchExpiringDocs(empresaId: string): Promise<ExpiringDoc[]> {
  const [certidoesRes, sstRes, colabRes, empresaRes] = await Promise.all([
    supabase.from('certidoes_empresa').select('*').eq('empresa_id', empresaId),
    supabase.from('sst_documents').select('*').eq('empresa_id', empresaId),
    fetchColaboradoresByEmpresaId(empresaId),
    supabase.from('clientes_externos').select('nome, empresa').eq('id', empresaId).maybeSingle(),
  ])

  const docs: ExpiringDoc[] = []
  const empresaNome = empresaRes.data?.nome || empresaRes.data?.empresa || 'Empresa'

  for (const c of certidoesRes.data || []) {
    docs.push({
      id: c.id,
      tipo: `Certidão ${c.tipo_certidao}`,
      entidade: empresaNome,
      dataValidade: c.data_validade,
      tabela: 'certidoes_empresa',
    })
  }

  for (const s of sstRes.data || []) {
    docs.push({
      id: s.id,
      tipo: `SST ${s.categoria}`,
      entidade: empresaNome,
      dataValidade: s.data_validade,
      tabela: 'sst_documents',
    })
  }

  if (colabRes.length > 0) {
    const colabIds = colabRes.map((c) => c.id)
    const { data: atestados } = await supabase
      .from('colaborador_atestados')
      .select('*')
      .in('colaborador_id', colabIds)

    const colabMap = new Map(colabRes.map((c) => [c.id, c.nome]))
    for (const a of atestados || []) {
      docs.push({
        id: a.id,
        tipo: `Atestado ${a.tipo || 'ASO'}`,
        entidade: colabMap.get(a.colaborador_id) || 'Colaborador',
        dataValidade: a.data_vencimento,
        tabela: 'colaborador_atestados',
      })
    }
  }

  return docs
}
