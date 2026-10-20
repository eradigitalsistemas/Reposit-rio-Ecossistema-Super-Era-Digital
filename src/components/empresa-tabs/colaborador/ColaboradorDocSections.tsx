import { useState, useEffect, useCallback, useRef } from 'react'
import {
  FileText,
  FileCheck2,
  Plus,
  Trash2,
  FolderOpen,
  Loader2,
  Upload,
  AlertCircle,
  Eye,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { SectionCard, DownloadButton } from '@/components/empresa-tabs/shared'
import { DocumentUploadCard } from '@/components/empresa-tabs/colaborador/DocumentUploadCard'
import {
  fetchColaboradorDocs,
  upsertColaboradorDoc,
  updateColaboradorDocStatus,
  updateColaboradorDocValidade,
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
import { getEmpresaFileUrl } from '@/services/empresa-files'

// Documentos pessoais comuns sugeridos para preenchimento rápido
const COMMON_PESSOAIS = [
  'RG / Identidade',
  'CPF / Comprovante de Inscrição',
  'Carteira de Trabalho (CTPS / Digital)',
  'Comprovante de Residência',
  'Título de Eleitor',
  'Certidão de Nascimento / Casamento',
]

export interface ColaboradorDocSectionsProps {
  colaboradorId: string
  filterSection?: 'all' | 'pessoais' | 'esocial' | 'cat'
}

export function ColaboradorDocSections({
  colaboradorId,
  filterSection = 'all',
}: ColaboradorDocSectionsProps) {
  const { toast } = useToast()
  const [docs, setDocs] = useState<ColabDoc[]>([])
  const [cats, setCats] = useState<CATRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  // Documento pessoal modal / form
  const [showPessoalForm, setShowPessoalForm] = useState(false)
  const [pessoalTitle, setPessoalTitle] = useState('')
  const [pessoalValidade, setPessoalValidade] = useState('')
  const [pessoalFile, setPessoalFile] = useState<File | null>(null)
  const pessoalInputRef = useRef<HTMLInputElement>(null)

  // CAT form
  const [showCatForm, setShowCatForm] = useState(false)
  const [catForm, setCatForm] = useState({
    tipo: 'ACIDENTE',
    numero: '',
    file: null as File | null,
  })
  const catInputRef = useRef<HTMLInputElement>(null)

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
      toast({ title: 'Sucesso', description: `Documento ${tipo} enviado.` })
      await load()
    } catch {
      toast({ title: 'Erro', description: 'Falha no upload do documento.', variant: 'destructive' })
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (doc: ColabDoc) => {
    setBusy(true)
    try {
      await deleteColaboradorDoc(doc)
      setDocs((prev) => prev.filter((d) => d.id !== doc.id))
      toast({ title: 'Sucesso', description: 'Documento removido.' })
    } catch {
      toast({ title: 'Erro', description: 'Falha ao remover documento.', variant: 'destructive' })
    } finally {
      setBusy(false)
    }
  }

  const handleStatus = async (docId: string, status: string) => {
    try {
      await updateColaboradorDocStatus(docId, status)
      setDocs((prev) => prev.map((d) => (d.id === docId ? { ...d, status } : d)))
      toast({ title: 'Status atualizado', description: `Definido como: ${status}` })
    } catch {
      toast({ title: 'Erro', description: 'Falha ao atualizar status.', variant: 'destructive' })
    }
  }

  const handleUpdateValidade = async (docId: string, validade: string) => {
    try {
      await updateColaboradorDocValidade(docId, validade)
      setDocs((prev) => prev.map((d) => (d.id === docId ? { ...d, validade } : d)))
      toast({ title: 'Sucesso', description: 'Data de validade atualizada.' })
    } catch {
      toast({ title: 'Erro', description: 'Falha ao atualizar data.', variant: 'destructive' })
    }
  }

  const handleAddPessoal = async () => {
    if (!pessoalTitle.trim() || !pessoalFile) {
      toast({ title: 'Aviso', description: 'Preencha o título e selecione um arquivo.' })
      return
    }
    setBusy(true)
    try {
      await createColaboradorDocPersonal(
        colaboradorId,
        pessoalTitle.trim(),
        pessoalFile,
        pessoalValidade || null,
      )
      toast({ title: 'Sucesso', description: 'Documento pessoal adicionado.' })
      setPessoalTitle('')
      setPessoalValidade('')
      setPessoalFile(null)
      setShowPessoalForm(false)
      await load()
    } catch {
      toast({ title: 'Erro', description: 'Falha ao adicionar documento.', variant: 'destructive' })
    } finally {
      setBusy(false)
    }
  }

  const handleSaveCAT = async () => {
    setBusy(true)
    try {
      await createCAT(colaboradorId, catForm.tipo, catForm.numero, catForm.file)
      toast({ title: 'Sucesso', description: 'CAT registrada com sucesso.' })
      setCatForm({ tipo: 'ACIDENTE', numero: '', file: null })
      setShowCatForm(false)
      await load()
    } catch {
      toast({ title: 'Erro', description: 'Falha ao salvar CAT.', variant: 'destructive' })
    } finally {
      setBusy(false)
    }
  }

  const handleDeleteCAT = async (cat: CATRecord) => {
    setBusy(true)
    try {
      await deleteCAT(cat.id, cat.arquivo_url)
      setCats((prev) => prev.filter((c) => c.id !== cat.id))
      toast({ title: 'Sucesso', description: 'CAT removida.' })
    } catch {
      toast({ title: 'Erro', description: 'Falha ao excluir CAT.', variant: 'destructive' })
    } finally {
      setBusy(false)
    }
  }

  const handleViewUrl = async (path: string | null) => {
    if (!path) return
    const url = await getEmpresaFileUrl(path)
    if (url) window.open(url, '_blank')
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  const pessoaisDocs = docs.filter((d) => d.tipo === 'Pessoal')
  const s2240Doc = docs.find((d) => d.tipo === 'S2240' || d.tipo === 's2240')
  const s2220Doc = docs.find((d) => d.tipo === 'S2220' || d.tipo === 's2220')

  return (
    <div className="space-y-6">
      {/* SEÇÃO: DOCUMENTOS PESSOAIS */}
      {(filterSection === 'all' || filterSection === 'pessoais') && (
        <SectionCard title="Documentos Pessoais do Colaborador" icon={FileText}>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <p className="text-xs text-muted-foreground">
                Anexe documentos como RG, CPF, Carteira de Trabalho, comprovantes e termos
                assinados.
              </p>
              {!showPessoalForm && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs h-8 border-primary/30 text-primary hover:bg-primary/10"
                  onClick={() => setShowPessoalForm(true)}
                  disabled={busy}
                >
                  <Plus className="w-3.5 h-3.5" /> Novo Documento Pessoal
                </Button>
              )}
            </div>

            {/* Form para adicionar documento pessoal */}
            {showPessoalForm && (
              <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Anexar Novo Documento Pessoal
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => {
                      setShowPessoalForm(false)
                      setPessoalTitle('')
                      setPessoalFile(null)
                    }}
                  >
                    Cancelar
                  </Button>
                </div>

                {/* Sugestões rápidas */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-muted-foreground">Sugestões:</span>
                  {COMMON_PESSOAIS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setPessoalTitle(item)}
                      className="text-[11px] px-2 py-0.5 rounded-full bg-background border border-border/60 hover:border-primary hover:text-primary transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Título / Identificação do Documento *</Label>
                    <Input
                      value={pessoalTitle}
                      onChange={(e) => setPessoalTitle(e.target.value)}
                      placeholder="Ex: RG com CPF (frente e verso)"
                      className="h-9"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Data de Validade (opcional)</Label>
                    <Input
                      type="date"
                      value={pessoalValidade}
                      onChange={(e) => setPessoalValidade(e.target.value)}
                      className="h-9"
                    />
                  </div>
                </div>

                {/* Seleção do arquivo */}
                <div className="space-y-1.5">
                  <input
                    ref={pessoalInputRef}
                    type="file"
                    accept=".pdf,image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) setPessoalFile(f)
                    }}
                  />
                  <div
                    onClick={() => pessoalInputRef.current?.click()}
                    className={cn(
                      'cursor-pointer border border-dashed rounded-lg p-3 text-center transition-all',
                      pessoalFile
                        ? 'border-emerald-500/50 bg-emerald-500/5 text-emerald-400'
                        : 'border-border/60 hover:border-primary/50 hover:bg-muted/10 text-muted-foreground',
                    )}
                  >
                    {pessoalFile ? (
                      <div className="flex items-center justify-center gap-2 text-xs font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>{pessoalFile.name}</span>
                        <span className="text-muted-foreground text-[11px]">
                          ({(pessoalFile.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 text-xs">
                        <Upload className="w-4 h-4 text-primary" />
                        <span>Clique para selecionar o arquivo (PDF, JPG, PNG)</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowPessoalForm(false)
                      setPessoalTitle('')
                      setPessoalFile(null)
                    }}
                    disabled={busy}
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAddPessoal}
                    disabled={busy || !pessoalTitle.trim() || !pessoalFile}
                    className="gap-1.5"
                  >
                    {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Salvar Documento
                  </Button>
                </div>
              </div>
            )}

            {/* Lista de documentos pessoais */}
            {pessoaisDocs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/60 p-6 text-center text-muted-foreground bg-muted/5">
                <FileText className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm font-medium">Nenhum documento pessoal anexado</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Clique no botão acima para anexar RG, CTPS, CPF ou outros arquivos do colaborador.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {pessoaisDocs.map((doc) => (
                  <DocumentUploadCard
                    key={doc.id}
                    title={doc.nome_arquivo || 'Documento Pessoal'}
                    tipo="Pessoal"
                    fileUrl={doc.url}
                    fileName={doc.nome_arquivo || doc.url.split('/').pop()}
                    validade={doc.validade}
                    status={doc.status || 'Pendente'}
                    busy={busy}
                    onUpload={(file) => handleUpload('Pessoal', file)}
                    onDelete={() => handleDelete(doc)}
                    onUpdateValidade={(val) => handleUpdateValidade(doc.id, val)}
                    onToggleStatus={(st) => handleStatus(doc.id, st)}
                  />
                ))}
              </div>
            )}
          </div>
        </SectionCard>
      )}

      {/* SEÇÃO: EVENTOS DO ESOCIAL / SST (S-2240 e S-2220) */}
      {(filterSection === 'all' || filterSection === 'esocial') && (
        <SectionCard title="eSocial & Eventos SST (S-2240 e S-2220)" icon={FileCheck2}>
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Arquivos de recibo dos eventos de Segurança e Saúde no Trabalho enviados ao eSocial.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* S-2240 */}
              <DocumentUploadCard
                title="Evento S-2240"
                subtitle="Condições Ambientais do Trabalho - Fatores de Risco"
                tipo="S2240"
                fileUrl={s2240Doc?.url}
                fileName={s2240Doc?.nome_arquivo || s2240Doc?.url?.split('/').pop()}
                validade={s2240Doc?.validade}
                status={s2240Doc?.status || 'Pendente'}
                required
                busy={busy}
                onUpload={(file) => handleUpload('S2240', file)}
                onDelete={s2240Doc ? () => handleDelete(s2240Doc) : undefined}
                onUpdateValidade={
                  s2240Doc ? (val) => handleUpdateValidade(s2240Doc.id, val) : undefined
                }
                onToggleStatus={s2240Doc ? (st) => handleStatus(s2240Doc.id, st) : undefined}
              />

              {/* S-2220 */}
              <DocumentUploadCard
                title="Evento S-2220"
                subtitle="Monitoramento da Saúde do Trabalhador (ASO e Exames)"
                tipo="S2220"
                fileUrl={s2220Doc?.url}
                fileName={s2220Doc?.nome_arquivo || s2220Doc?.url?.split('/').pop()}
                validade={s2220Doc?.validade}
                status={s2220Doc?.status || 'Pendente'}
                required
                busy={busy}
                onUpload={(file) => handleUpload('S2220', file)}
                onDelete={s2220Doc ? () => handleDelete(s2220Doc) : undefined}
                onUpdateValidade={
                  s2220Doc ? (val) => handleUpdateValidade(s2220Doc.id, val) : undefined
                }
                onToggleStatus={s2220Doc ? (st) => handleStatus(s2220Doc.id, st) : undefined}
              />
            </div>
          </div>
        </SectionCard>
      )}

      {/* SEÇÃO: RECIBOS SST / CAT */}
      {(filterSection === 'all' || filterSection === 'cat') && (
        <SectionCard title="CAT - Comunicação de Acidente de Trabalho" icon={FolderOpen}>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className="text-xs text-muted-foreground">
                Registro e upload do comprovante da CAT enviada para a Previdência Social.
              </p>
              {!showCatForm && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs h-8 border-primary/30 text-primary hover:bg-primary/10"
                  onClick={() => setShowCatForm(true)}
                  disabled={busy}
                >
                  <Plus className="w-3.5 h-3.5" /> Registrar CAT
                </Button>
              )}
            </div>

            {showCatForm && (
              <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary">Registrar Nova CAT</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => setShowCatForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Tipo de Acidente</Label>
                    <Select
                      value={catForm.tipo}
                      onValueChange={(v) => setCatForm((p) => ({ ...p, tipo: v }))}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACIDENTE">Acidente Típico / Trajeto</SelectItem>
                        <SelectItem value="DOENCA">Doença Profissional</SelectItem>
                        <SelectItem value="OUTRO">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Número da CAT / Protocolo</Label>
                    <Input
                      value={catForm.numero}
                      onChange={(e) => setCatForm((p) => ({ ...p, numero: e.target.value }))}
                      placeholder="Ex: 2024.12345.678"
                      className="h-9"
                    />
                  </div>
                </div>

                {/* Upload do Arquivo da CAT */}
                <div className="space-y-1.5">
                  <input
                    ref={catInputRef}
                    type="file"
                    accept=".pdf,image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) setCatForm((p) => ({ ...p, file: f }))
                    }}
                  />
                  <div
                    onClick={() => catInputRef.current?.click()}
                    className={cn(
                      'cursor-pointer border border-dashed rounded-lg p-3 text-center transition-all',
                      catForm.file
                        ? 'border-emerald-500/50 bg-emerald-500/5 text-emerald-400'
                        : 'border-border/60 hover:border-primary/50 hover:bg-muted/10 text-muted-foreground',
                    )}
                  >
                    {catForm.file ? (
                      <div className="flex items-center justify-center gap-2 text-xs font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>{catForm.file.name}</span>
                        <span className="text-muted-foreground text-[11px]">
                          ({(catForm.file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 text-xs">
                        <Upload className="w-4 h-4 text-primary" />
                        <span>Clique para anexar o PDF da CAT (opcional)</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowCatForm(false)}
                    disabled={busy}
                  >
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSaveCAT} disabled={busy} className="gap-1.5">
                    {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Salvar CAT
                  </Button>
                </div>
              </div>
            )}

            {cats.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/60 p-6 text-center text-muted-foreground bg-muted/5">
                <FolderOpen className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm font-medium">Nenhuma CAT registrada</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Não há registros de Comunicação de Acidente de Trabalho para este colaborador.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {cats.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between gap-3 flex-wrap p-3 rounded-xl border border-border/60 bg-card/70 hover:border-border transition-all"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className="text-xs border-amber-500/40 text-amber-400 bg-amber-500/10"
                        >
                          CAT: {c.tipo}
                        </Badge>
                        {c.numero && (
                          <span className="text-xs font-mono font-medium text-foreground">
                            Nº {c.numero}
                          </span>
                        )}
                      </div>
                      {c.created_at && (
                        <p className="text-[11px] text-muted-foreground">
                          Registrada em: {new Date(c.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {c.arquivo_url && (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 text-xs border-border/60"
                            onClick={() => handleViewUrl(c.arquivo_url)}
                            title="Visualizar arquivo da CAT"
                          >
                            <Eye className="w-3.5 h-3.5 text-primary" /> Visualizar
                          </Button>
                          <DownloadButton path={c.arquivo_url} disabled={busy} title="Baixar CAT" />
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        disabled={busy}
                        onClick={() => handleDeleteCAT(c)}
                        title="Excluir CAT"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SectionCard>
      )}
    </div>
  )
}
