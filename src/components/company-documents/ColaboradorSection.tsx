import { useState, useEffect, useCallback, useRef } from 'react'
import {
  UserPlus,
  Pencil,
  Trash2,
  FileText,
  Users,
  Loader2,
  Download,
  Upload,
  X,
  Calendar,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import {
  fetchColaboradores,
  deleteColaborador,
  fetchColaboradorDocumentos,
  deleteColaboradorDocumento,
  getDocumentoUrl,
  uploadColaboradorDocument,
  updateColaboradorDocumentoValidade,
  extractValidityDateViaOCR,
  type ColaboradorEmpresa,
  type ColaboradorDocumento,
} from '@/services/colaboradores-empresa'
import { ColaboradorFormModal } from '@/components/company-documents/ColaboradorFormModal'
import { ManualValidityDialog } from '@/components/company-documents/ManualValidityDialog'
import { extractDateFromFilename, isExpiryFilename } from '@/lib/validity-date'
import { getExpiryStatus, getStatusConfig } from '@/lib/document-status'
import { formatCPF } from '@/lib/utils/cpf'

interface ColaboradorSectionProps {
  empresaDocId: string
}

export function ColaboradorSection({ empresaDocId }: ColaboradorSectionProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [colaboradores, setColaboradores] = useState<ColaboradorEmpresa[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ColaboradorEmpresa | null>(null)
  const [deleting, setDeleting] = useState<ColaboradorEmpresa | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [docMap, setDocMap] = useState<Record<string, ColaboradorDocumento[]>>({})
  const [uploadColabId, setUploadColabId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [manualDoc, setManualDoc] = useState<{ doc: ColaboradorDocumento; colabId: string } | null>(
    null,
  )

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const list = await fetchColaboradores(empresaDocId)
      setColaboradores(list)
      const map: Record<string, ColaboradorDocumento[]> = {}
      for (const c of list) {
        try {
          map[c.id] = await fetchColaboradorDocumentos(c.id)
        } catch {
          map[c.id] = []
        }
      }
      setDocMap(map)
    } catch {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar colaboradores.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [empresaDocId, toast])

  useEffect(() => {
    load()
  }, [load])

  const handleDelete = async () => {
    if (!deleting) return
    setDeleteLoading(true)
    try {
      await deleteColaborador(deleting.id)
      toast({ title: 'Sucesso', description: 'Colaborador removido.' })
      setDeleting(null)
      await load()
    } catch {
      toast({ title: 'Erro', description: 'Falha ao remover colaborador.', variant: 'destructive' })
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleDownload = async (doc: ColaboradorDocumento) => {
    const url = await getDocumentoUrl(doc.url)
    if (url) window.open(url, '_blank')
  }

  const handleDeleteDoc = async (doc: ColaboradorDocumento, colabId: string) => {
    try {
      await deleteColaboradorDocumento(doc.id, doc.url)
      toast({ title: 'Sucesso', description: 'Documento removido.' })
      setDocMap((prev) => ({
        ...prev,
        [colabId]: (prev[colabId] || []).filter((d) => d.id !== doc.id),
      }))
    } catch {
      toast({ title: 'Erro', description: 'Falha ao remover documento.', variant: 'destructive' })
    }
  }

  const handleUploadClick = (colabId: string) => {
    setUploadColabId(colabId)
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !uploadColabId) return
    if (fileInputRef.current) fileInputRef.current.value = ''

    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const shouldDetect = isExpiryFilename(file.name)
        let validade: string | null = extractDateFromFilename(file.name)

        const doc = await uploadColaboradorDocument(
          empresaDocId,
          uploadColabId,
          file,
          'pessoal',
          undefined,
          validade,
        )

        if (!validade && shouldDetect) {
          const ocrDate = await extractValidityDateViaOCR(file.name, doc.url)
          if (ocrDate) {
            validade = ocrDate
            await updateColaboradorDocumentoValidade(doc.id, validade)
            toast({
              title: 'Validade detectada',
              description: `Data: ${new Date(validade).toLocaleDateString('pt-BR')}`,
            })
          }
        }

        if (!validade && shouldDetect) {
          setManualDoc({ doc: { ...doc, validade }, colabId: uploadColabId })
        }

        setDocMap((prev) => ({
          ...prev,
          [uploadColabId]: [...(prev[uploadColabId] || []), { ...doc, validade }],
        }))
      }
      toast({ title: 'Sucesso', description: 'Documento(s) enviado(s).' })
    } catch {
      toast({ title: 'Erro', description: 'Falha no upload.', variant: 'destructive' })
    } finally {
      setUploading(false)
      setUploadColabId(null)
    }
  }

  const handleSaveManualDate = async (date: string) => {
    if (!manualDoc) return
    try {
      await updateColaboradorDocumentoValidade(manualDoc.doc.id, date)
      setDocMap((prev) => ({
        ...prev,
        [manualDoc.colabId]: (prev[manualDoc.colabId] || []).map((d) =>
          d.id === manualDoc.doc.id ? { ...d, validade: date } : d,
        ),
      }))
      toast({ title: 'Sucesso', description: 'Data de validade salva.' })
    } catch {
      toast({ title: 'Erro', description: 'Falha ao salvar data.', variant: 'destructive' })
    } finally {
      setManualDoc(null)
    }
  }

  const countDocs = (id: string) => (docMap[id] || []).length

  const renderValidadeBadge = (doc: ColaboradorDocumento) => {
    if (!doc.validade) return null
    const status = getExpiryStatus(doc.validade)
    const config = getStatusConfig(status)
    return (
      <Badge variant="outline" className={`text-[10px] gap-1 ${config.badgeClass}`}>
        <Calendar className="w-2.5 h-2.5" />
        {new Date(doc.validade).toLocaleDateString('pt-BR')}
      </Badge>
    )
  }

  return (
    <Card className="bg-card/60 border-border/50 shadow-sm backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> Colaboradores
            </CardTitle>
            <CardDescription>Gerencie colaboradores vinculados a esta empresa.</CardDescription>
          </div>
          <Button
            size="sm"
            className="gap-2"
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            <UserPlus className="w-4 h-4" /> Adicionar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : colaboradores.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-20" />
            <p className="text-sm">Nenhum colaborador cadastrado.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {colaboradores.map((colab) => (
              <div key={colab.id} className="border border-border/50 rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{colab.nome}</p>
                    <p className="text-sm text-muted-foreground">
                      CPF: {colab.cpf ? formatCPF(colab.cpf) : '—'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Badge variant="secondary" className="gap-1">
                      <FileText className="w-3 h-3" /> {countDocs(colab.id)}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleUploadClick(colab.id)}
                      disabled={uploading}
                      title="Upload documento"
                    >
                      {uploading && uploadColabId === colab.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setEditing(colab)
                        setFormOpen(true)
                      }}
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleting(colab)}
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {docMap[colab.id] && docMap[colab.id].length > 0 && (
                  <div className="border-t border-border/30 pt-2 space-y-1">
                    {docMap[colab.id].map((doc) => (
                      <div key={doc.id} className="flex items-center gap-2 text-xs flex-wrap">
                        <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate flex-1 min-w-0">
                          {doc.nome_arquivo || doc.url}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {doc.tipo === 'pessoal' ? 'Pessoal' : 'Admissional'}
                        </Badge>
                        {renderValidadeBadge(doc)}
                        <button type="button" onClick={() => handleDownload(doc)} title="Baixar">
                          <Download className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDoc(doc, colab.id)}
                          title="Remover documento"
                        >
                          <X className="w-3.5 h-3.5 text-destructive" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <ColaboradorFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        empresaDocId={empresaDocId}
        colaborador={editing}
        onSuccess={load}
      />

      <ManualValidityDialog
        open={!!manualDoc}
        onOpenChange={(v) => !v && setManualDoc(null)}
        fileName={manualDoc?.doc.nome_arquivo || manualDoc?.doc.url || ''}
        onSave={handleSaveManualDate}
        onSkip={() => setManualDoc(null)}
      />

      <AlertDialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Colaborador</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o colaborador &ldquo;{deleting?.nome}&rdquo;? Os
              documentos associados também serão excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading ? 'Removendo...' : 'Sim, remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
