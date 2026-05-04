import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import useClientStore from '@/stores/useClientStore'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

const SERVICES = ['Sistema', 'Certificados', 'Marketing', 'Fiscal', 'Outro']

export function AddClientModal() {
  const [open, setOpen] = useState(false)
  const { addClient } = useClientStore()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    await addClient({
      name: formData.get('name') as string,
      company: formData.get('company') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      cnpj: formData.get('cnpj') as string,
      address: {
        cep: formData.get('cep') as string,
        logradouro: formData.get('logradouro') as string,
        numero: formData.get('numero') as string,
        bairro: formData.get('bairro') as string,
        cidade: formData.get('cidade') as string,
        estado: formData.get('estado') as string,
      },
      services: formData.getAll('services') as string[],
    })

    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shrink-0 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Novo Cliente
        </Button>
      </DialogTrigger>
      <DialogContent
        className="w-[95vw] sm:max-w-[600px] max-h-[90vh] p-0 flex flex-col overflow-hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden h-full">
          <DialogHeader className="px-6 py-4 border-b shrink-0">
            <DialogTitle>Adicionar Novo Cliente</DialogTitle>
            <DialogDescription>
              Cadastre um novo parceiro ou cliente externo no sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Dados Principais</h3>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome completo *</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="company">Empresa</Label>
                  <Input id="company" name="company" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" name="email" type="email" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" name="phone" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input id="cnpj" name="cnpj" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Tipos de Serviço</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SERVICES.map((s) => (
                  <div key={s} className="flex items-center space-x-2">
                    <Checkbox id={`add-srv-${s}`} name="services" value={s} />
                    <Label htmlFor={`add-srv-${s}`} className="font-normal cursor-pointer">
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
                  <Label htmlFor="cep">CEP</Label>
                  <Input id="cep" name="cep" />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="logradouro">Logradouro</Label>
                  <Input id="logradouro" name="logradouro" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="numero">Número</Label>
                  <Input id="numero" name="numero" />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input id="bairro" name="bairro" />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input id="cidade" name="cidade" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Input id="estado" name="estado" maxLength={2} placeholder="UF" />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="px-6 py-4 border-t shrink-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button type="submit" className="w-full sm:w-auto">
              Salvar Cliente
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
