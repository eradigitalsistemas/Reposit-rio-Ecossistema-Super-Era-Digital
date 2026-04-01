import { useState, useEffect } from 'react'
import { Plus, X, ListChecks, Pencil, Trash2, Eye, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import useDemandStore from '@/stores/useDemandStore'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'

type Mode = 'list' | 'create' | 'edit' | 'view'

export function ChecklistBuilderModal() {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>('list')
  const [loading, setLoading] = useState(false)

  const [currentId, setCurrentId] = useState<string | null>(null)
  const [nome, setNome] = useState('')
  const [itens, setItens] = useState<string[]>([''])

  const { checklistTemplates, addChecklistTemplate, fetchChecklistTemplates } = useDemandStore()

  useEffect(() => {
    if (open) {
      fetchChecklistTemplates()
      setMode('list')
    }
  }, [open, fetchChecklistTemplates])

  const handleAddItem = () => setItens([...itens, ''])

  const handleItemChange = (index: number, value: string) => {
    const newItens = [...itens]
    newItens[index] = value
    setItens(newItens)
  }

  const handleRemoveItem = (index: number) => {
    if (itens.length > 1) {
      setItens(itens.filter((_, i) => i !== index))
    }
  }

  const resetForm = () => {
    setNome('')
    setItens([''])
    setCurrentId(null)
  }

  const handleCreateNew = () => {
    resetForm()
    setMode('create')
  }

  const handleEdit = (template: any) => {
    setCurrentId(template.id)
    setNome(template.nome)
    setItens(template.itens || [''])
    setMode('edit')
  }

  const handleView = (template: any) => {
    setCurrentId(template.id)
    setNome(template.nome)
    setItens(template.itens || [''])
    setMode('view')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este modelo?')) return
    setLoading(true)
    const { error } = await supabase.from('checklist_templates').delete().eq('id', id)
    if (error) {
      toast({ title: 'Erro', description: 'Erro ao excluir modelo.', variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Modelo excluído com sucesso.' })
      await fetchChecklistTemplates()
    }
    setLoading(false)
  }

  const handleSave = async () => {
    const filteredItens = itens.filter((i) => i.trim() !== '')
    if (!nome.trim()) {
      toast({ title: 'Aviso', description: 'Dê um nome ao checklist', variant: 'destructive' })
      return
    }
    if (filteredItens.length === 0) {
      toast({ title: 'Aviso', description: 'Adicione pelo menos um item', variant: 'destructive' })
      return
    }

    setLoading(true)

    if (mode === 'create') {
      await addChecklistTemplate(nome, filteredItens)
      toast({ title: 'Sucesso', description: 'Modelo criado com sucesso.' })
    } else if (mode === 'edit' && currentId) {
      const { error } = await supabase
        .from('checklist_templates')
        .update({ nome, itens: filteredItens })
        .eq('id', currentId)

      if (error) {
        toast({ title: 'Erro', description: 'Erro ao atualizar modelo.', variant: 'destructive' })
      } else {
        toast({ title: 'Sucesso', description: 'Modelo atualizado com sucesso.' })
      }
      await fetchChecklistTemplates()
    }

    setLoading(false)
    setMode('list')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 h-11 sm:h-10 bg-white border-gray-400 text-black hover:bg-gray-50 dark:bg-card dark:border-border dark:text-white dark:hover:bg-accent shadow-sm w-full sm:w-auto"
        >
          <ListChecks className="w-5 h-5 sm:w-4 sm:h-4" />
          <span className="sm:inline font-bold">Gerenciar Checklists</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="w-[95vw] sm:max-w-[550px] max-h-[90vh] flex flex-col"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="shrink-0">
          <div className="flex items-center gap-2">
            {mode !== 'list' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMode('list')}
                className="h-8 w-8 -ml-2 shrink-0"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            <DialogTitle className="text-black dark:text-white">
              {mode === 'list' && 'Gerenciador de Checklists'}
              {mode === 'create' && 'Novo Modelo de Checklist'}
              {mode === 'edit' && 'Editar Modelo de Checklist'}
              {mode === 'view' && 'Visualizar Modelo'}
            </DialogTitle>
          </div>
          <DialogDescription>
            {mode === 'list' && 'Gerencie seus modelos de checklist para uso em demandas.'}
            {mode === 'create' && 'Crie um novo modelo reutilizável.'}
            {mode === 'edit' && 'Altere os passos do seu modelo existente.'}
            {mode === 'view' && 'Detalhes do modelo de checklist.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 pr-1 min-h-[300px]">
          {mode === 'list' && (
            <div className="space-y-4">
              <Button
                onClick={handleCreateNew}
                className="w-full gap-2 border-dashed border-gray-400 bg-transparent text-foreground hover:bg-muted"
                variant="outline"
              >
                <Plus className="w-4 h-4" /> Novo Checklist
              </Button>

              <div className="space-y-2 mt-4">
                {checklistTemplates.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm py-8">
                    Nenhum modelo cadastrado.
                  </p>
                ) : (
                  checklistTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="flex items-center justify-between p-3 border border-gray-200 dark:border-white/10 rounded-md bg-white dark:bg-card shadow-sm"
                    >
                      <span className="font-medium text-sm text-black dark:text-white truncate pr-2">
                        {template.nome}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                          onClick={() => handleView(template)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                          onClick={() => handleEdit(template)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                          onClick={() => handleDelete(template.id)}
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {(mode === 'create' || mode === 'edit') && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="nome" className="text-black dark:text-white font-medium">
                  Nome do Modelo *
                </Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Processo Certificado Digital"
                  className="bg-white border-gray-400 text-black dark:bg-black dark:border-white/10 dark:text-white h-11 sm:h-10"
                  disabled={loading}
                />
              </div>

              <div className="grid gap-2">
                <Label className="text-black dark:text-white font-medium">Etapas</Label>
                <div className="space-y-2">
                  {itens.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={item}
                        onChange={(e) => handleItemChange(index, e.target.value)}
                        placeholder={`Passo ${index + 1}`}
                        className="bg-white border-gray-400 text-black dark:bg-black dark:border-white/10 dark:text-white h-11 sm:h-10"
                        disabled={loading}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(index)}
                        disabled={itens.length === 1 || loading}
                        className="shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleAddItem}
                  disabled={loading}
                  className="w-full mt-2 border border-dashed border-gray-400 text-black hover:bg-gray-50 dark:border-white/20 dark:text-white dark:hover:bg-white/5"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Passo
                </Button>
              </div>
            </div>
          )}

          {mode === 'view' && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                  Nome do Modelo
                </Label>
                <div className="font-medium text-base text-black dark:text-white">{nome}</div>
              </div>
              <div className="grid gap-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                  Etapas
                </Label>
                <div className="space-y-2">
                  {itens.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-2 border border-gray-200 dark:border-white/10 rounded-md bg-gray-50 dark:bg-muted/30"
                    >
                      <div className="mt-0.5 min-w-[20px] text-xs font-bold text-muted-foreground">
                        {index + 1}.
                      </div>
                      <div className="text-sm text-black dark:text-white">{item}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0 mt-4">
          {mode === 'list' && (
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              className="w-full sm:w-auto h-11 sm:h-10 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-white/10"
            >
              Fechar
            </Button>
          )}

          {(mode === 'create' || mode === 'edit') && (
            <>
              <Button
                variant="ghost"
                onClick={() => setMode('list')}
                disabled={loading}
                className="w-full sm:w-auto h-11 sm:h-10 mb-2 sm:mb-0 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-white/10"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading}
                className="w-full sm:w-auto h-11 sm:h-10 text-white font-bold bg-black dark:bg-primary hover:bg-black/90 dark:hover:bg-primary/90"
              >
                {loading ? 'Salvando...' : 'Salvar Modelo'}
              </Button>
            </>
          )}

          {mode === 'view' && (
            <Button
              variant="default"
              onClick={() => setMode('list')}
              className="w-full sm:w-auto h-11 sm:h-10 text-white font-bold bg-black dark:bg-primary hover:bg-black/90 dark:hover:bg-primary/90"
            >
              Voltar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
