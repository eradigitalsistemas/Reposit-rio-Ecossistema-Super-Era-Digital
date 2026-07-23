import { useState } from 'react'
import { Loader2, Building2 } from 'lucide-react'
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
import { cn } from '@/lib/utils'
import { formatCNPJ, isValidCNPJ } from '@/lib/utils/cnpj'
import { formatCPF, isValidCPF } from '@/lib/utils/cpf'
import { type CredentialEntry, type CompanyInfo } from '@/services/company-documents'
import { CredentialVault } from '@/components/company-documents/CredentialVault'

interface NewCompanyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (data: {
    empresa: string
    cnpj: string
    cpf_socio: string
    responsavel: string
    telefone: string
    email: string
    senhas_acesso: CredentialEntry[]
  }) => Promise<CompanyInfo>
}

export function NewCompanyDialog({ open, onOpenChange, onCreate }: NewCompanyDialogProps) {
  const [formData, setFormData] = useState({
    empresa: '',
    cnpj: '',
    cpf_socio: '',
    responsavel: '',
    telefone: '',
    email: '',
  })
  const [credentials, setCredentials] = useState<CredentialEntry[]>([])
  const [cnpjError, setCnpjError] = useState('')
  const [cpfError, setCpfError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.cnpj && !isValidCNPJ(formData.cnpj)) {
      setCnpjError('CNPJ inválido')
      return
    }
    setCnpjError('')
    if (formData.cpf_socio && !isValidCPF(formData.cpf_socio)) {
      setCpfError('CPF inválido')
      return
    }
    setCpfError('')
    setSaving(true)
    try {
      await onCreate({ ...formData, senhas_acesso: credentials })
      setFormData({
        empresa: '',
        cnpj: '',
        cpf_socio: '',
        responsavel: '',
        telefone: '',
        email: '',
      })
      setCredentials([])
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" /> Nova Empresa
          </DialogTitle>
          <DialogDescription>Cadastre uma nova empresa no sistema.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-empresa">Nome da Empresa *</Label>
            <Input
              id="new-empresa"
              value={formData.empresa}
              required
              onChange={(e) => setFormData((p) => ({ ...p, empresa: e.target.value }))}
              className="bg-background/50 border-border/50"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="new-cnpj">CNPJ</Label>
              <Input
                id="new-cnpj"
                value={formData.cnpj}
                onChange={(e) => setFormData((p) => ({ ...p, cnpj: formatCNPJ(e.target.value) }))}
                placeholder="00.000.000/0000-00"
                className={cn(
                  'bg-background/50 border-border/50',
                  cnpjError && 'border-destructive',
                )}
              />
              {cnpjError && <p className="text-xs text-destructive">{cnpjError}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-cpf">CPF do Sócio Administrador</Label>
              <Input
                id="new-cpf"
                value={formData.cpf_socio}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, cpf_socio: formatCPF(e.target.value) }))
                }
                placeholder="000.000.000-00"
                className={cn(
                  'bg-background/50 border-border/50',
                  cpfError && 'border-destructive',
                )}
              />
              {cpfError && <p className="text-xs text-destructive">{cpfError}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-responsavel">Responsável</Label>
            <Input
              id="new-responsavel"
              value={formData.responsavel}
              onChange={(e) => setFormData((p) => ({ ...p, responsavel: e.target.value }))}
              className="bg-background/50 border-border/50"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="new-telefone">Telefone</Label>
              <Input
                id="new-telefone"
                value={formData.telefone}
                onChange={(e) => setFormData((p) => ({ ...p, telefone: e.target.value }))}
                className="bg-background/50 border-border/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-email">Email</Label>
              <Input
                id="new-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                className="bg-background/50 border-border/50"
              />
            </div>
          </div>
          <CredentialVault credentials={credentials} onCredentialsChange={setCredentials} />
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Criar Empresa
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
