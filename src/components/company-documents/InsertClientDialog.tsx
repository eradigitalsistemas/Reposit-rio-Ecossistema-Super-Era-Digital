import { useState, useEffect, useCallback } from 'react'
import { Loader2, AlertTriangle, ExternalLink } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  checkClientByCnpj,
  createClientFromCompany,
  updateClientFromCompany,
  type CompanyInfo,
} from '@/services/company-documents'
import { useToast } from '@/hooks/use-toast'
import { Link } from 'react-router-dom'

type Step = 'checking' | 'duplicate' | 'form' | 'success'

interface InsertClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  company: CompanyInfo | null
}

export function InsertClientDialog({ open, onOpenChange, company }: InsertClientDialogProps) {
  const { toast } = useToast()
  const [step, setStep] = useState<Step>('checking')
  const [existingClient, setExistingClient] = useState<{ id: string; nome: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const [savedClientId, setSavedClientId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    empresa: '',
    cnpj: '',
    email: '',
    telefone: '',
  })

  const reset = useCallback(() => {
    setStep('checking')
    setExistingClient(null)
    setSavedClientId(null)
    setSaving(false)
  }, [])

  useEffect(() => {
    if (!open || !company) return
    setFormData({
      nome: company.empresa || '',
      empresa: company.empresa || '',
      cnpj: company.cnpj || '',
      email: company.email || '',
      telefone: company.telefone || '',
    })
    reset()

    const check = async () => {
      if (!company.cnpj) {
        setStep('form')
        return
      }
      try {
        const existing = await checkClientByCnpj(company.cnpj)
        if (existing) {
          setExistingClient(existing)
          setStep('duplicate')
        } else {
          setStep('form')
        }
      } catch {
        setStep('form')
      }
    }
    check()
  }, [open, company, reset])

  const handleSave = async () => {
    setSaving(true)
    try {
      if (existingClient) {
        await updateClientFromCompany(existingClient.id, formData)
        setSavedClientId(existingClient.id)
      } else {
        const id = await createClientFromCompany(formData)
        setSavedClientId(id)
      }
      toast({ title: 'Sucesso', description: 'Cliente inserido com sucesso!' })
      setStep('success')
    } catch {
      toast({ title: 'Erro', description: 'Falha ao salvar cliente.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const update = (k: string, v: string) => setFormData((p) => ({ ...p, [k]: v }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        {step === 'checking' && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}

        {step === 'duplicate' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                Cliente Duplicado
              </DialogTitle>
            </DialogHeader>
            <Alert>
              <AlertDescription>
                Cliente já cadastrado com este CNPJ: <strong>{existingClient?.nome}</strong>. Deseja
                associar os documentos a este cliente?
              </AlertDescription>
            </Alert>
            <DialogFooter>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setStep('form')}>Associar</Button>
            </DialogFooter>
          </>
        )}

        {step === 'form' && (
          <>
            <DialogHeader>
              <DialogTitle>
                {existingClient ? 'Associar Cliente' : 'Inserir como Cliente'}
              </DialogTitle>
              <DialogDescription>Revise e edite os dados antes de salvar.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="cli-nome">Nome</Label>
                <Input
                  id="cli-nome"
                  value={formData.nome}
                  onChange={(e) => update('nome', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cli-empresa">Empresa</Label>
                <Input
                  id="cli-empresa"
                  value={formData.empresa}
                  onChange={(e) => update('empresa', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cli-cnpj">CNPJ</Label>
                  <Input
                    id="cli-cnpj"
                    value={formData.cnpj}
                    onChange={(e) => update('cnpj', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cli-telefone">Telefone</Label>
                  <Input
                    id="cli-telefone"
                    value={formData.telefone}
                    onChange={(e) => update('telefone', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cli-email">Email</Label>
                <Input
                  id="cli-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => update('email', e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Salvar Cliente
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'success' && (
          <>
            <DialogHeader>
              <DialogTitle>Cliente inserido com sucesso!</DialogTitle>
              <DialogDescription>
                O cliente foi {existingClient ? 'atualizado' : 'criado'} com os dados da empresa.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
              {savedClientId && (
                <Button asChild>
                  <Link to={`/clientes/${savedClientId}`}>
                    Ver Cliente <ExternalLink className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
