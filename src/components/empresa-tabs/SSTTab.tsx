import { useState, useEffect, useCallback } from 'react'
import { Loader2, Trash2, Plus, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { SectionCard, FileUploadButton, DownloadButton } from '@/components/empresa-tabs/shared'
import {
  fetchSSTDocs,
  createSSTDoc,
  deleteSSTDoc,
  type SSTDoc,
  type SSTCategoria,
} from '@/services/empresa-sst'
import { getExpiryStatus, getStatusConfig } from '@/lib/document-status'

const CATEGORIAS: { value: SSTCategoria; label: string }[] = [
  { value: 'PGR', label: 'PGR' },
  { value: 'NR1', label: 'NR-1' },
  { value: 'LTCAT', label: 'LTCAT' },
  { value: 'PCMSO', label: 'PCMSO' },
]

export function SSTTab({ empresaId }: { empresaId: string }) {
  const { toast } = useToast()
  const [docs, setDocs] = useState<SSTDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [openCat, setOpenCat] = useState<SSTCategoria | null>(null)
  const [form, setForm] = useState({ emissao: '', validade: '' })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setDocs(await fetchSSTDocs(empresaId))
    } catch {
      toast({ title: 'Erro', description: 'Falha ao carregar SST.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [empresaId, toast])

  useEffect(() => {
    load()
  }, [load])

  const handleSave = async (cat: SSTCategoria) => {
    if (!selectedFile) {
      toast({ title: 'Aviso', description: 'Selecione um arquivo.' })
      return
    }
    setSaving(true)
    try {
      await createSSTDoc(empresaId, cat, selectedFile, form.emissao, form.validade)
      toast({ title: 'Sucesso', description: 'Documento adicionado.' })
      setSelectedFile(null)
      setForm({ emissao: '', validade: '' })
      setOpenCat(null)
      await load()
    } catch {
      toast({ title: 'Erro', description: 'Falha ao salvar.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (doc: SSTDoc) => {
    try {
      await deleteSSTDoc(doc)
      setDocs((prev) => prev.filter((d) => d.id !== doc.id))
      toast({ title: 'Sucesso', description: 'Documento removido.' })
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
      {CATEGORIAS.map(({ value, label }) => {
        const catDocs = docs.filter((d) => d.categoria === value)
        return (
          <SectionCard key={value} title={label} icon={ShieldCheck}>
            {catDocs.length > 0 && (
              <div className="space-y-2 mb-3">
                {catDocs.map((doc) => {
                  const status = getExpiryStatus(doc.data_validade)
                  const cfg = getStatusConfig(status)
                  return (
                    <div
                      key={doc.id}
                      className="flex items-center gap-2 text-xs flex-wrap p-2 rounded border border-border/40 bg-background/20"
                    >
                      <span className="truncate flex-1 min-w-0">
                        {doc.arquivo_url?.split('/').pop() || 'Sem arquivo'}
                      </span>
                      <span className="text-muted-foreground">
                        Emissão:{' '}
                        {doc.data_emissao
                          ? new Date(doc.data_emissao).toLocaleDateString('pt-BR')
                          : '—'}
                      </span>
                      <span className="text-muted-foreground">
                        Validade:{' '}
                        {doc.data_validade
                          ? new Date(doc.data_validade).toLocaleDateString('pt-BR')
                          : '—'}
                      </span>
                      {doc.data_validade && (
                        <Badge variant="outline" className={`text-[10px] ${cfg.badgeClass}`}>
                          {cfg.label}
                        </Badge>
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
            {openCat === value ? (
              <div className="space-y-3 p-3 rounded border border-border/50 bg-background/30">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Data de Emissão</Label>
                    <Input
                      type="date"
                      value={form.emissao}
                      onChange={(e) => setForm((p) => ({ ...p, emissao: e.target.value }))}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Data de Validade</Label>
                    <Input
                      type="date"
                      value={form.validade}
                      onChange={(e) => setForm((p) => ({ ...p, validade: e.target.value }))}
                      className="h-9"
                    />
                  </div>
                </div>
                <FileUploadButton
                  onFile={setSelectedFile}
                  label={selectedFile ? selectedFile.name : 'Selecionar PDF'}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    disabled={saving || !selectedFile}
                    onClick={() => handleSave(value)}
                    className="gap-1.5"
                  >
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Salvar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setOpenCat(null)
                      setSelectedFile(null)
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
                className="gap-1.5"
                onClick={() => {
                  setOpenCat(value)
                  setSelectedFile(null)
                  setForm({ emissao: '', validade: '' })
                }}
              >
                <Plus className="w-4 h-4" /> Adicionar Documento
              </Button>
            )}
          </SectionCard>
        )
      })}
    </div>
  )
}
