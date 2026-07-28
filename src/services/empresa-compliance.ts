import { supabase } from '@/lib/supabase/client'

export type ComplianceCategoria = 'Certidões' | 'Documentos SST' | 'Atestados' | 'Constituição'

export interface ComplianceDoc {
  id: string
  tipo: string
  categoria: ComplianceCategoria
  dataValidade: string | null
  arquivoUrl: string | null
  colaboradorNome?: string
}

export async function fetchComplianceDocs(empresaId: string): Promise<ComplianceDoc[]> {
  const docs: ComplianceDoc[] = []

  const [certRes, sstRes, constRes] = await Promise.all([
    supabase.from('certidoes_empresa').select('*').eq('empresa_id', empresaId),
    supabase.from('sst_documents').select('*').eq('empresa_id', empresaId),
    supabase.from('documentos_constituicao').select('*').eq('empresa_id', empresaId),
  ])

  certRes.data?.forEach((c) => {
    docs.push({
      id: c.id,
      tipo: c.tipo_certidao,
      categoria: 'Certidões',
      dataValidade: c.data_validade,
      arquivoUrl: c.arquivo_url,
    })
  })

  sstRes.data?.forEach((s) => {
    docs.push({
      id: s.id,
      tipo: s.categoria,
      categoria: 'Documentos SST',
      dataValidade: s.data_validade,
      arquivoUrl: s.arquivo_url,
    })
  })

  constRes.data?.forEach((d) => {
    docs.push({
      id: d.id,
      tipo: d.tipo,
      categoria: 'Constituição',
      dataValidade: null,
      arquivoUrl: d.arquivo_url,
    })
  })

  const { data: colaboradores } = await supabase
    .from('colaboradores')
    .select('id, nome')
    .eq('empresa_id', empresaId)

  if (colaboradores?.length) {
    const ids = colaboradores.map((c) => c.id)
    const nomes = new Map(colaboradores.map((c) => [c.id, c.nome]))

    const [atestRes, colabDocRes, catRes, perRes] = await Promise.all([
      supabase.from('colaborador_atestados').select('*').in('colaborador_id', ids),
      supabase
        .from('colaborador_documentos')
        .select('*')
        .in('colaborador_id', ids)
        .in('tipo', ['S2240', 'S2220']),
      supabase.from('colaborador_cat').select('*').in('colaborador_id', ids),
      supabase.from('colaborador_periodicos').select('*').in('colaborador_id', ids),
    ])

    atestRes.data?.forEach((a) => {
      docs.push({
        id: a.id,
        tipo: `ASO - ${a.tipo}`,
        categoria: 'Atestados',
        dataValidade: a.data_vencimento,
        arquivoUrl: a.aso_url,
        colaboradorNome: nomes.get(a.colaborador_id),
      })
    })

    colabDocRes.data?.forEach((d) => {
      docs.push({
        id: d.id,
        tipo: d.tipo,
        categoria: 'Documentos SST',
        dataValidade: d.validade,
        arquivoUrl: d.url,
        colaboradorNome: nomes.get(d.colaborador_id),
      })
    })

    catRes.data?.forEach((c) => {
      docs.push({
        id: c.id,
        tipo: `CAT - ${c.tipo}`,
        categoria: 'Documentos SST',
        dataValidade: null,
        arquivoUrl: c.arquivo_url,
        colaboradorNome: nomes.get(c.colaborador_id),
      })
    })

    perRes.data?.forEach((p) => {
      docs.push({
        id: p.id,
        tipo: p.exames || 'Exame Periódico',
        categoria: 'Documentos SST',
        dataValidade: null,
        arquivoUrl: p.arquivo_url,
        colaboradorNome: nomes.get(p.colaborador_id),
      })
    })
  }

  return docs
}
