import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Edit } from 'lucide-react'
import useClientStore from '@/stores/useClientStore'
import { Client } from '@/types/client'
import { cn } from '@/lib/utils'

const SERVICES = ['Sistema', 'Certificados', 'Marketing', 'Fiscal', 'Outro']

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
    address: client.address || {},
    services: client.services || [],
  })

  useEffect(() => {
    if (open) {
      setFormData({
        name: client.name,
        company: client.company,
        email: client.email,
        phone: client.phone,
        cnpj: client.cnpj,
        address: client.address || {},
        services: client.services || [],
      })
    }
  }, [open, client])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateClient(client.id, formData)
    setOpen(false)
  }

  const handleServiceChange = (service: string, checked: boolean) => {
    setFormData((prev) => {
      const services = prev.services || []
      if (checked) {
        return { ...prev, services: [...services, service] }
      }
      return { ...prev, services: services.filter((s) => s !== service) }
    })
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
      <DialogContent
        onClick={(e) => e.stopPropagation()}
        className="w-[95vw] sm:max-w-[600px] max-h-[90vh] p-0 flex flex-col overflow-hidden"
      >
        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden h-full">
          <DialogHeader className="px-6 py-4 border-b shrink-0">
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>Atualize os dados cadastrais do cliente abaixo.</DialogDescription>
          </DialogHeader>

          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Dados Principais</h3>
              <div className="grid gap-4">
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
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Tipos de Serviço</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SERVICES.map((s) => (
                  <div key={s} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-srv-${s}-${client.id}`}
                      checked={formData.services.includes(s)}
                      onCheckedChange={(checked) => handleServiceChange(s, checked as boolean)}
                    />
                    <Label
                      htmlFor={`edit-srv-${s}-${client.id}`}
                      className="font-normal cursor-pointer"
                    >
                      {s}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Endereço</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor={`cep-${client.id}`}>CEP</Label>
                  <Input
                    id={`cep-${client.id}`}
                    value={formData.address?.cep || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, cep: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor={`logradouro-${client.id}`}>Logradouro</Label>
                  <Input
                    id={`logradouro-${client.id}`}
                    value={formData.address?.logradouro || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, logradouro: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor={`numero-${client.id}`}>Número</Label>
                  <Input
                    id={`numero-${client.id}`}
                    value={formData.address?.numero || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, numero: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor={`bairro-${client.id}`}>Bairro</Label>
                  <Input
                    id={`bairro-${client.id}`}
                    value={formData.address?.bairro || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, bairro: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor={`cidade-${client.id}`}>Cidade</Label>
                  <Input
                    id={`cidade-${client.id}`}
                    value={formData.address?.cidade || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, cidade: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor={`estado-${client.id}`}>Estado</Label>
                  <Input
                    id={`estado-${client.id}`}
                    maxLength={2}
                    placeholder="UF"
                    value={formData.address?.estado || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, estado: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t shrink-0">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Alterações</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
