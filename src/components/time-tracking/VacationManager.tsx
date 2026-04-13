import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useVacationStore } from '@/stores/useVacationStore'
import { useTimeTrackingStore } from '@/stores/useTimeTrackingStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
import { AlertCircle, CalendarRange } from 'lucide-react'

const formSchema = z
  .object({
    start_date: z.string().min(1, 'Data inicial obrigatória'),
    end_date: z.string().min(1, 'Data final obrigatória'),
    type: z.enum(['Gozar', 'Vender']),
  })
  .refine((data) => new Date(data.end_date) >= new Date(data.start_date), {
    message: 'Data final deve ser igual ou posterior à inicial',
    path: ['end_date'],
  })

export function VacationManager() {
  const { balance, requests, submitRequest } = useVacationStore()
  const { employeeId } = useTimeTrackingStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { start_date: '', end_date: '', type: 'Gozar' },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!employeeId) return
    const res = await submitRequest(employeeId, values)
    if (res.success) {
      toast.success('Solicitação de férias enviada com sucesso.')
      form.reset()
    } else {
      toast.error(res.error || 'Erro ao solicitar férias.')
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {balance?.expires_soon && (
        <Alert variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Atenção: Férias Vencendo</AlertTitle>
          <AlertDescription>
            Você tem férias que vencem em{' '}
            {new Date(`${balance.expiration_date}T12:00:00Z`).toLocaleDateString('pt-BR')}. Solicite
            o gozo o quanto antes para evitar a perda do período aquisitivo.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Dias Adquiridos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{balance?.accrued || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Dias Utilizados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-500">{balance?.used || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Saldo Restante</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{balance?.remaining || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Dias Disponíveis (Pós Aprovação)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-500">{balance?.available || 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarRange className="h-5 w-5" /> Solicitar Férias
            </CardTitle>
            <CardDescription>
              Preencha as datas para solicitar seu período de descanso.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!balance || balance.months_worked < 12 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {!balance
                    ? 'Carregando saldo...'
                    : 'Você ainda não atingiu o período aquisitivo de 12 meses para solicitar férias.'}
                </AlertDescription>
              </Alert>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="start_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data Inicial</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="end_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data Final</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Gozar">Gozar</SelectItem>
                            <SelectItem value="Vender">Abono Pecuniário (Vender)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    Enviar Solicitação
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Solicitações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requests.map((r: any) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-card"
                >
                  <div>
                    <p className="font-medium">
                      {new Date(`${r.start_date}T12:00:00Z`).toLocaleDateString('pt-BR')} até{' '}
                      {new Date(`${r.end_date}T12:00:00Z`).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-sm text-muted-foreground">Tipo: {r.type}</p>
                  </div>
                  <Badge
                    variant={
                      r.status === 'Aprovado'
                        ? 'default'
                        : r.status === 'Rejeitado'
                          ? 'destructive'
                          : 'secondary'
                    }
                  >
                    {r.status}
                  </Badge>
                </div>
              ))}
              {requests.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma solicitação encontrada.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
