import { useState, useEffect, useCallback } from 'react'
import { FileText, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  SectionCard,
  StatusToggle,
  FileUploadButton,
  DownloadButton,
} from '@/components/empresa-tabs/shared'
import {
  fetchConstituicaoDocs,
  upsertConstituicaoDoc,
  updateConstituicaoStatus,
  type ConstituicaoTipo,
  type ConstituicaoDoc,
} from '@/services/empresa-constituicao'

const TYPES: { tipo: ConstituicaoTipo; label: string }[] = [
  { tipo: 'CNPJ', label: 'CNPJ' },
  { tipo: 'CONTRATO_SOCIAL', label: 'Contrato Social' },
  { tipo: 'ALTERACOES_CONTRATUAIS', label: 'Alterações Contratuais' },
  { tipo: 'Alvará', label: 'Alvará' },
]

export function ConstituicaoTab({ empresaId }: { empresaId: string }) {
  const { toast } = useToast()
  const [docs, setDocs] = useState<ConstituicaoDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setDocs(await fetchConstituicaoDocs(empresaId))
    } catch {
      toast({ title: 'Erro', description: 'Falha ao carregar documentos.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [empresaId, toast])

  useEffect(() => {
    load()
  }, [load])

  const handleUpload = async (tipo: ConstituicaoTipo, file: File) => {
    setUploading(tipo)
    try {
      await upsertConstituicaoDoc(empresaId, tipo, file)
      toast({ title: 'Sucesso', description: 'Documento enviado.' })
      await load()
    } catch {
      toast({ title: 'Erro', description: 'Falha no upload.', variant: 'destructive' })
    } finally {
      setUploading(null)
    }
  }

  const handleStatus = async (docId: string, status: string) => {
    try {
      await updateConstituicaoStatus(docId, status)
      setDocs((prev) => prev.map((d) => (d.id === docId ? { ...d, status } : d)))
    } catch {
      toast({ title: 'Erro', description: 'Falha ao atualizar status.', variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {TYPES.map(({ tipo, label }) => {
        const doc = docs.find((d) => d.tipo === tipo)
        return (
          <SectionCard key={tipo} title={label} icon={FileText}>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <StatusToggle
                  status={doc?.status || 'Pendente'}
                  onChange={(s) => doc && handleStatus(doc.id, s)}
                  disabled={!doc}
                />
                {doc?.arquivo_url && <DownloadButton path={doc.arquivo_url} />}
              </div>
              <FileUploadButton
                onFile={(f) => handleUpload(tipo, f)}
                label={doc ? 'Substituir' : 'Enviar PDF'}
                disabled={uploading === tipo}
              />
            </div>
            {doc?.arquivo_url && (
              <p className="text-xs text-muted-foreground mt-2 truncate">
                Arquivo: {doc.arquivo_url.split('/').pop()}
              </p>
            )}
          </SectionCard>
        )
      })}
    </div>
  )
}
