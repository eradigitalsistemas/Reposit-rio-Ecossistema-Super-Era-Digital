import { useState } from 'react'
import { FileDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { exportDossier } from '@/lib/dossier-export'

export function ColaboradorDossierButton({
  colaboradorId,
  colaboradorNome,
}: {
  colaboradorId: string
  colaboradorNome: string
}) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const [docsRes, atestadosRes, periodicosRes, catsRes] = await Promise.all([
        supabase.from('colaborador_documentos').select('*').eq('colaborador_id', colaboradorId),
        supabase.from('colaborador_atestados').select('*').eq('colaborador_id', colaboradorId),
        supabase.from('colaborador_periodicos').select('*').eq('colaborador_id', colaboradorId),
        supabase.from('colaborador_cat').select('*').eq('colaborador_id', colaboradorId),
      ])
      const allDocs = docsRes.data || []
      exportDossier(colaboradorNome, 'colaborador', [
        {
          titulo: 'Documentos Pessoais',
          docs: allDocs
            .filter((d) => d.tipo === 'Pessoal')
            .map((d) => ({
              tipo: d.nome_arquivo || 'Pessoal',
              nomeArquivo: d.url?.split('/').pop() || null,
              dataEmissao: null,
              dataValidade: d.validade,
            })),
        },
        {
          titulo: 'Recibos SST (S-2240 / S-2220)',
          docs: allDocs
            .filter((d) => ['S2240', 'S2220'].includes(d.tipo))
            .map((d) => ({
              tipo: d.tipo,
              nomeArquivo: d.url?.split('/').pop() || null,
              dataEmissao: null,
              dataValidade: d.validade,
            })),
        },
        {
          titulo: 'CAT',
          docs: (catsRes.data || []).map((c) => ({
            tipo: c.tipo,
            nomeArquivo: c.arquivo_url?.split('/').pop() || null,
            dataEmissao: null,
            dataValidade: null,
          })),
        },
        {
          titulo: 'Atestados de Saúde Ocupacional',
          docs: (atestadosRes.data || []).map((a) => ({
            tipo: a.tipo || 'ASO',
            nomeArquivo: a.aso_url?.split('/').pop() || null,
            dataEmissao: a.data,
            dataValidade: a.data_vencimento,
          })),
        },
        {
          titulo: 'Exames Periódicos',
          docs: (periodicosRes.data || []).map((p) => ({
            tipo: p.exames || 'Periódico',
            nomeArquivo: p.arquivo_url?.split('/').pop() || null,
            dataEmissao: null,
            dataValidade: null,
          })),
        },
      ])
    } catch {
      toast({ title: 'Erro', description: 'Falha ao gerar dossiê.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5"
      disabled={loading}
      onClick={handleExport}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
      Exportar Dossiê
    </Button>
  )
}
