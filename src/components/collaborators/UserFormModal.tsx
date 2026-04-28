import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'

const formSchema = z.object({
  employee_id: z.string().optional(),
  name: z.string().min(2, 'Nome muito curto'),
  email: z.string().email('Email inválido'),
  telefone: z.string().optional(),
  password: z.string().optional(),
  perfil: z.string().min(1, 'Selecione um perfil'),
})

export default function UserFormModal({
  open,
  onOpenChange,
  user,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  user: any
  onSuccess: () => void
}) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [employees, setEmployees] = useState<any[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      telefone: '',
      password: '',
      perfil: 'colaborador',
      employee_id: 'none',
    },
  })

  useEffect(() => {
    if (open) {
      if (user) {
        form.reset({
          name: user.nome || '',
          email: user.email || '',
          telefone: user.telefone || '',
          password: '',
          perfil: user.perfil || 'colaborador',
          employee_id: 'none',
        })
      } else {
        form.reset({
          name: '',
          email: '',
          telefone: '',
          password: '',
          perfil: 'colaborador',
          employee_id: 'none',
        })
        fetchEmployees()
      }
    }
  }, [open, user, form])

  const fetchEmployees = async () => {
    const { data } = await supabase
      .from('employees')
      .select('id, personal_data')
      .in('status', ['Ativo', 'Em Experiência'])
    if (data) setEmployees(data)
  }

  const onEmployeeChange = (empId: string) => {
    if (empId === 'none') {
      form.setValue('name', '')
      form.setValue('email', '')
      form.setValue('telefone', '')
      return
    }
    const emp = employees.find((e) => e.id === empId)
    if (emp && emp.personal_data) {
      form.setValue('name', emp.personal_data.nome || '')
      form.setValue('email', emp.personal_data.email || '')
      form.setValue('telefone', emp.personal_data.telefone || '')
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user && !values.password) {
      form.setError('password', { message: 'Senha é obrigatória para novos usuários' })
      return
    }

    setLoading(true)
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
          action: user ? 'update_user' : 'create_user',
          payload: {
            id: user?.id,
            name: values.name,
            email: values.email,
            telefone: values.telefone,
            password: values.password || undefined,
            perfil: values.perfil,
          },
        }),
      })

      const responseData = await res.json()

      if (!res.ok) throw new Error(responseData.error || 'Erro ao salvar usuário')

      toast({ title: 'Sucesso', description: 'Usuário salvo com sucesso' })
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{user ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
          <DialogDescription>
            {user
              ? 'Edite as permissões e dados de acesso do usuário.'
              : 'Crie um novo acesso a partir de um funcionário ou informe os dados manualmente.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!user && (
              <FormField
                control={form.control}
                name="employee_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vincular a Funcionário</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val)
                        onEmployeeChange(val)
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um funcionário..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Não vincular (Criação Manual)</SelectItem>
                        {employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.personal_data?.nome} ({emp.personal_data?.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do usuário" {...field} />
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
                  <FormLabel>E-mail de Acesso</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      disabled={!!user}
                      placeholder="email@exemplo.com"
                      {...field}
                    />
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
                    <Input placeholder="(00) 00000-0000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="perfil"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nível de Acesso (Perfil)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="colaborador">Colaborador (Padrão)</SelectItem>
                      <SelectItem value="rh">Recursos Humanos</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{user ? 'Nova Senha (Opcional)' : 'Senha Inicial'}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="***" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Usuário'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
