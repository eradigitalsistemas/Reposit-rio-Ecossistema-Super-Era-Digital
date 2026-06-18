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
import { Trash2, Building2, Phone, Mail, FileText, Eye } from 'lucide-react'
import { AddClientModal } from '@/components/AddClientModal'
import { ImportClientModal } from '@/components/ImportClientModal'
import { EditClientModal } from '@/components/EditClientModal'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/use-debounce'
import { useState, useMemo } from 'react'

export default function Clients() {
  const { clients, isLoading, hasMore, isLoadingMore, loadMoreClients, deleteClient } =
    useClientStore()
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  const filteredClients = useMemo(() => {
    if (!debouncedSearchQuery) return clients
    const q = debouncedSearchQuery.toLowerCase()
    return clients.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.company?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.cnpj?.toLowerCase().includes(q),
    )
  }, [clients, debouncedSearchQuery])

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
          <div className="relative w-full sm:w-[250px] mr-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 h-10 bg-background/50 border-border/50 focus-visible:ring-primary/50"
            />
          </div>
          <ImportClientModal />
          <AddClientModal />
        </div>
      </div>

      <Card className="hidden md:flex flex-1 overflow-hidden flex-col border-border bg-card shadow-sm">
        <CardContent className="p-0 overflow-auto flex-1">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead className="text-muted-foreground">Nome</TableHead>
                <TableHead className="text-muted-foreground">Empresa</TableHead>
                <TableHead className="text-muted-foreground">Email</TableHead>
                <TableHead className="text-muted-foreground">Telefone</TableHead>
                <TableHead className="text-muted-foreground">CNPJ</TableHead>
                <TableHead className="text-muted-foreground">Serviços</TableHead>
                <TableHead className="w-[100px] text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted rounded w-2/3 animate-pulse"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted rounded w-1/3 animate-pulse"></div>
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                ))
              ) : filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <TableRow
                    key={client.id}
                    className="cursor-pointer hover:bg-muted/50 border-border transition-colors"
                    onClick={() => navigate(`/clientes/${client.id}`)}
                  >
                    <TableCell className="font-medium text-foreground">
                      {client.name || '-'}
                    </TableCell>
                    <TableCell className="text-foreground/80">{client.company || '-'}</TableCell>
                    <TableCell className="text-foreground/80">{client.email || '-'}</TableCell>
                    <TableCell className="text-foreground/80">{client.phone || '-'}</TableCell>
                    <TableCell className="text-foreground/80">{client.cnpj || '-'}</TableCell>
                    <TableCell className="text-foreground/80">
                      {Array.isArray(client.services) && client.services.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {client.services.map((s) => (
                            <span
                              key={s}
                              className="bg-primary/10 text-primary text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
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
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4 md:hidden pb-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <Card key={idx} className="border-border bg-card shadow-sm">
              <CardContent className="p-4 flex flex-col gap-3">
                <div className="h-6 bg-muted rounded w-2/3 animate-pulse"></div>
                <div className="space-y-2 mt-2">
                  <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
                  <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredClients.length > 0 ? (
          filteredClients.map((client) => (
            <Card
              key={client.id}
              className="cursor-pointer border-border hover:border-primary/50 bg-card transition-colors shadow-sm"
              onClick={() => navigate(`/clientes/${client.id}`)}
            >
              <CardContent className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div className="font-semibold text-lg leading-tight pr-2 text-foreground">
                    {client.name || 'Sem nome'}
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
                    <span className="truncate">{client.email || 'Sem e-mail'}</span>
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
                  {Array.isArray(client.services) && client.services.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {client.services.map((s) => (
                        <span
                          key={s}
                          className="bg-primary/10 text-primary text-[10px] font-medium px-2 py-0.5 rounded-full"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center p-8 text-muted-foreground border border-border rounded-lg bg-muted/50">
            Nenhum cliente encontrado.
          </div>
        )}
      </div>

      {hasMore && (
        <div className="flex justify-center py-6 w-full">
          <Button
            variant="outline"
            onClick={loadMoreClients}
            disabled={isLoadingMore}
            className="bg-card/80 backdrop-blur shadow-sm min-w-[200px]"
          >
            {isLoadingMore ? 'Carregando...' : 'Carregar mais clientes'}
          </Button>
        </div>
      )}
    </div>
  )
}
