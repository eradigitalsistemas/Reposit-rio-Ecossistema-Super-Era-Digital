import { Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Client } from '@/types/client'

export function ClientHistory({ client }: { client: Client }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Linha do Tempo</CardTitle>
        <CardDescription>Movimentações e estágios das demandas do cliente.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8 pl-4 border-l-2 border-muted ml-2">
          {client.history.map((event) => (
            <div key={event.id} className="relative">
              <div className="absolute -left-[25px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{event.stage}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(event.date).toLocaleDateString('pt-BR')} às{' '}
                    {new Date(event.date).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{event.description}</p>
              </div>
            </div>
          ))}
          {client.history.length === 0 && (
            <div className="text-sm text-muted-foreground -ml-4 pl-4">
              Nenhum histórico registrado.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
