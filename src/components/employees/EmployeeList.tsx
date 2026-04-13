import { useState } from 'react'
import { Eye, Pencil, Trash2, ShieldAlert } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useEmployeeStore, Employee } from '@/stores/useEmployeeStore'
import EmployeeViewModal from './EmployeeViewModal'
import EmployeeFormModal from './EmployeeFormModal'
import EmployeeDeleteAlert from './EmployeeDeleteAlert'

export default function EmployeeList() {
  const { employees, loading, total, page, limit, fetchEmployees } = useEmployeeStore()

  const [viewUser, setViewUser] = useState<Employee | null>(null)
  const [editUser, setEditUser] = useState<Employee | null>(null)
  const [deleteUser, setDeleteUser] = useState<Employee | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
      case 'Em Experiência':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800'
      case 'Afastado':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800'
      case 'Demitido':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handlePageChange = (newPage: number) => {
    fetchEmployees({ page: newPage })
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <>
      <Card className="flex-1 flex flex-col overflow-hidden shadow-md dark:shadow-subtle border border-gray-200 dark:border-white/10 dark:bg-[rgba(255,255,255,0.02)]">
        <CardContent className="p-0 overflow-auto flex-1">
          <Table>
            <TableHeader className="bg-gray-50/80 dark:bg-black/40 backdrop-blur-md sticky top-0 z-10">
              <TableRow>
                <TableHead className="w-[300px]">Colaborador</TableHead>
                <TableHead>Cargo & Departamento</TableHead>
                <TableHead>Admissão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-12 text-muted-foreground animate-pulse"
                  >
                    Carregando registros...
                  </TableCell>
                </TableRow>
              ) : employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <ShieldAlert className="w-10 h-10 mb-3 opacity-20" />
                      <p>Nenhum colaborador encontrado com os filtros atuais.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((emp) => (
                  <TableRow key={emp.id} className="group hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {emp.personal_data?.nome || 'Sem Nome'}
                      </div>
                      <div className="text-sm text-muted-foreground mt-0.5">
                        {emp.personal_data?.email || 'Sem Email'}
                      </div>
                      <div className="text-xs text-muted-foreground/60 font-mono mt-0.5">
                        CPF: {emp.cpf}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {emp.professional_data?.cargo || 'Não definido'}
                      </div>
                      <div className="text-sm text-muted-foreground mt-0.5">
                        {emp.departments?.name || '-'}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-muted-foreground">
                      {new Date(emp.hire_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`font-medium ${getStatusColor(emp.status)}`}
                      >
                        {emp.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-40 sm:group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setViewUser(emp)}
                          title="Visualizar Detalhes"
                          className="hover:text-primary"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditUser(emp)}
                          title="Editar Registro"
                          className="hover:text-primary"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteUser(emp)}
                          disabled={emp.status === 'Demitido'}
                          title="Demitir"
                          className="hover:text-destructive hover:bg-destructive/10 disabled:opacity-30"
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
        {totalPages > 1 && (
          <div className="border-t p-3 bg-muted/20 flex justify-between items-center px-6">
            <span className="text-sm text-muted-foreground font-medium">
              Mostrando {Math.min(employees.length, limit)} de {total} registros
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
              >
                Anterior
              </Button>
              <div className="flex items-center gap-1 px-2 text-sm font-medium">
                Página {page} de {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => handlePageChange(page + 1)}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </Card>

      <EmployeeViewModal
        open={!!viewUser}
        onOpenChange={(o) => !o && setViewUser(null)}
        employee={viewUser}
      />
      <EmployeeFormModal
        open={!!editUser}
        onOpenChange={(o) => !o && setEditUser(null)}
        employee={editUser}
      />
      <EmployeeDeleteAlert
        open={!!deleteUser}
        onOpenChange={(o) => !o && setDeleteUser(null)}
        employee={deleteUser}
      />
    </>
  )
}
