import { useCandidateStore } from '@/stores/useCandidateStore'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { AlertCircle } from 'lucide-react'

export function ConvertCandidateDialog() {
  const { selectedCandidate, isConvertOpen, setConvertOpen, convertToEmployee } =
    useCandidateStore()
  const [formData, setFormData] = useState({
    cpf: '',
    rg: '',
    salary: '',
    hire_date: new Date().toISOString().split('T')[0],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!selectedCandidate) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.cpf.replace(/\D/g, '').length !== 11) {
      setError('CPF inválido. Digite 11 números.')
      return
    }

    setIsSubmitting(true)
    try {
      await convertToEmployee(selectedCandidate.id, {
        cpf: formData.cpf.replace(/\D/g, ''),
        rg: formData.rg || null,
        salary: Number(formData.salary),
        hire_date: formData.hire_date,
      })
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar conversão')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isConvertOpen} onOpenChange={setConvertOpen}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Converter para Colaborador</DialogTitle>
          <DialogDescription className="mt-2">
            Confirme os dados para a contratação de{' '}
            <strong className="text-foreground">{selectedCandidate.name}</strong> no sistema.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-start gap-2 text-sm mt-2 border border-destructive/20">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="space-y-2">
            <Label htmlFor="cpf">
              CPF <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cpf"
              required
              placeholder="Apenas números"
              value={formData.cpf}
              onChange={(e) => setFormData((p) => ({ ...p, cpf: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rg">RG</Label>
            <Input
              id="rg"
              placeholder="Opcional"
              value={formData.rg}
              onChange={(e) => setFormData((p) => ({ ...p, rg: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary">
                Salário Base (R$) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="salary"
                type="number"
                required
                min="0"
                step="0.01"
                placeholder="Ex: 5000.00"
                value={formData.salary}
                onChange={(e) => setFormData((p) => ({ ...p, salary: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hire_date">
                Data de Contratação <span className="text-destructive">*</span>
              </Label>
              <Input
                id="hire_date"
                type="date"
                required
                value={formData.hire_date}
                onChange={(e) => setFormData((p) => ({ ...p, hire_date: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <Button type="button" variant="outline" onClick={() => setConvertOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Processando...' : 'Efetivar Contratação'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
