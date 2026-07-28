import { useState } from 'react'
import { FileDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { exportDossier } from '@/lib/dossier-export'
import { fetchEmpresas } from '@/services/empresas'

export function CompanyDossierButton({ empresaId }: { empresaId: string }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const [certidoes, sst, consti, empresas] = await Promise.all([
        supabase.from('certidoes_empresa').select('*').eq('empresa_id', empresaId),
        supabase.from('sst_documents').select('*').eq('empresa_id', empresaId),
        supabase.from('documentos_constituicao').select('*').eq('empresa_id', empresaId),
        fetchEmpresas(),
      ])
      const emp = empresas.find((e) => e.id === empresaId)
      const nome = emp?.nome || emp?.empresa || 'Empresa'
      exportDossier(nome, 'empresa', [
        {
          titulo: 'Documentos de Constituição',
          docs: (consti.data || []).map((d) => ({
            tipo: d.tipo,
            nomeArquivo: d.arquivo_url?.split('/').pop() || null,
            dataEmissao: null,
            dataValidade: null,
          })),
        },
        {
          titulo: 'Certidões',
          docs: (certidoes.data || []).map((d) => ({
            tipo: d.tipo_certidao,
            nomeArquivo: d.arquivo_url?.split('/').pop() || null,
            dataEmissao: null,
            dataValidade: d.data_validade,
          })),
        },
        {
          titulo: 'Documentos SST',
          docs: (sst.data || []).map((d) => ({
            tipo: d.categoria,
            nomeArquivo: d.arquivo_url?.split('/').pop() || null,
            dataEmissao: d.data_emissao,
            dataValidade: d.data_validade,
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
