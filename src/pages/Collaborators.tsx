import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldAlert, Plus, Eye, Pencil, Trash2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import useAuthStore from '@/stores/useAuthStore'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import CollaboratorFormModal from '@/components/collaborators/CollaboratorFormModal'
import CollaboratorViewModal from '@/components/collaborators/CollaboratorViewModal'
import CollaboratorDeleteAlert from '@/components/collaborators/CollaboratorDeleteAlert'

export type Collaborator = {
  id: string
  nome: string
  email: string
  telefone?: string | null
  perfil: string
  ativo: boolean
  data_criacao: string
}

export default function Collaborators() {
  const { role } = useAuthStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [users, setUsers] = useState<Collaborator[]>([])
  const [loading, setLoading] = useState(true)

  const [formOpen, setFormOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const [selectedUser, setSelectedUser] = useState<Collaborator | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('usuarios').select('*').order('nome')

    if (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar colaboradores.',
        variant: 'destructive',
      })
    } else {
      setUsers(data as Collaborator[])
    }
    setLoading(false)
  }, [toast])

  useEffect(() => {
    if (role === 'Admin') {
      fetchUsers()
    }
  }, [role, fetchUsers])

  if (role !== 'Admin') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <ShieldAlert className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
        <p className="text-muted-foreground mb-6">
          Apenas administradores podem acessar a gestão de colaboradores.
        </p>
        <Button onClick={() => navigate('/')}>Voltar ao Início</Button>
      </div>
    )
  }

  const handleCreate = () => {
    setSelectedUser(null)
    setFormOpen(true)
  }

  const handleEdit = (user: Collaborator) => {
    setSelectedUser(user)
    setFormOpen(true)
  }

  const handleView = (user: Collaborator) => {
    setSelectedUser(user)
    setViewOpen(true)
  }

  const handleDelete = (user: Collaborator) => {
    setSelectedUser(user)
    setDeleteOpen(true)
  }

  return (
    <div className="h-full w-full bg-slate-50/50 dark:bg-background flex flex-col p-4 sm:p-6 overflow-y-auto sm:overflow-hidden">
      <div className="mb-6 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Equipe e Acessos</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie os colaboradores, departamentos e níveis de acesso ao sistema.
          </p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Novo Colaborador
        </Button>
      </div>

      <Card className="hidden md:flex flex-1 overflow-hidden flex-col">
        <CardContent className="p-0 overflow-auto flex-1">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Nenhum colaborador encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{user.nome}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.perfil === 'admin' ? 'default' : 'secondary'}>
                        {user.perfil === 'admin' ? 'Admin' : 'Colaborador'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleView(user)}
                          title="Ver Detalhes"
                        >
                          <Eye className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(user)}
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(user)}
                          title="Remover"
                        >
                          <Trash2 className="w-4 h-4 text-destructive hover:text-destructive/80" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Mobile View */}
      <div className="flex flex-col gap-4 md:hidden pb-6">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        ) : (
          users.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="font-semibold text-lg leading-tight">{user.nome}</div>
                  <Badge
                    variant={user.perfil === 'admin' ? 'default' : 'secondary'}
                    className="shrink-0"
                  >
                    {user.perfil === 'admin' ? 'Admin' : 'Colaborador'}
                  </Badge>
                </div>
                <div className="space-y-1.5 mt-1">
                  <div className="text-sm flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t">
                  <Button variant="outline" size="sm" onClick={() => handleView(user)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(user)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(user)}
                    className="text-destructive border-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <CollaboratorFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={fetchUsers}
        initialData={selectedUser}
      />
      <CollaboratorViewModal open={viewOpen} onOpenChange={setViewOpen} user={selectedUser} />
      <CollaboratorDeleteAlert
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onSuccess={fetchUsers}
        user={selectedUser}
      />
    </div>
  )
}
