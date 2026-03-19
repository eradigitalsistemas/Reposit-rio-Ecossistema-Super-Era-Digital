import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import useClientStore from '@/stores/useClientStore'
import { Client } from '@/types/client'

export function ClientForm({ client }: { client: Client }) {
  const { updateClient } = useClientStore()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: client.name,
    company: client.company,
    email: client.email,
    phone: client.phone,
    cnpj: client.cnpj,
  })

  useEffect(() => {
    setFormData({
      name: client.name,
      company: client.company,
      email: client.email,
      phone: client.phone,
      cnpj: client.cnpj,
    })
  }, [client])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateClient(client.id, formData)
    toast({ title: 'Sucesso', description: 'Dados cadastrais atualizados.' })
  }

  return (
    <Card className="max-w-2xl border-0 sm:border sm:shadow-sm">
      <CardHeader className="px-0 sm:px-6">
        <CardTitle>Informações Gerais</CardTitle>
        <CardDescription>Atualize os dados de contato e informações da empresa.</CardDescription>
      </CardHeader>
      <CardContent className="px-0 sm:px-6">
        <form onSubmit={handleSave} className="space-y-4">
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
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                required
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
