import { useEffect, useRef } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/supabase/client'
import useAuthStore from '@/stores/useAuthStore'

export function useAgendaNotifications() {
  const { toast } = useToast()
  const { user } = useAuthStore()
  const notifiedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!user) return

    const checkEvents = async () => {
      const now = new Date()
      const soon = new Date(now.getTime() + 15 * 60000)

      try {
        const { data: eventos } = await supabase
          .from('agenda_eventos')
          .select('id, titulo, data_inicio')
          .eq('usuario_id', user.id)
          .gte('data_inicio', now.toISOString())
          .lte('data_inicio', soon.toISOString())

        eventos?.forEach((ev) => {
          if (!notifiedRef.current.has(ev.id)) {
            toast({
              title: `Compromisso próximo: ${ev.titulo}`,
              description: `Começa às ${new Date(ev.data_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            })
            notifiedRef.current.add(ev.id)
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(`Compromisso próximo: ${ev.titulo}`, {
                body: `Começa às ${new Date(ev.data_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
              })
            }
          }
        })

        const { data: demandas } = await supabase
          .from('demandas')
          .select('id, titulo, data_vencimento')
          .eq('responsavel_id', user.id)
          .gte('data_vencimento', now.toISOString())
          .lte('data_vencimento', soon.toISOString())
          .neq('status', 'Concluído')

        demandas?.forEach((dem) => {
          if (dem.data_vencimento && !notifiedRef.current.has(dem.id)) {
            toast({
              title: `Prazo da demanda: ${dem.titulo}`,
              description: `Vence às ${new Date(dem.data_vencimento).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
              variant: 'destructive',
            })
            notifiedRef.current.add(dem.id)
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(`Prazo da demanda: ${dem.titulo}`, {
                body: `Vence às ${new Date(dem.data_vencimento).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
              })
            }
          }
        })
      } catch (err) {
        console.error('Error fetching notifications:', err)
      }
    }

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    checkEvents()
    const interval = setInterval(checkEvents, 60000)

    return () => clearInterval(interval)
  }, [user, toast])
}
