import { useAgendaNotifications } from '@/hooks/useAgendaNotifications'
import { useDemandNotifications } from '@/hooks/use-demand-notifications'

export function GlobalNotifications() {
  useAgendaNotifications()
  useDemandNotifications()
  return null
}
