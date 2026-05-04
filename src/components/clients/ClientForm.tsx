import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import useClientStore from '@/stores/useClientStore'
import { Client } from '@/types/client'

const SERVICES = ['Sistema', 'Certificados', 'Marketing', 'Fiscal', 'Outro']

export function ClientForm({ client }: { client: Client }) {
  const { updateClient } = useClientStore()
  const { toast } = useToast()

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
    setFormData({
      name: client.name,
      company: client.company,
      email: client.email,
      phone: client.phone,
      cnpj: client.cnpj,
      address: client.address || {},
      services: client.services || [],
    })
  }, [client])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateClient(client.id, formData)
    toast({ title: 'Sucesso', description: 'Dados cadastrais atualizados.' })
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
    <Card className="max-w-2xl">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle>Informações Gerais</CardTitle>
        <CardDescription>
          Atualize os dados de contato, endereço e serviços do cliente.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <form onSubmit={handleSave} className="space-y-8">
          {/* Dados Principais */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm border-b pb-2">Dados Principais</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Empresa</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData((p) => ({ ...p, company: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2 col-span-1 sm:col-span-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  value={formData.cnpj}
                  onChange={(e) => setFormData((p) => ({ ...p, cnpj: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Tipos de Serviço */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm border-b pb-2">Tipos de Serviço</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SERVICES.map((s) => (
                <div key={s} className="flex items-center space-x-2">
                  <Checkbox
                    id={`form-srv-${s}-${client.id}`}
                    checked={formData.services.includes(s)}
                    onCheckedChange={(checked) => handleServiceChange(s, checked as boolean)}
                  />
                  <Label
                    htmlFor={`form-srv-${s}-${client.id}`}
                    className="font-normal cursor-pointer"
                  >
                    {s}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm border-b pb-2">Endereço</h3>
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

          <div className="flex justify-end pt-4">
            <Button type="submit" className="w-full sm:w-auto">
              Salvar Alterações
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
