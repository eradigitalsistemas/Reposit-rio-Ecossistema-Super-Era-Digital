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
import { Trash2, ShieldAlert } from 'lucide-react'

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
    <div className="h-full w-full bg-slate-50/50 dark:bg-background flex flex-col p-6 overflow-hidden">
      <div className="mb-6 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Clientes Externos</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gerencie seus contatos externos e parceiros.
        </p>
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col">
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
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
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
    </div>
  )
}
