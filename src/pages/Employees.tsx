import { useState, useEffect } from 'react'
import { Plus, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useEmployeeStore } from '@/stores/useEmployeeStore'
import EmployeeList from '@/components/employees/EmployeeList'
import EmployeeFormModal from '@/components/employees/EmployeeFormModal'
import { supabase } from '@/lib/supabase/client'

export default function Employees() {
  const { fetchEmployees } = useEmployeeStore()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('Todos')
  const [department, setDepartment] = useState('Todos')
  const [departments, setDepartments] = useState<any[]>([])
  const [formOpen, setFormOpen] = useState(false)

  useEffect(() => {
    supabase
      .from('departments')
      .select('id, name')
      .order('name')
      .then(({ data }) => {
        if (data) setDepartments(data)
      })
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEmployees({ search, status, department_id: department })
    }, 400)
    return () => clearTimeout(timer)
  }, [search, status, department, fetchEmployees])

  return (
    <div className="flex flex-col p-4 sm:p-6 w-full h-full bg-background animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Gestão de Colaboradores
          </h1>
          <p className="text-muted-foreground text-sm mt-1.5 max-w-2xl">
            Acompanhe sua equipe, gerencie status operacionais, vínculos contratuais e histórico de
            documentação em um só lugar.
          </p>
        </div>
        <Button
          onClick={() => setFormOpen(true)}
          className="w-full sm:w-auto font-bold shadow-md hover:shadow-lg transition-shadow"
        >
          <Plus className="w-5 h-5 mr-2" /> Novo Registro
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6 bg-muted/30 p-3 rounded-lg border border-border/50">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar por nome, email ou CPF..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background border-border"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="hidden sm:flex items-center text-muted-foreground">
            <Filter className="w-4 h-4 mx-2" />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full sm:w-[180px] bg-background">
              <SelectValue placeholder="Filtrar por Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos os Status</SelectItem>
              <SelectItem value="Ativo">Ativo</SelectItem>
              <SelectItem value="Em Experiência">Em Experiência</SelectItem>
              <SelectItem value="Afastado">Afastado</SelectItem>
              <SelectItem value="Demitido">Demitido</SelectItem>
            </SelectContent>
          </Select>
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="w-full sm:w-[180px] bg-background">
              <SelectValue placeholder="Departamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos os Deptos</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <EmployeeList />
      <EmployeeFormModal open={formOpen} onOpenChange={setFormOpen} />
    </div>
  )
}
