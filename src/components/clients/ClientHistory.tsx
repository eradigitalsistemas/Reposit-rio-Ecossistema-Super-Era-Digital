import { Clock, FileText, CheckCircle, MessageSquare } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Client } from '@/types/client'
import useDemandStore from '@/stores/useDemandStore'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function ClientHistory({ client }: { client: Client }) {
  const { demands } = useDemandStore()

  const clientDemands = demands.filter((d) => d.clientId === client.id)

  const events: any[] = []

  clientDemands.forEach((demand) => {
    events.push({
      id: `created-${demand.id}`,
      date: demand.createdAt,
      title: `Demanda Criada: ${demand.title}`,
      description: demand.description || 'Sem descrição fornecida.',
      type: 'created',
      demandId: demand.id,
      status: demand.status,
    })

    if (demand.logs) {
      demand.logs.forEach((log) => {
        events.push({
          id: `log-${log.id}`,
          date: log.createdAt,
          title: `Atualização: ${log.acao}`,
          description: log.detalhes || '',
          type: 'log',
          demandId: demand.id,
          user: log.userName,
          demandTitle: demand.title,
        })
      })
    }

    if (demand.status === 'Concluído' && demand.completedAt) {
      events.push({
        id: `completed-${demand.id}`,
        date: demand.completedAt,
        title: `Demanda Concluída: ${demand.title}`,
        description: demand.responses?.[demand.responses.length - 1] || 'Finalizada com sucesso.',
        type: 'completed',
        demandId: demand.id,
      })
    }
  })

  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <Card className="h-full flex flex-col shadow-sm border-gray-200 dark:border-border">
      <CardHeader className="shrink-0">
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Histórico Integrado de Demandas
        </CardTitle>
        <CardDescription>
          Linha do tempo com todas as tarefas, movimentações e atualizações deste cliente.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto pr-2 pb-6">
        <div className="space-y-6 pl-4 border-l-2 border-gray-200 dark:border-white/10 ml-2">
          {events.map((event) => {
            const isCreated = event.type === 'created'
            const isCompleted = event.type === 'completed'
            const isLog = event.type === 'log'

            return (
              <div key={event.id} className="relative animate-fade-in-up">
                <div
                  className={cn(
                    'absolute -left-[25px] top-1 h-3.5 w-3.5 rounded-full ring-4 ring-white dark:ring-card flex items-center justify-center',
                    isCreated ? 'bg-blue-500' : isCompleted ? 'bg-green-500' : 'bg-amber-500',
                  )}
                />
                <div className="flex flex-col gap-1.5 pt-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-gray-900 dark:text-gray-100">
                      {event.title}
                    </span>
                    {isCreated && (
                      <Badge variant="outline" className="text-[10px] h-5">
                        {event.status}
                      </Badge>
                    )}
                    {isLog && event.user && (
                      <Badge variant="secondary" className="text-[10px] h-5">
                        Por: {event.user}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    {new Date(event.date).toLocaleDateString('pt-BR')} às{' '}
                    {new Date(event.date).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {isLog && event.demandTitle && (
                      <>
                        <span className="px-1">•</span>
                        <span className="truncate max-w-[200px]">Demanda: {event.demandTitle}</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-wrap break-words bg-gray-50 dark:bg-white/5 p-3 rounded-lg border border-gray-100 dark:border-white/10">
                    {event.description}
                  </p>
                </div>
              </div>
            )
          })}
          {events.length === 0 && (
            <div className="text-sm text-gray-500 dark:text-gray-400 -ml-4 pl-4 py-8 text-center flex flex-col items-center gap-2">
              <FileText className="w-8 h-8 text-gray-300 dark:text-gray-600" />
              Nenhuma demanda ou movimentação registrada para este cliente.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
