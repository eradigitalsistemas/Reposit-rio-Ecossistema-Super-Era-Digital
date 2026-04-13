import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Search,
  UserPlus,
  AlertCircle,
  FileText,
  CheckCircle2,
  Clock,
  CheckSquare,
} from 'lucide-react'
import { useOnboardingStore } from '@/stores/useOnboardingStore'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'
import { format, differenceInDays } from 'date-fns'
import { cn } from '@/lib/utils'

export default function Onboarding() {
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null)

  const {
    tasks,
    documents,
    missingDocs,
    experiencePeriod,
    docAlert,
    loading: storeLoading,
    error,
    fetchOnboarding,
    startOnboarding,
    toggleTask,
    fetchDocuments,
    clear,
  } = useOnboardingStore()
  const { toast } = useToast()

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('employees')
        .select(`
          id, 
          personal_data, 
          professional_data, 
          hire_date, 
          experience_end_date, 
          status, 
          department_id, 
          departments (name)
        `)
        .in('status', ['Ativo', 'Em Experiência'])
        .order('hire_date', { ascending: false })

      if (error) throw error
      setEmployees(data || [])
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenOnboarding = async (employee: any) => {
    setSelectedEmployee(employee)
    clear()
    await Promise.all([fetchOnboarding(employee.id), fetchDocuments(employee.id)])
  }

  const handleCloseModal = () => {
    setSelectedEmployee(null)
    clear()
  }

  const handleStartOnboarding = async () => {
    if (!selectedEmployee) return
    await startOnboarding(selectedEmployee.id)
    if (!error) {
      toast({ title: 'Sucesso', description: 'Onboarding iniciado' })
    }
  }

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    if (!selectedEmployee) return
    try {
      await toggleTask(selectedEmployee.id, taskId, completed)
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const filteredEmployees = employees.filter((emp) => {
    const name = emp.personal_data?.nome?.toLowerCase() || ''
    const email = emp.personal_data?.email?.toLowerCase() || ''
    const term = searchTerm.toLowerCase()
    return name.includes(term) || email.includes(term)
  })

  const completedTasks = tasks.filter((t) => t.completed).length
  const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <UserPlus className="w-8 h-8 text-primary" />
            Admissão & Onboarding
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie o processo de integração e período de experiência
          </p>
        </div>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar colaborador..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">
              Carregando colaboradores...
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Colaborador</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Data de Contratação</TableHead>
                    <TableHead>Fim da Experiência</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Nenhum colaborador encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEmployees.map((emp) => {
                      const expEnd = emp.experience_end_date
                        ? new Date(`${emp.experience_end_date}T12:00:00Z`)
                        : null
                      const isExpiringSoon =
                        expEnd &&
                        differenceInDays(expEnd, new Date()) <= 7 &&
                        differenceInDays(expEnd, new Date()) >= 0

                      return (
                        <TableRow key={emp.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell>
                            <div className="font-medium text-foreground">
                              {emp.personal_data?.nome || 'Sem nome'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {emp.personal_data?.email}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {Array.isArray(emp.departments)
                              ? emp.departments[0]?.name
                              : emp.departments?.name || 'N/A'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(`${emp.hire_date}T12:00:00Z`), 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell>
                            {expEnd ? (
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">
                                  {format(expEnd, 'dd/MM/yyyy')}
                                </span>
                                {isExpiringSoon && (
                                  <Badge
                                    variant="destructive"
                                    className="text-[10px] font-semibold tracking-wider uppercase animate-pulse"
                                  >
                                    Atenção
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenOnboarding(emp)}
                              className="hover:bg-primary hover:text-primary-foreground"
                            >
                              Ver Onboarding
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedEmployee} onOpenChange={(o) => !o && handleCloseModal()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto sm:rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2 text-foreground">
              <CheckSquare className="w-6 h-6 text-primary" />
              Onboarding: {selectedEmployee?.personal_data?.nome}
            </DialogTitle>
            <DialogDescription className="text-base">
              Acompanhe o checklist de entrada e as documentações
            </DialogDescription>
          </DialogHeader>

          {storeLoading && tasks.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground animate-pulse">
              Carregando dados do onboarding...
            </div>
          ) : error && !tasks.length ? (
            <div className="py-12 text-center">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4 opacity-80" />
              <h3 className="text-lg font-medium text-destructive mb-2">Erro ao carregar</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
              <div className="space-y-6">
                <Card className="border-border shadow-sm">
                  <CardHeader className="pb-3 border-b border-border/50">
                    <CardTitle className="text-lg flex items-center justify-between">
                      Checklist de Admissão
                      {tasks.length > 0 && (
                        <Badge
                          variant={progress === 100 ? 'default' : 'secondary'}
                          className="ml-2 font-mono"
                        >
                          {progress}%
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {tasks.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground mb-4">
                          O checklist de onboarding ainda não foi iniciado.
                        </p>
                        <Button
                          onClick={handleStartOnboarding}
                          disabled={storeLoading}
                          className="w-full sm:w-auto"
                        >
                          Iniciar Onboarding
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2 bg-muted/30 p-3 rounded-lg border border-border/50">
                          <div className="flex justify-between text-sm text-muted-foreground font-medium">
                            <span>Progresso</span>
                            <span>
                              {completedTasks} de {tasks.length} concluídas
                            </span>
                          </div>
                          <Progress value={progress} className="h-2.5 bg-secondary/50" />
                        </div>

                        <div className="space-y-3 mt-6">
                          {tasks.map((task) => (
                            <div
                              key={task.id}
                              className={cn(
                                'flex items-start space-x-3 p-3.5 rounded-lg border transition-all duration-200 shadow-sm',
                                task.completed
                                  ? 'bg-primary/5 border-primary/20'
                                  : 'bg-card hover:bg-muted/20 border-border',
                              )}
                            >
                              <Checkbox
                                id={`task-${task.id}`}
                                checked={task.completed}
                                onCheckedChange={(c) => handleToggleTask(task.id, !!c)}
                                className={cn(
                                  'mt-0.5',
                                  task.completed
                                    ? 'data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground'
                                    : '',
                                )}
                              />
                              <div className="grid gap-1.5 leading-none flex-1">
                                <label
                                  htmlFor={`task-${task.id}`}
                                  className={cn(
                                    'text-sm font-medium leading-none cursor-pointer transition-colors',
                                    task.completed &&
                                      'text-muted-foreground line-through opacity-70',
                                  )}
                                >
                                  {task.task_name}
                                </label>
                                {task.completed && task.completed_at && (
                                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                                    Concluído em{' '}
                                    {format(new Date(task.completed_at), "dd/MM/yy 'às' HH:mm")}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card
                  className={cn(
                    'shadow-sm transition-colors',
                    experiencePeriod?.alert
                      ? 'border-destructive/40 bg-destructive/5'
                      : 'border-border',
                  )}
                >
                  <CardHeader className="pb-3 border-b border-border/50">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      Período de Experiência
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {experiencePeriod ? (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3.5 bg-background border border-border/50 rounded-lg shadow-sm">
                          <span className="text-sm font-medium text-muted-foreground">
                            Término Previsto
                          </span>
                          <span className="text-sm font-semibold text-foreground">
                            {experiencePeriod.end_date
                              ? format(
                                  new Date(`${experiencePeriod.end_date}T12:00:00Z`),
                                  'dd/MM/yyyy',
                                )
                              : 'Não definido'}
                          </span>
                        </div>
                        {experiencePeriod.days_remaining !== null && (
                          <div
                            className={cn(
                              'flex justify-between items-center p-3.5 rounded-lg border shadow-sm',
                              experiencePeriod.alert
                                ? 'bg-destructive/10 border-destructive/20 text-destructive'
                                : 'bg-background border-border/50 text-foreground',
                            )}
                          >
                            <span className="text-sm font-medium opacity-90">Dias Restantes</span>
                            <span className="text-sm font-bold flex items-center gap-2">
                              {experiencePeriod.days_remaining} dias
                              {experiencePeriod.alert && (
                                <AlertCircle className="w-4 h-4 animate-pulse" />
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Informações não disponíveis.
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card
                  className={cn(
                    'shadow-sm transition-colors',
                    docAlert ? 'border-amber-500/40 bg-amber-500/5' : 'border-border',
                  )}
                >
                  <CardHeader className="pb-3 border-b border-border/50">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      Documentação Obrigatória
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-5">
                      {missingDocs.length > 0 && (
                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg shadow-sm">
                          <h4 className="text-sm font-bold text-amber-700 dark:text-amber-500 mb-2 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Documentos Pendentes
                          </h4>
                          <ul className="list-disc pl-5 text-sm font-medium text-amber-700/80 dark:text-amber-500/80 space-y-1">
                            {missingDocs.map((doc) => (
                              <li key={doc}>{doc}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {documents.length > 0 ? (
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                            Documentos Recebidos
                          </h4>
                          <div className="space-y-2">
                            {documents.map((doc) => (
                              <div
                                key={doc.id}
                                className="flex items-center justify-between p-3 bg-background border border-border/50 rounded-lg shadow-sm text-sm"
                              >
                                <span className="font-medium text-foreground">
                                  {doc.document_type}
                                </span>
                                <Badge
                                  variant={doc.status === 'Válido' ? 'default' : 'secondary'}
                                  className="text-[10px] uppercase tracking-wider font-semibold"
                                >
                                  {doc.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          Nenhum documento anexado ainda.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
