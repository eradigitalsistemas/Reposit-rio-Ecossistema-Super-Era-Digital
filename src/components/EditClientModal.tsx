import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Edit } from 'lucide-react'
import useClientStore from '@/stores/useClientStore'
import { Client } from '@/types/client'
import { cn } from '@/lib/utils'

interface EditClientModalProps {
  client: Client
  triggerClassName?: string
  iconClassName?: string
}

export function EditClientModal({ client, triggerClassName, iconClassName }: EditClientModalProps) {
  const [open, setOpen] = useState(false)
  const { updateClient } = useClientStore()
  const [formData, setFormData] = useState({
    name: client.name,
    company: client.company,
    email: client.email,
    phone: client.phone,
    cnpj: client.cnpj,
  })

  useEffect(() => {
    if (open) {
      setFormData({
        name: client.name,
        company: client.company,
        email: client.email,
        phone: client.phone,
        cnpj: client.cnpj,
      })
    }
  }, [open, client])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateClient(client.id, formData)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'text-muted-foreground hover:bg-primary/20 hover:text-primary transition-colors',
            triggerClassName,
          )}
          title="Editar cliente"
          onClick={(e) => e.stopPropagation()}
        >
          <Edit className={cn('w-4 h-4', iconClassName)} />
        </Button>
      </DialogTrigger>
      <DialogContent onClick={(e) => e.stopPropagation()} className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
          <DialogDescription>Atualize os dados cadastrais do cliente abaixo.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`name-${client.id}`}>Nome</Label>
            <Input
              id={`name-${client.id}`}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`company-${client.id}`}>Empresa</Label>
            <Input
              id={`company-${client.id}`}
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`email-${client.id}`}>E-mail</Label>
            <Input
              id={`email-${client.id}`}
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`phone-${client.id}`}>Telefone</Label>
              <Input
                id={`phone-${client.id}`}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`cnpj-${client.id}`}>CNPJ</Label>
              <Input
                id={`cnpj-${client.id}`}
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit">Salvar Alterações</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
