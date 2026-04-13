import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Employee } from '@/stores/useEmployeeStore'
import EmployeeDocumentsTab from './EmployeeDocumentsTab'

export default function EmployeeViewModal({
  open,
  onOpenChange,
  employee,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  employee?: Employee | null
}) {
  if (!employee) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-3">
            {employee.personal_data?.nome || 'Colaborador'}
            <Badge variant={employee.status === 'Ativo' ? 'default' : 'secondary'}>
              {employee.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>Detalhes do registro do colaborador</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="pessoais" className="mt-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="pessoais">Pessoais</TabsTrigger>
            <TabsTrigger value="profissionais">Profissionais</TabsTrigger>
            <TabsTrigger value="documentacao">Documentos</TabsTrigger>
            <TabsTrigger value="contatos">Contatos</TabsTrigger>
          </TabsList>

          <TabsContent value="pessoais" className="p-4 space-y-4 border rounded-md mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <strong className="text-sm text-muted-foreground block">CPF</strong>
                <span className="font-medium">{employee.cpf}</span>
              </div>
              <div>
                <strong className="text-sm text-muted-foreground block">RG</strong>
                <span className="font-medium">{employee.rg || 'Não informado'}</span>
              </div>
              <div>
                <strong className="text-sm text-muted-foreground block">Data de Nascimento</strong>
                <span className="font-medium">
                  {employee.personal_data?.data_nascimento
                    ? new Date(employee.personal_data.data_nascimento).toLocaleDateString('pt-BR', {
                        timeZone: 'UTC',
                      })
                    : 'Não informado'}
                </span>
              </div>
              <div className="sm:col-span-2">
                <strong className="text-sm text-muted-foreground block">Endereço Completo</strong>
                <span className="font-medium">
                  {employee.personal_data?.endereco || 'Não informado'}
                </span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="profissionais" className="p-4 space-y-4 border rounded-md mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <strong className="text-sm text-muted-foreground block">Cargo</strong>
                <span className="font-medium">
                  {employee.professional_data?.cargo || 'Não informado'}
                </span>
              </div>
              <div>
                <strong className="text-sm text-muted-foreground block">Departamento</strong>
                <span className="font-medium">{employee.departments?.name || 'Não atribuído'}</span>
              </div>
              <div>
                <strong className="text-sm text-muted-foreground block">Salário Base</strong>
                <span className="font-medium">
                  {employee.salary
                    ? `R$ ${employee.salary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                    : 'Não informado'}
                </span>
              </div>
              <div>
                <strong className="text-sm text-muted-foreground block">Data de Contratação</strong>
                <span className="font-medium">
                  {new Date(employee.hire_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                </span>
              </div>
              <div>
                <strong className="text-sm text-muted-foreground block">
                  Fim do Período de Experiência
                </strong>
                <span className="font-medium">
                  {employee.experience_end_date
                    ? new Date(employee.experience_end_date).toLocaleDateString('pt-BR', {
                        timeZone: 'UTC',
                      })
                    : 'N/A'}
                </span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="documentacao">
            <EmployeeDocumentsTab employeeId={employee.id} />
          </TabsContent>

          <TabsContent value="contatos" className="p-4 space-y-4 border rounded-md mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <strong className="text-sm text-muted-foreground block">Email de Contato</strong>
                <span className="font-medium">
                  {employee.personal_data?.email || 'Não informado'}
                </span>
              </div>
              <div>
                <strong className="text-sm text-muted-foreground block">Telefone / WhatsApp</strong>
                <span className="font-medium">
                  {employee.personal_data?.telefone || 'Não informado'}
                </span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
