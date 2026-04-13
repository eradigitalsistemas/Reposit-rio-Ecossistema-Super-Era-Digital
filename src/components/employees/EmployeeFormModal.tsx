import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { isValidCPF, formatCPF } from '@/lib/utils/cpf'
import { supabase } from '@/lib/supabase/client'
import { useEmployeeStore, Employee } from '@/stores/useEmployeeStore'

const formSchema = z.object({
  cpf: z.string().refine(isValidCPF, 'CPF inválido'),
  rg: z.string().optional(),
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  telefone: z.string().optional(),
  cargo: z.string().optional(),
  department_id: z.string().optional(),
  salary: z
    .string()
    .optional()
    .refine((val) => !val || Number(val) > 0, 'Salário deve ser um número positivo'),
  hire_date: z
    .string()
    .refine(
      (val) => val <= new Date().toISOString().split('T')[0],
      'Data de contratação não pode ser no futuro',
    ),
  status: z.enum(['Ativo', 'Afastado', 'Demitido', 'Em Experiência']).default('Ativo'),
})

export default function EmployeeFormModal({
  open,
  onOpenChange,
  employee,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  employee?: Employee | null
}) {
  const { toast } = useToast()
  const { fetchEmployees } = useEmployeeStore()
  const [departments, setDepartments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { status: 'Ativo', hire_date: new Date().toISOString().split('T')[0] },
  })

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
    if (open) {
      if (employee) {
        form.reset({
          cpf: employee.cpf,
          rg: employee.rg || '',
          nome: employee.personal_data?.nome || '',
          email: employee.personal_data?.email || '',
          telefone: employee.personal_data?.telefone || '',
          cargo: employee.professional_data?.cargo || '',
          department_id: employee.department_id || undefined,
          salary: employee.salary ? String(employee.salary) : '',
          hire_date: employee.hire_date,
          status: employee.status as any,
        })
      } else {
        form.reset({
          cpf: '',
          rg: '',
          nome: '',
          email: '',
          telefone: '',
          cargo: '',
          department_id: undefined,
          salary: '',
          hire_date: new Date().toISOString().split('T')[0],
          status: 'Ativo',
        })
      }
    }
  }, [open, employee, form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true)
    try {
      const { data: existingEmail } = await supabase
        .from('employees')
        .select('id')
        .eq('personal_data->>email', values.email)
        .neq('id', employee?.id || '00000000-0000-0000-0000-000000000000')
        .maybeSingle()

      if (existingEmail) {
        form.setError('email', { message: 'Este email já está vinculado a outro colaborador.' })
        setLoading(false)
        return
      }

      const payload = {
        cpf: values.cpf.replace(/\D/g, ''),
        rg: values.rg || null,
        personal_data: { nome: values.nome, email: values.email, telefone: values.telefone },
        professional_data: { cargo: values.cargo },
        department_id: values.department_id || null,
        salary: values.salary ? Number(values.salary) : null,
        hire_date: values.hire_date,
        status: values.status,
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error('Usuário não autenticado')

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/employees${employee ? `/${employee.id}` : ''}`,
        {
          method: employee ? 'PUT' : 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      )

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Erro ao salvar colaborador')
      }

      toast({
        title: 'Sucesso',
        description: `Colaborador ${employee ? 'atualizado' : 'criado'} com sucesso.`,
      })
      fetchEmployees()
      onOpenChange(false)
    } catch (err: any) {
      toast({ title: 'Erro de Validação', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{employee ? 'Editar Registro' : 'Novo Colaborador'}</DialogTitle>
          <DialogDescription>
            Preencha os dados cadastrais. Os campos com asterisco (*) são obrigatórios.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: João Silva" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} placeholder="email@empresa.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) => field.onChange(formatCPF(e.target.value))}
                        maxLength={14}
                        placeholder="000.000.000-00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RG</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Apenas números" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="(00) 00000-0000" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cargo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Desenvolvedor, Vendedor..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="department_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departamento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o departamento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salário Base (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} placeholder="0.00" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hire_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Contratação *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Operacional *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Ativo">Ativo</SelectItem>
                        <SelectItem value="Em Experiência">Em Experiência</SelectItem>
                        <SelectItem value="Afastado">Afastado</SelectItem>
                        <SelectItem value="Demitido">Demitido</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="pt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="font-bold">
                {loading ? 'Salvando...' : 'Salvar Colaborador'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
