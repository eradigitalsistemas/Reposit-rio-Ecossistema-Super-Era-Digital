import { useState, useEffect, useCallback } from 'react'
import { Loader2, UserCheck } from 'lucide-react'
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
import { fetchColaboradoresByEmpresaId, type ColaboradorSimples } from '@/services/empresas'
import {
  fetchRescisaoChecklist,
  upsertRescisaoItem,
  RESCISAO_ITEMS,
  type RescisaoItem,
} from '@/services/empresa-rescisao'

export function RescisaoTab({ empresaId }: { empresaId: string }) {
  const { toast } = useToast()
  const [colaboradores, setColaboradores] = useState<ColaboradorSimples[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [items, setItems] = useState<RescisaoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetchColaboradoresByEmpresaId(empresaId)
      .then(setColaboradores)
      .catch(() =>
        toast({
          title: 'Erro',
          description: 'Falha ao carregar colaboradores.',
          variant: 'destructive',
        }),
      )
      .finally(() => setLoading(false))
  }, [empresaId, toast])

  const loadItems = useCallback(async () => {
    if (!selectedId) return
    try {
      setItems(await fetchRescisaoChecklist(empresaId, selectedId))
    } catch {
      toast({ title: 'Erro', description: 'Falha ao carregar checklist.', variant: 'destructive' })
    }
  }, [empresaId, selectedId, toast])

  useEffect(() => {
    if (selectedId) loadItems()
  }, [loadItems])

  const handleStatus = async (item: string, status: string) => {
    setBusy(true)
    try {
      await upsertRescisaoItem(empresaId, selectedId, item, { status })
      await loadItems()
    } catch {
      toast({ title: 'Erro', description: 'Falha ao atualizar.', variant: 'destructive' })
    } finally {
      setBusy(false)
    }
  }

  const handleFile = async (item: string, file: File) => {
    setBusy(true)
    try {
      await upsertRescisaoItem(empresaId, selectedId, item, { file })
      toast({ title: 'Sucesso', description: 'Arquivo enviado.' })
      await loadItems()
    } catch {
      toast({ title: 'Erro', description: 'Falha no upload.', variant: 'destructive' })
    } finally {
      setBusy(false)
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
      <Select value={selectedId} onValueChange={setSelectedId}>
        <SelectTrigger className="w-full sm:w-[300px]">
          <SelectValue placeholder="Selecione um colaborador" />
        </SelectTrigger>
        <SelectContent>
          {colaboradores.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedId && (
        <div className="space-y-3">
          {RESCISAO_ITEMS.map(({ value, label }) => {
            const item = items.find((i) => i.item === value)
            return (
              <SectionCard key={value} title={label} icon={UserCheck}>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <StatusToggle
                    status={item?.status || 'Pendente'}
                    onChange={(s) => handleStatus(value, s)}
                    disabled={busy}
                  />
                  <div className="flex items-center gap-2">
                    {item?.arquivo_url && (
                      <DownloadButton path={item.arquivo_url} disabled={busy} />
                    )}
                    <FileUploadButton
                      onFile={(f) => handleFile(value, f)}
                      label={item?.arquivo_url ? 'Substituir' : 'Enviar'}
                      disabled={busy}
                    />
                  </div>
                </div>
              </SectionCard>
            )
          })}
        </div>
      )}

      {colaboradores.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          Nenhum colaborador vinculado a esta empresa.
        </p>
      )}
    </div>
  )
}
