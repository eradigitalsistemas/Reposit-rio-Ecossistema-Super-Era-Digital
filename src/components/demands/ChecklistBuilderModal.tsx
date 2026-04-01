import { useState } from 'react'
import { Plus, X, ListChecks } from 'lucide-react'
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

export function ChecklistBuilderModal() {
  const [open, setOpen] = useState(false)
  const [nome, setNome] = useState('')
  const [itens, setItens] = useState<string[]>([''])
  const { addChecklistTemplate } = useDemandStore()
  const [loading, setLoading] = useState(false)

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
    await addChecklistTemplate(nome, filteredItens)
    setLoading(false)
    setOpen(false)
    setNome('')
    setItens([''])
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 h-11 sm:h-10 bg-white border-gray-400 text-black hover:bg-gray-50 dark:bg-card dark:border-border dark:text-white dark:hover:bg-accent shadow-sm w-full sm:w-auto"
        >
          <ListChecks className="w-5 h-5 sm:w-4 sm:h-4" />
          <span className="sm:inline font-bold">Criar Checklist</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="w-[95vw] sm:max-w-[500px]"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-black dark:text-white">Construtor de Checklist</DialogTitle>
          <DialogDescription>
            Crie modelos reutilizáveis de checklist para suas demandas.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
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
            <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
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

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={loading}
            className="w-full sm:w-auto h-11 sm:h-10 mb-2 sm:mb-0 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-white/10"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="w-full sm:w-auto h-11 sm:h-10 text-white font-bold bg-black dark:bg-primary"
          >
            {loading ? 'Salvando...' : 'Salvar Modelo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
