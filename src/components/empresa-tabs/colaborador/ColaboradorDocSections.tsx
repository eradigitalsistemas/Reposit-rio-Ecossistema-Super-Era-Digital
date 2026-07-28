import { useState, useEffect, useCallback } from 'react'
import { FileText, FileCheck2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  SectionCard,
  StatusToggle,
  FileUploadButton,
  DownloadButton,
} from '@/components/empresa-tabs/shared'
import {
  fetchColaboradorDocs,
  upsertColaboradorDoc,
  updateColaboradorDocStatus,
  type ColabDoc,
} from '@/services/empresa-colaborador-docs'

const PESSOAIS = [
  { tipo: 'RG', label: 'RG' },
  { tipo: 'CPF', label: 'CPF' },
  { tipo: 'CTPS', label: 'CTPS' },
  { tipo: 'CNH', label: 'CNH' },
  { tipo: 'COMPROVANTE', label: 'Comprovante de Endereço' },
]

const ESOCIAL = [
  { tipo: 'S2240', label: 'S-2240' },
  { tipo: 'S2220', label: 'S-2220' },
]

export function ColaboradorDocSections({ colaboradorId }: { colaboradorId: string }) {
  const { toast } = useToast()
  const [docs, setDocs] = useState<ColabDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setDocs(await fetchColaboradorDocs(colaboradorId))
    } catch {
      toast({ title: 'Erro', description: 'Falha ao carregar documentos.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [colaboradorId, toast])

  useEffect(() => {
    load()
  }, [load])

  const handleUpload = async (tipo: string, file: File) => {
    setBusy(true)
    try {
      await upsertColaboradorDoc(colaboradorId, tipo, file)
      toast({ title: 'Sucesso', description: 'Documento enviado.' })
      await load()
    } catch {
      toast({ title: 'Erro', description: 'Falha no upload.', variant: 'destructive' })
    } finally {
      setBusy(false)
    }
  }

  const handleStatus = async (docId: string, status: string) => {
    try {
      await updateColaboradorDocStatus(docId, status)
      setDocs((prev) => prev.map((d) => (d.id === docId ? { ...d, status } : d)))
    } catch {
      toast({ title: 'Erro', description: 'Falha ao atualizar.', variant: 'destructive' })
    }
  }

  const renderRow = (tipo: string, label: string, withStatus: boolean) => {
    const doc = docs.find((d) => d.tipo === tipo)
    return (
      <div
        key={tipo}
        className="flex items-center justify-between gap-3 flex-wrap py-2 border-b border-border/30 last:border-0"
      >
        <span className="text-sm font-medium">{label}</span>
        <div className="flex items-center gap-2">
          {withStatus && (
            <StatusToggle
              status={doc?.status || 'Pendente'}
              onChange={(s) => doc && handleStatus(doc.id, s)}
              disabled={!doc || busy}
            />
          )}
          {doc?.url && <DownloadButton path={doc.url} disabled={busy} />}
          <FileUploadButton
            onFile={(f) => handleUpload(tipo, f)}
            label={doc ? 'Substituir' : 'Enviar'}
            disabled={busy}
          />
        </div>
      </div>
    )
  }

  if (loading) return null

  return (
    <div className="space-y-4">
      <SectionCard title="Documentos Pessoais" icon={FileText}>
        <div className="space-y-1">{PESSOAIS.map((t) => renderRow(t.tipo, t.label, true))}</div>
      </SectionCard>
      <SectionCard title="Documentos eSocial" icon={FileCheck2}>
        <div className="space-y-1">{ESOCIAL.map((t) => renderRow(t.tipo, t.label, false))}</div>
      </SectionCard>
    </div>
  )
}
