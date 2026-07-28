import { useState, useEffect, useCallback } from 'react'
import { FileText, FileCheck2, Plus, Trash2, FolderOpen, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  deleteColaboradorDoc,
  createColaboradorDocPersonal,
  type ColabDoc,
} from '@/services/empresa-colaborador-docs'
import {
  fetchCATs,
  createCAT,
  deleteCAT,
  type CATRecord,
} from '@/services/empresa-colaborador-extra'

export function ColaboradorDocSections({ colaboradorId }: { colaboradorId: string }) {
  const { toast } = useToast()
  const [docs, setDocs] = useState<ColabDoc[]>([])
  const [cats, setCats] = useState<CATRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [showPessoalForm, setShowPessoalForm] = useState(false)
  const [pessoalTitle, setPessoalTitle] = useState('')
  const [pessoalFile, setPessoalFile] = useState<File | null>(null)
  const [catForm, setCatForm] = useState({
    tipo: 'ACIDENTE',
    numero: '',
    file: null as File | null,
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [d, c] = await Promise.all([
        fetchColaboradorDocs(colaboradorId),
        fetchCATs(colaboradorId),
      ])
      setDocs(d)
      setCats(c)
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

  const handleAddPessoal = async () => {
    if (!pessoalTitle.trim() || !pessoalFile) {
      toast({ title: 'Aviso', description: 'Preencha o título e selecione um arquivo.' })
      return
    }
    setBusy(true)
    try {
      await createColaboradorDocPersonal(colaboradorId, pessoalTitle.trim(), pessoalFile)
      toast({ title: 'Sucesso', description: 'Documento adicionado.' })
      setPessoalTitle('')
      setPessoalFile(null)
      setShowPessoalForm(false)
      await load()
    } catch {
      toast({ title: 'Erro', description: 'Falha ao adicionar.', variant: 'destructive' })
    } finally {
      setBusy(false)
    }
  }

  const handleDeletePessoal = async (doc: ColabDoc) => {
    try {
      await deleteColaboradorDoc(doc)
      setDocs((prev) => prev.filter((d) => d.id !== doc.id))
      toast({ title: 'Sucesso', description: 'Documento removido.' })
    } catch {
      toast({ title: 'Erro', description: 'Falha ao remover.', variant: 'destructive' })
    }
  }

  const handleSaveCAT = async () => {
    setBusy(true)
    try {
      await createCAT(colaboradorId, catForm.tipo, catForm.numero, catForm.file)
      toast({ title: 'Sucesso', description: 'CAT adicionado.' })
      setCatForm({ tipo: 'ACIDENTE', numero: '', file: null })
      await load()
    } catch {
      toast({ title: 'Erro', description: 'Falha ao salvar.', variant: 'destructive' })
    } finally {
      setBusy(false)
    }
  }

  const renderSimpleRow = (tipo: string, label: string) => {
    const doc = docs.find((d) => d.tipo === tipo)
    return (
      <div
        key={tipo}
        className="flex items-center justify-between gap-3 flex-wrap py-2 border-b border-border/30 last:border-0"
      >
        <span className="text-sm font-medium">{label}</span>
        <div className="flex items-center gap-2">
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

  const pessoaisDocs = docs.filter((d) => d.tipo === 'Pessoal')

  return (
    <div className="space-y-4">
      <SectionCard title="Documentos Pessoais" icon={FileText}>
        <div className="space-y-1">
          {pessoaisDocs.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between gap-3 flex-wrap py-2 border-b border-border/30 last:border-0"
            >
              <span className="text-sm font-medium truncate">
                {doc.nome_arquivo || 'Sem título'}
              </span>
              <div className="flex items-center gap-2">
                <StatusToggle
                  status={doc.status || 'Pendente'}
                  onChange={(s) => handleStatus(doc.id, s)}
                  disabled={busy}
                />
                {doc.url && <DownloadButton path={doc.url} disabled={busy} />}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={busy}
                  onClick={() => handleDeletePessoal(doc)}
                >
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          {showPessoalForm ? (
            <div className="space-y-2 py-2">
              <Input
                value={pessoalTitle}
                onChange={(e) => setPessoalTitle(e.target.value)}
                placeholder="Título do documento (ex: RG atualizado)"
                className="h-9"
              />
              <div className="flex items-center gap-2">
                <FileUploadButton
                  onFile={setPessoalFile}
                  label={pessoalFile ? pessoalFile.name : 'Selecionar PDF'}
                  disabled={busy}
                />
                <Button
                  size="sm"
                  onClick={handleAddPessoal}
                  disabled={busy || !pessoalTitle.trim() || !pessoalFile}
                  className="gap-1.5"
                >
                  {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Adicionar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowPessoalForm(false)
                    setPessoalTitle('')
                    setPessoalFile(null)
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 mt-2"
              onClick={() => setShowPessoalForm(true)}
            >
              <Plus className="w-4 h-4" /> Adicionar Documento
            </Button>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Recibos SST" icon={FolderOpen}>
        <div className="space-y-2">
          <div className="text-sm font-semibold py-1">CAT</div>
          {cats.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-2 text-xs flex-wrap p-2 rounded border border-border/40 bg-background/20"
            >
              <span className="text-muted-foreground">Tipo: {c.tipo}</span>
              <span className="text-muted-foreground">Número: {c.numero || '—'}</span>
              {c.arquivo_url && <DownloadButton path={c.arquivo_url} disabled={busy} />}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 ml-auto"
                disabled={busy}
                onClick={() => deleteCAT(c.id, c.arquivo_url).then(load)}
              >
                <Trash2 className="w-3.5 h-3.5 text-destructive" />
              </Button>
            </div>
          ))}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Tipo</Label>
              <Select
                value={catForm.tipo}
                onValueChange={(v) => setCatForm((p) => ({ ...p, tipo: v }))}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACIDENTE">Acidente</SelectItem>
                  <SelectItem value="DOENCA">Doença</SelectItem>
                  <SelectItem value="OUTRO">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Número</Label>
              <Input
                value={catForm.numero}
                onChange={(e) => setCatForm((p) => ({ ...p, numero: e.target.value }))}
                className="h-9"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FileUploadButton
              onFile={(f) => setCatForm((p) => ({ ...p, file: f }))}
              label={catForm.file ? catForm.file.name : 'Selecionar Arquivo'}
              disabled={busy}
            />
            <Button size="sm" onClick={handleSaveCAT} disabled={busy} className="gap-1.5">
              {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Salvar
            </Button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="S-2240" icon={FileCheck2}>
        <div className="space-y-1">{renderSimpleRow('S2240', 'S-2240')}</div>
      </SectionCard>
      <SectionCard title="S-2220" icon={FileCheck2}>
        <div className="space-y-1">{renderSimpleRow('S2220', 'S-2220')}</div>
      </SectionCard>
    </div>
  )
}
