import { useState, useEffect } from 'react'
import { Save, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { formatCNPJ, isValidCNPJ } from '@/lib/utils/cnpj'
import { formatCPF, isValidCPF } from '@/lib/utils/cpf'
import { type CompanyInfo, type CredentialEntry } from '@/services/company-documents'
import { CredentialVault } from '@/components/company-documents/CredentialVault'

const EMPTY_CREDENTIALS: CredentialEntry[] = Array.from({ length: 6 }, () => ({
  identificacao: '',
  senha: '',
}))

interface CompanyFormData {
  empresa: string
  cnpj: string
  cpf_socio: string
  responsavel: string
  telefone: string
  email: string
  senhas_acesso: CredentialEntry[]
}

interface CompanyInfoFormProps {
  company: CompanyInfo | null
  onSave: (data: CompanyFormData) => Promise<void>
}

export function CompanyInfoForm({ company, onSave }: CompanyInfoFormProps) {
  const [formData, setFormData] = useState({
    empresa: '',
    cnpj: '',
    cpf_socio: '',
    responsavel: '',
    telefone: '',
    email: '',
  })
  const [credentials, setCredentials] = useState<CredentialEntry[]>([...EMPTY_CREDENTIALS])
  const [visiblePasswords, setVisiblePasswords] = useState<Record<number, boolean>>({})
  const [cnpjError, setCnpjError] = useState('')
  const [cpfError, setCpfError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (company) {
      setFormData({
        empresa: company.empresa,
        cnpj: company.cnpj,
        cpf_socio: company.cpf_socio,
        responsavel: company.responsavel,
        telefone: company.telefone,
        email: company.email,
      })
      setCredentials(
        company.senhas_acesso.length === 6 ? company.senhas_acesso : [...EMPTY_CREDENTIALS],
      )
    }
  }, [company])

  const handleCredentialChange = (
    index: number,
    field: 'identificacao' | 'senha',
    value: string,
  ) => {
    setCredentials((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const togglePasswordVisibility = (index: number) => {
    setVisiblePasswords((prev) => ({ ...prev, [index]: !prev[index] }))
  }

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
      await onSave({ ...formData, senhas_acesso: credentials })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="bg-card/60 border-border/50 shadow-sm backdrop-blur-sm">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle>Informações da Empresa</CardTitle>
        <CardDescription>Atualize os dados de identificação da empresa.</CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="empresa">Nome da Empresa</Label>
            <Input
              id="empresa"
              value={formData.empresa}
              onChange={(e) => setFormData((p) => ({ ...p, empresa: e.target.value }))}
              required
              className="bg-background/50 border-border/50"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
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
              <Label htmlFor="cpf_socio">CPF do Sócio Administrador</Label>
              <Input
                id="cpf_socio"
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
            <Label htmlFor="responsavel">Responsável</Label>
            <Input
              id="responsavel"
              value={formData.responsavel}
              onChange={(e) => setFormData((p) => ({ ...p, responsavel: e.target.value }))}
              className="bg-background/50 border-border/50"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData((p) => ({ ...p, telefone: e.target.value }))}
                className="bg-background/50 border-border/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                className="bg-background/50 border-border/50"
              />
            </div>
          </div>
          <CredentialVault
            credentials={credentials}
            onCredentialChange={handleCredentialChange}
            visiblePasswords={visiblePasswords}
            onTogglePassword={togglePasswordVisibility}
          />
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={saving} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar Alterações
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
