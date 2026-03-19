import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import useClientStore from '@/stores/useClientStore'
import useAuthStore from '@/stores/useAuthStore'
import { ClientForm } from '@/components/clients/ClientForm'
import { ClientHistory } from '@/components/clients/ClientHistory'
import { ClientDocuments } from '@/components/clients/ClientDocuments'

export default function ClientProfile() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { clients } = useClientStore()
  const { role } = useAuthStore()

  if (role !== 'Admin') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <ShieldAlert className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
        <p className="text-muted-foreground mb-6">
          Apenas administradores podem acessar o perfil de clientes.
        </p>
        <Button onClick={() => navigate('/')} variant="default">
          Voltar ao Início
        </Button>
      </div>
    )
  }

  const client = clients.find((c) => c.id === id)

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-xl font-semibold mb-2">Cliente não encontrado</h2>
        <Button onClick={() => navigate('/clientes')} variant="outline">
          Voltar
        </Button>
      </div>
    )
  }

  return (
    <div className="h-full w-full bg-slate-50/50 dark:bg-background flex flex-col p-6 overflow-hidden">
      <div className="flex items-center gap-4 mb-6 shrink-0">
        <Button variant="ghost" size="icon" onClick={() => navigate('/clientes')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{client.name}</h1>
          <p className="text-muted-foreground text-sm mt-1">{client.company} • Perfil do Cliente</p>
        </div>
      </div>

      <Tabs defaultValue="dados" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-12 p-0 space-x-6 shrink-0 mb-4">
          <TabsTrigger
            value="dados"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0"
          >
            Dados Cadastrais
          </TabsTrigger>
          <TabsTrigger
            value="historico"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0"
          >
            Histórico DEMANDAS
          </TabsTrigger>
          <TabsTrigger
            value="documentos"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0"
          >
            Documentos
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-auto">
          <TabsContent value="dados" className="m-0 h-full">
            <ClientForm client={client} />
          </TabsContent>

          <TabsContent value="historico" className="m-0 h-full">
            <ClientHistory client={client} />
          </TabsContent>

          <TabsContent value="documentos" className="m-0 h-full">
            <ClientDocuments client={client} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
