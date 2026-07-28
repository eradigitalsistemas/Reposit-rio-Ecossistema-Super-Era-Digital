import { useState, useEffect, useCallback } from 'react'
import { Loader2, Trash2, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { SectionCard, FileUploadButton, DownloadButton } from '@/components/empresa-tabs/shared'
import {
  fetchCertidoes,
  uploadCertidao,
  deleteCertidao,
  type CertidaoTipo,
  type CertidaoDoc,
} from '@/services/empresa-certidoes'
import { extractDateFromFilename } from '@/lib/validity-date'

const TIPOS: { value: CertidaoTipo; label: string }[] = [
  { value: 'Federal', label: 'Federal' },
  { value: 'Estadual D1', label: 'Estadual D1' },
  { value: 'Estadual D2', label: 'Estadual D2' },
  { value: 'Trabalhista', label: 'Trabalhista' },
  { value: 'FGTS', label: 'FGTS' },
  { value: 'Municipal', label: 'Municipal' },
]

export function CertidoesTab({ empresaId }: { empresaId: string }) {
  const { toast } = useToast()
  const [docs, setDocs] = useState<CertidaoDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setDocs(await fetchCertidoes(empresaId))
    } catch {
      toast({ title: 'Erro', description: 'Falha ao carregar certidões.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [empresaId, toast])

  useEffect(() => {
    load()
  }, [load])

  const handleUpload = async (tipo: CertidaoTipo, file: File) => {
    setUploading(tipo)
    try {
      await uploadCertidao(empresaId, tipo, file)
      toast({ title: 'Sucesso', description: 'Certidão enviada.' })
      await load()
    } catch {
      toast({ title: 'Erro', description: 'Falha no upload.', variant: 'destructive' })
    } finally {
      setUploading(null)
    }
  }

  const handleDelete = async (doc: CertidaoDoc) => {
    try {
      await deleteCertidao(doc)
      setDocs((prev) => prev.filter((d) => d.id !== doc.id))
      toast({ title: 'Sucesso', description: 'Certidão removida.' })
    } catch {
      toast({ title: 'Erro', description: 'Falha ao remover.', variant: 'destructive' })
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )

  return (
    <div className="space-y-4">
      {TIPOS.map(({ value, label }) => {
        const tipoDocs = docs.filter((d) => d.tipo_certidao === value)
        return (
          <SectionCard key={value} title={label} icon={FileText}>
            {tipoDocs.length > 0 && (
              <div className="space-y-2 mb-3">
                {tipoDocs.map((doc) => {
                  const fileName = doc.arquivo_url?.split('/').pop() || 'Sem arquivo'
                  const extractedDate = doc.arquivo_url ? extractDateFromFilename(fileName) : null
                  return (
                    <div
                      key={doc.id}
                      className="flex items-center gap-2 text-xs flex-wrap p-2 rounded border border-border/40 bg-background/20"
                    >
                      <span className="truncate flex-1 min-w-0">{fileName}</span>
                      <span className="text-muted-foreground">
                        Enviado: {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                      </span>
                      {extractedDate && (
                        <span className="text-muted-foreground">
                          Validade: {new Date(extractedDate).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                      {doc.arquivo_url && <DownloadButton path={doc.arquivo_url} />}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleDelete(doc)}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
            <FileUploadButton
              onFile={(f) => handleUpload(value, f)}
              label="Enviar PDF"
              disabled={uploading === value}
            />
          </SectionCard>
        )
      })}
    </div>
  )
}
