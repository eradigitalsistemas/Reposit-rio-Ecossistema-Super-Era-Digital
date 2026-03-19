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

export default function Clients() {
  const { clients, deleteClient } = useClientStore()
  const { role } = useAuthStore()
  const navigate = useNavigate()

  if (role !== 'Admin') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-background text-foreground">
        <ShieldAlert className="w-12 h-12 text-white/60 mb-4" />
        <h2 className="text-xl font-semibold mb-2 text-white">Acesso Restrito</h2>
        <p className="text-white/60 mb-6">
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
          <h1 className="text-2xl font-bold tracking-tight text-white">Clientes Externos</h1>
          <p className="text-white/60 text-sm mt-1">Gerencie seus contatos externos e parceiros.</p>
        </div>
        <div className="w-full sm:w-auto">
          <AddClientModal />
        </div>
      </div>

      <Card className="hidden md:flex flex-1 overflow-hidden flex-col border-white/10 bg-[rgba(255,255,255,0.05)] shadow-subtle">
        <CardContent className="p-0 overflow-auto flex-1">
          <Table>
            <TableHeader className="sticky top-0 bg-[rgba(15,15,15,0.95)] backdrop-blur-md z-10">
              <TableRow>
                <TableHead className="text-white/60">Nome</TableHead>
                <TableHead className="text-white/60">Empresa</TableHead>
                <TableHead className="text-white/60">Email</TableHead>
                <TableHead className="text-white/60">Telefone</TableHead>
                <TableHead className="text-white/60">CNPJ</TableHead>
                <TableHead className="w-[100px] text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow
                  key={client.id}
                  className="cursor-pointer hover:bg-[rgba(255,255,255,0.05)] border-white/10 transition-colors"
                  onClick={() => navigate(`/clientes/${client.id}`)}
                >
                  <TableCell className="font-medium text-white">{client.name}</TableCell>
                  <TableCell className="text-white/80">{client.company}</TableCell>
                  <TableCell className="text-white/80">{client.email}</TableCell>
                  <TableCell className="text-white/80">{client.phone}</TableCell>
                  <TableCell className="text-white/80">{client.cnpj}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white/40 hover:bg-primary/20 hover:text-primary h-9 w-9 transition-colors"
                        title="Visualizar/Editar cliente"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/clientes/${client.id}`)
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white/40 hover:bg-white/10 hover:text-white h-9 w-9 transition-colors"
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
                  <TableCell colSpan={6} className="h-24 text-center text-white/40">
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
            className="cursor-pointer border-white/10 hover:border-primary/50 bg-[rgba(255,255,255,0.05)] transition-colors shadow-subtle"
            onClick={() => navigate(`/clientes/${client.id}`)}
          >
            <CardContent className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div className="font-semibold text-lg leading-tight pr-2 text-white">
                  {client.name}
                </div>
                <div className="flex gap-1 -mr-2 -mt-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white/40 hover:bg-primary/20 hover:text-primary transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/clientes/${client.id}`)
                    }}
                  >
                    <Eye className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white/40 hover:bg-white/10 hover:text-white transition-colors"
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
                <div className="text-sm text-white/60 flex items-center gap-2">
                  <Building2 className="w-4 h-4 shrink-0" />
                  <span className="truncate">{client.company || 'Sem empresa informada'}</span>
                </div>
                <div className="text-sm text-white/80 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-white/40 shrink-0" />
                  <span className="truncate">{client.email}</span>
                </div>
                {client.phone && (
                  <div className="text-sm text-white/80 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-white/40 shrink-0" />
                    <span>{client.phone}</span>
                  </div>
                )}
                {client.cnpj && (
                  <div className="text-sm text-white/80 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-white/40 shrink-0" />
                    <span>{client.cnpj}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {clients.length === 0 && (
          <div className="text-center p-8 text-white/40 border border-white/10 rounded-lg bg-[rgba(255,255,255,0.02)]">
            Nenhum cliente encontrado.
          </div>
        )}
      </div>
    </div>
  )
}
