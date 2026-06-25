import { useAgendaNotifications } from '@/hooks/useAgendaNotifications'
import { useDemandNotifications } from '@/hooks/use-demand-notifications'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { BellRing } from 'lucide-react'

export function GlobalNotifications() {
  useAgendaNotifications()
  const { activeNotification, markAsRead } = useDemandNotifications()
  const navigate = useNavigate()

  return (
    <Dialog
      open={!!activeNotification}
      onOpenChange={(open) => {
        if (!open && activeNotification) {
          markAsRead(activeNotification.id)
        }
      }}
    >
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => {
          e.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2 text-primary">
            <BellRing className="w-5 h-5 animate-pulse text-red-500" />
            Nova Notificação
          </DialogTitle>
          <DialogDescription className="text-lg font-semibold text-foreground pt-4">
            {activeNotification?.titulo}
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <p className="text-muted-foreground">{activeNotification?.mensagem}</p>
        </div>
        <DialogFooter className="flex flex-row justify-end gap-2 sm:justify-end">
          <Button
            variant="outline"
            onClick={() => {
              if (activeNotification) markAsRead(activeNotification.id)
            }}
          >
            Fechar
          </Button>
          {activeNotification?.demanda_id && (
            <Button
              onClick={() => {
                if (activeNotification) {
                  markAsRead(activeNotification.id)
                  navigate(`/demandas?id=${activeNotification.demanda_id}`)
                }
              }}
            >
              Ver Demanda
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
