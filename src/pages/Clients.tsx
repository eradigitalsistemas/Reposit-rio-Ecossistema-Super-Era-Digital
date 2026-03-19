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
import { Trash2, ShieldAlert, Building2, Phone, Mail, FileText } from 'lucide-react'
import { AddClientModal } from '@/components/AddClientModal'

export default function Clients() {
  const { clients, deleteClient } = useClientStore()
  const { role } = useAuthStore()
  const navigate = useNavigate()

  if (role !== 'Admin') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <ShieldAlert className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
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
    <div className="h-full w-full bg-slate-50/50 dark:bg-background flex flex-col p-4 sm:p-6 overflow-y-auto sm:overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 shrink-0 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Clientes Externos</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie seus contatos externos e parceiros.
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <AddClientModal />
        </div>
      </div>

      {/* Desktop View */}
      <Card className="hidden md:flex flex-1 overflow-hidden flex-col">
        <CardContent className="p-0 overflow-auto flex-1">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead className="w-[80px] text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow
                  key={client.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/clientes/${client.id}`)}
                >
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.company}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>{client.cnpj}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive h-9 w-9"
                      title="Excluir cliente"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteClient(client.id)
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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

      {/* Mobile View */}
      <div className="flex flex-col gap-4 md:hidden pb-6">
        {clients.map((client) => (
          <Card
            key={client.id}
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => navigate(`/clientes/${client.id}`)}
          >
            <CardContent className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div className="font-semibold text-lg leading-tight pr-2">{client.name}</div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive -mr-2 -mt-2 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteClient(client.id)
                  }}
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-1.5 mt-1">
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Building2 className="w-4 h-4 shrink-0" />
                  <span className="truncate">{client.company || 'Sem empresa informada'}</span>
                </div>
                <div className="text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="truncate">{client.email}</span>
                </div>
                {client.phone && (
                  <div className="text-sm flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span>{client.phone}</span>
                  </div>
                )}
                {client.cnpj && (
                  <div className="text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span>{client.cnpj}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {clients.length === 0 && (
          <div className="text-center p-8 text-muted-foreground border rounded-lg bg-card">
            Nenhum cliente encontrado.
          </div>
        )}
      </div>
    </div>
  )
}
