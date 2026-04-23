import { useNavigate } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import useClientStore from '@/stores/useClientStore'
import useAuthStore from '@/stores/useAuthStore'
import { Trash2, ShieldAlert, Building2, Phone, Mail, FileText, Eye } from 'lucide-react'
import { AddClientModal } from '@/components/AddClientModal'
import { ImportClientModal } from '@/components/ImportClientModal'
import { EditClientModal } from '@/components/EditClientModal'

export default function Clients() {
  const { clients, deleteClient } = useClientStore()
  const { role } = useAuthStore()
  const navigate = useNavigate()

  if (role !== 'Admin') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-background text-foreground">
        <ShieldAlert className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2 text-foreground">Acesso Restrito</h2>
        <p className="text-muted-foreground mb-6">
          Apenas administradores podem acessar a gestão de clientes externos.
        </p>
        <Button onClick={() => navigate('/')} variant="default">
          Voltar ao Início
        </Button>
      </div>
    )
  }

  return (
    <div className="h-full w-full bg-background flex flex-col p-4 sm:p-6 overflow-y-auto sm:overflow-hidden text-foreground">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 shrink-0 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Clientes Externos</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie seus contatos externos e parceiros.
          </p>
        </div>
        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
          <ImportClientModal />
          <AddClientModal />
        </div>
      </div>

      <Card className="hidden md:flex flex-1 overflow-hidden flex-col border-border bg-card shadow-sm">
        <CardContent className="p-0 overflow-auto flex-1">
          <Table>
            <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-md z-10">
              <TableRow>
                <TableHead className="text-muted-foreground">Nome</TableHead>
                <TableHead className="text-muted-foreground">Empresa</TableHead>
                <TableHead className="text-muted-foreground">Email</TableHead>
                <TableHead className="text-muted-foreground">Telefone</TableHead>
                <TableHead className="text-muted-foreground">CNPJ</TableHead>
                <TableHead className="w-[100px] text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow
                  key={client.id}
                  className="cursor-pointer hover:bg-muted/50 border-border transition-colors"
                  onClick={() => navigate(`/clientes/${client.id}`)}
                >
                  <TableCell className="font-medium text-foreground">{client.name}</TableCell>
                  <TableCell className="text-foreground/80">{client.company}</TableCell>
                  <TableCell className="text-foreground/80">{client.email}</TableCell>
                  <TableCell className="text-foreground/80">{client.phone}</TableCell>
                  <TableCell className="text-foreground/80">{client.cnpj}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:bg-primary/20 hover:text-primary h-9 w-9 transition-colors"
                        title="Visualizar/Editar cliente"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/clientes/${client.id}`)
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <EditClientModal
                        client={client}
                        triggerClassName="h-9 w-9"
                        iconClassName="w-4 h-4"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:bg-destructive/20 hover:text-destructive h-9 w-9 transition-colors"
                        title="Excluir cliente"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteClient(client.id)
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {clients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4 md:hidden pb-6">
        {clients.map((client) => (
          <Card
            key={client.id}
            className="cursor-pointer border-border hover:border-primary/50 bg-card transition-colors shadow-sm"
            onClick={() => navigate(`/clientes/${client.id}`)}
          >
            <CardContent className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div className="font-semibold text-lg leading-tight pr-2 text-foreground">
                  {client.name}
                </div>
                <div className="flex gap-1 -mr-2 -mt-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:bg-primary/20 hover:text-primary transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/clientes/${client.id}`)
                    }}
                  >
                    <Eye className="w-5 h-5" />
                  </Button>
                  <EditClientModal client={client} iconClassName="w-5 h-5" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteClient(client.id)
                    }}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5 mt-1">
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Building2 className="w-4 h-4 shrink-0" />
                  <span className="truncate">{client.company || 'Sem empresa informada'}</span>
                </div>
                <div className="text-sm text-foreground/80 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="truncate">{client.email}</span>
                </div>
                {client.phone && (
                  <div className="text-sm text-foreground/80 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span>{client.phone}</span>
                  </div>
                )}
                {client.cnpj && (
                  <div className="text-sm text-foreground/80 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span>{client.cnpj}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {clients.length === 0 && (
          <div className="text-center p-8 text-muted-foreground border border-border rounded-lg bg-muted/50">
            Nenhum cliente encontrado.
          </div>
        )}
      </div>
    </div>
  )
}
