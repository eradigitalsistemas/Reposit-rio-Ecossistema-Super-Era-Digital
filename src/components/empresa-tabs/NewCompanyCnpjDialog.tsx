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
import { fetchCnpjData } from '@/services/cnpj-api'
import { createEmpresa } from '@/services/empresas'
import { useToast } from '@/hooks/use-toast'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (id: string) => void
}

const EMPTY_FORM = {
  cnpj: '',
  nome: '',
  empresa: '',
  email: '',
  telefone: '',
  endereco_logradouro: '',
  endereco_numero: '',
  endereco_bairro: '',
  endereco_cep: '',
  endereco_cidade: '',
  endereco_estado: '',
}

export function NewCompanyCnpjDialog({ open, onOpenChange, onCreated }: Props) {
  const { toast } = useToast()
  const [form, setForm] = useState(EMPTY_FORM)
  const [lookingUp, setLookingUp] = useState(false)
  const [lookupError, setLookupError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleCnpjBlur = async () => {
    if (!isValidCNPJ(form.cnpj)) {
      setLookupError('')
      return
    }
    setLookingUp(true)
    setLookupError('')
    const { data, error } = await fetchCnpjData(form.cnpj)
    setLookingUp(false)
    if (error) {
      setLookupError(error)
      return
    }
    if (data) {
      setForm((p) => ({
        ...p,
        nome: data.nome || p.nome,
        empresa: data.fantasia || data.nome || p.empresa,
        email: data.email || p.email,
        telefone: data.telefone || p.telefone,
        endereco_logradouro: data.logradouro || p.endereco_logradouro,
        endereco_numero: data.numero || p.endereco_numero,
        endereco_bairro: data.bairro || p.endereco_bairro,
        endereco_cep: data.cep || p.endereco_cep,
        endereco_cidade: data.municipio || p.endereco_cidade,
        endereco_estado: data.uf || p.endereco_estado,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidCNPJ(form.cnpj)) {
      toast({ title: 'CNPJ inválido', variant: 'destructive' })
      return
    }
    if (!form.nome.trim() || !form.empresa.trim()) {
      toast({ title: 'Nome e Empresa são obrigatórios', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const created = await createEmpresa({
        nome: form.nome.trim(),
        empresa: form.empresa.trim(),
        cnpj: form.cnpj,
        email: form.email || null,
        telefone: form.telefone || null,
        endereco_logradouro: form.endereco_logradouro || null,
        endereco_numero: form.endereco_numero || null,
        endereco_bairro: form.endereco_bairro || null,
        endereco_cep: form.endereco_cep || null,
        endereco_cidade: form.endereco_cidade || null,
        endereco_estado: form.endereco_estado || null,
      })
      toast({ title: 'Empresa criada com sucesso!' })
      setForm(EMPTY_FORM)
      onOpenChange(false)
      onCreated(created.id)
    } catch {
      toast({ title: 'Erro ao criar empresa', variant: 'destructive' })
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
          <DialogDescription>
            Cadastre uma empresa. Informe o CNPJ para preenchimento automático.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="cnpj">CNPJ *</Label>
            <div className="flex gap-2">
              <Input
                id="cnpj"
                value={form.cnpj}
                onChange={(e) => setForm((p) => ({ ...p, cnpj: formatCNPJ(e.target.value) }))}
                onBlur={handleCnpjBlur}
                placeholder="00.000.000/0000-00"
                className={cn('bg-background/50', lookupError && 'border-destructive')}
              />
              {lookingUp && <Loader2 className="w-5 h-5 animate-spin text-primary self-center" />}
            </div>
            {lookupError && <p className="text-xs text-destructive">{lookupError}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={form.nome}
                onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
                required
                className="bg-background/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="empresa">Empresa *</Label>
              <Input
                id="empresa"
                value={form.empresa}
                onChange={(e) => setForm((p) => ({ ...p, empresa: e.target.value }))}
                required
                className="bg-background/50"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className="bg-background/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={form.telefone}
                onChange={(e) => setForm((p) => ({ ...p, telefone: e.target.value }))}
                className="bg-background/50"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="logradouro">Logradouro</Label>
              <Input
                id="logradouro"
                value={form.endereco_logradouro}
                onChange={(e) => setForm((p) => ({ ...p, endereco_logradouro: e.target.value }))}
                className="bg-background/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="numero">Número</Label>
              <Input
                id="numero"
                value={form.endereco_numero}
                onChange={(e) => setForm((p) => ({ ...p, endereco_numero: e.target.value }))}
                className="bg-background/50"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="bairro">Bairro</Label>
              <Input
                id="bairro"
                value={form.endereco_bairro}
                onChange={(e) => setForm((p) => ({ ...p, endereco_bairro: e.target.value }))}
                className="bg-background/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                value={form.endereco_cep}
                onChange={(e) => setForm((p) => ({ ...p, endereco_cep: e.target.value }))}
                className="bg-background/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                value={form.endereco_cidade}
                onChange={(e) => setForm((p) => ({ ...p, endereco_cidade: e.target.value }))}
                className="bg-background/50"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="estado">Estado</Label>
            <Input
              id="estado"
              value={form.endereco_estado}
              onChange={(e) => setForm((p) => ({ ...p, endereco_estado: e.target.value }))}
              className="bg-background/50"
            />
          </div>
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
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}Criar Empresa
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
