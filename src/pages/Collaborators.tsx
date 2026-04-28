import { useState, useEffect } from 'react'
import { Plus, Search, ShieldAlert, UserCog, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import UserFormModal from '@/components/collaborators/UserFormModal'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

export default function Collaborators() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [deleteUser, setDeleteUser] = useState<any>(null)
  const { toast } = useToast()

  const fetchUsers = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('usuarios').select('*').order('nome')

    if (error) {
      toast({ title: 'Erro', description: 'Falha ao buscar usuários', variant: 'destructive' })
    } else {
      setUsers(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = users.filter(
    (u) =>
      u.nome?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()),
  )

  const handleDelete = async () => {
    if (!deleteUser) return
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          action: 'delete_user',
          payload: { id: deleteUser.id },
        }),
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Falha ao excluir usuário')

      // Ensure removal from custom table as fallback
      await supabase.from('usuarios').delete().eq('id', deleteUser.id)

      toast({ title: 'Sucesso', description: 'Usuário excluído com sucesso' })
      fetchUsers()
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } finally {
      setDeleteUser(null)
    }
  }

  return (
    <div className="flex flex-col p-4 sm:p-6 w-full h-full bg-background animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Controle de Acessos
          </h1>
          <p className="text-muted-foreground text-sm mt-1.5 max-w-2xl">
            Gerencie os usuários do sistema, conceda acessos aos funcionários e defina as permissões
            (RBAC).
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedUser(null)
            setFormOpen(true)
          }}
          className="w-full sm:w-auto font-bold shadow-md hover:shadow-lg transition-shadow"
        >
          <Plus className="w-5 h-5 mr-2" /> Novo Usuário
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6 bg-muted/30 p-3 rounded-lg border border-border/50">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background border-border"
          />
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden shadow-md dark:shadow-subtle border border-gray-200 dark:border-white/10 dark:bg-[rgba(255,255,255,0.02)]">
        <CardContent className="p-0 overflow-auto flex-1">
          <Table>
            <TableHeader className="bg-gray-50/80 dark:bg-black/40 backdrop-blur-md sticky top-0 z-10">
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Email / Contato</TableHead>
                <TableHead>Perfil (RBAC)</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-12 text-muted-foreground animate-pulse"
                  >
                    Carregando usuários...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <ShieldAlert className="w-10 h-10 mb-3 opacity-20" />
                      <p>Nenhum usuário encontrado.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u) => (
                  <TableRow key={u.id} className="group hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <div className="font-semibold flex items-center gap-2">
                        <UserCog className="w-4 h-4 text-muted-foreground" />
                        {u.nome || 'Sem Nome'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-foreground">{u.email}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {u.telefone || 'Sem telefone'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          u.perfil?.toLowerCase() === 'admin'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        }
                      >
                        {u.perfil?.toUpperCase() || 'COLABORADOR'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-40 sm:group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedUser(u)
                            setFormOpen(true)
                          }}
                          title="Editar Acesso"
                          className="hover:text-primary"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteUser(u)}
                          title="Revogar Acesso"
                          className="hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {formOpen && (
        <UserFormModal
          open={formOpen}
          onOpenChange={setFormOpen}
          user={selectedUser}
          onSuccess={fetchUsers}
        />
      )}

      <Dialog open={!!deleteUser} onOpenChange={(o) => !o && setDeleteUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revogar Acesso</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o usuário <strong>{deleteUser?.nome}</strong>? Isso
              revogará imediatamente o acesso ao sistema.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteUser(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir Usuário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
