import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkExpirations() {
  const today = new Date()
  const in30 = new Date(today)
  in30.setDate(in30.getDate() + 30)
  const todayStr = today.toISOString().split('T')[0]
  const in30Str = in30.toISOString().split('T')[0]

  const { data: admins } = await supabase.from('usuarios').select('id').eq('perfil', 'admin')
  const adminIds = (admins || []).map((a: any) => a.id)
  if (adminIds.length === 0) return { processed: 0 }

  const notifs: any[] = []

  const { data: certidoes } = await supabase
    .from('certidoes_empresa')
    .select('id, tipo_certidao, data_validade, clientes_externos(nome, empresa)')
    .not('data_validade', 'is', null)
    .gte('data_validade', todayStr)
    .lte('data_validade', in30Str)

  for (const c of certidoes || []) {
    const name = c.clientes_externos?.nome || c.clientes_externos?.empresa || 'Empresa'
    const days = Math.ceil((new Date(c.data_validade).getTime() - today.getTime()) / 86400000)
    for (const uid of adminIds) {
      notifs.push({
        usuario_id: uid,
        tipo: 'vencimento_documento',
        titulo: 'Vencimento de Documento',
        mensagem: `O documento Certidão ${c.tipo_certidao} da ${name} vencerá em ${days} dias`,
        referencia_id: `venc_doc_certidoes_${c.id}`,
      })
    }
  }

  const { data: sstDocs } = await supabase
    .from('sst_documents')
    .select('id, categoria, data_validade, clientes_externos(nome, empresa)')
    .not('data_validade', 'is', null)
    .gte('data_validade', todayStr)
    .lte('data_validade', in30Str)

  for (const s of sstDocs || []) {
    const name = s.clientes_externos?.nome || s.clientes_externos?.empresa || 'Empresa'
    const days = Math.ceil((new Date(s.data_validade).getTime() - today.getTime()) / 86400000)
    for (const uid of adminIds) {
      notifs.push({
        usuario_id: uid,
        tipo: 'vencimento_documento',
        titulo: 'Vencimento de Documento',
        mensagem: `O documento SST ${s.categoria} da ${name} vencerá em ${days} dias`,
        referencia_id: `venc_doc_sst_${s.id}`,
      })
    }
  }

  const { data: atestados } = await supabase
    .from('colaborador_atestados')
    .select('id, tipo, data_vencimento, colaboradores(nome)')
    .not('data_vencimento', 'is', null)
    .gte('data_vencimento', todayStr)
    .lte('data_vencimento', in30Str)

  for (const a of atestados || []) {
    const name = a.colaboradores?.nome || 'Colaborador'
    const days = Math.ceil((new Date(a.data_vencimento).getTime() - today.getTime()) / 86400000)
    for (const uid of adminIds) {
      notifs.push({
        usuario_id: uid,
        tipo: 'vencimento_documento',
        titulo: 'Vencimento de Documento',
        mensagem: `O documento Atestado ${a.tipo || 'ASO'} do colaborador ${name} vencerá em ${days} dias`,
        referencia_id: `venc_doc_atestado_${a.id}`,
      })
    }
  }

  if (notifs.length > 0) {
    await supabase
      .from('notificacoes')
      .upsert(notifs, { onConflict: 'usuario_id, referencia_id', ignoreDuplicates: true })
  }

  return { processed: notifs.length }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const result = await checkExpirations()
    return new Response(JSON.stringify({ success: true, ...result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
