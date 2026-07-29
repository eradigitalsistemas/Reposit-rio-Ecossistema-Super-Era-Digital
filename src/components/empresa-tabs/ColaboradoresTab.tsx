import { useState, useEffect, useCallback } from 'react'
import { Loader2, UserPlus, Users, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { formatCPF } from '@/lib/utils/cpf'
import {
  fetchColaboradoresByEmpresaId,
  createColaboradorForEmpresa,
  type ColaboradorSimples,
} from '@/services/empresas'
import { ColaboradorDocSections } from '@/components/empresa-tabs/colaborador/ColaboradorDocSections'
import { ColaboradorHealthSections } from '@/components/empresa-tabs/colaborador/ColaboradorHealthSections'
import { ColaboradorDossierButton } from '@/components/empresa-tabs/ColaboradorDossierButton'
import { ImportColaboradoresDialog } from '@/components/empresa-tabs/ImportColaboradoresDialog'
import { RescisaoTab } from '@/components/empresa-tabs/RescisaoTab'

export function ColaboradoresTab({ empresaId }: { empresaId: string }) {
  const { toast } = useToast()
  const [colaboradores, setColaboradores] = useState<ColaboradorSimples[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [saving, setSaving] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [subTab, setSubTab] = useState('documentos')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setColaboradores(await fetchColaboradoresByEmpresaId(empresaId))
    } catch {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar colaboradores.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [empresaId, toast])

  useEffect(() => {
    load()
  }, [load])

  const handleCreate = async () => {
    if (!nome.trim()) return
    setSaving(true)
    try {
      const created = await createColaboradorForEmpresa(empresaId, { nome: nome.trim(), cpf })
      toast({ title: 'Sucesso', description: 'Colaborador criado.' })
      setColaboradores((prev) => [...prev, created])
      setSelectedId(created.id)
      setNome('')
      setCpf('')
      setDialogOpen(false)
    } catch {
      toast({ title: 'Erro', description: 'Falha ao criar colaborador.', variant: 'destructive' })
    } finally {
      setSaving(false)
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
      <Tabs value={subTab} onValueChange={setSubTab}>
        <div className="flex items-center gap-2 flex-wrap">
          <TabsList className="grid grid-cols-2 w-[280px]">
            <TabsTrigger value="documentos">Documentos</TabsTrigger>
            <TabsTrigger value="rescisao">Rescisão</TabsTrigger>
          </TabsList>
          <Button variant="outline" className="gap-1.5" onClick={() => setDialogOpen(true)}>
            <UserPlus className="w-4 h-4" /> Novo Colaborador
          </Button>
          <Button variant="outline" className="gap-1.5" onClick={() => setImportOpen(true)}>
            <Upload className="w-4 h-4" /> Importar Relatório
          </Button>
        </div>

        <TabsContent value="documentos" className="mt-4 space-y-6">
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

          {selectedId ? (
            <>
              <div className="flex justify-end">
                <ColaboradorDossierButton
                  colaboradorId={selectedId}
                  colaboradorNome={colaboradores.find((c) => c.id === selectedId)?.nome || ''}
                />
              </div>
              <ColaboradorDocSections colaboradorId={selectedId} />
              <ColaboradorHealthSections
                colaboradorId={selectedId}
                colaboradorNome={colaboradores.find((c) => c.id === selectedId)?.nome || ''}
              />
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-20" />
              <p className="text-sm">
                Selecione ou crie um colaborador para gerenciar seus documentos.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="rescisao" className="mt-4">
          <RescisaoTab empresaId={empresaId} />
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Novo Colaborador</DialogTitle>
            <DialogDescription>Cadastre um colaborador vinculado a esta empresa.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="colab-nome">Nome *</Label>
              <Input
                id="colab-nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="colab-cpf">CPF</Label>
              <Input
                id="colab-cpf"
                value={cpf}
                onChange={(e) => setCpf(formatCPF(e.target.value))}
                placeholder="000.000.000-00"
                maxLength={14}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={saving || !nome.trim()} className="gap-1.5">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ImportColaboradoresDialog
        empresaId={empresaId}
        open={importOpen}
        onOpenChange={setImportOpen}
        onImported={load}
      />
    </div>
  )
}
