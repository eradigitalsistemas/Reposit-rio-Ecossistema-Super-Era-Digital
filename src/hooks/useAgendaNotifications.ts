import { useEffect, useRef } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/supabase/client'
import useAuthStore from '@/stores/useAuthStore'

function playBeep() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(600, ctx.currentTime)
    gain.gain.setValueAtTime(0.1, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.3)
  } catch (e) {
    console.error('Audio error', e)
  }
}

export function useAgendaNotifications() {
  const { toast } = useToast()
  const { user } = useAuthStore()
  const notifiedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!user) return

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    const checkEvents = async () => {
      const alertsEnabled = localStorage.getItem('agenda_alerts_enabled')
      if (alertsEnabled === 'false') return

      const now = new Date()
      const startOfToday = new Date()
      startOfToday.setHours(0, 0, 0, 0)
      const endOfToday = new Date()
      endOfToday.setHours(23, 59, 59, 999)

      try {
        const { data: eventos } = await supabase
          .from('agenda_eventos')
          .select('id, titulo, data_inicio')
          .eq('usuario_id', user.id)
          .gte('data_inicio', startOfToday.toISOString())
          .lte('data_inicio', endOfToday.toISOString())

        eventos?.forEach((ev) => {
          const evTime = new Date(ev.data_inicio).getTime()
          const nowTime = now.getTime()

          if (
            evTime <= nowTime + 60000 &&
            evTime > nowTime - 300000 &&
            !notifiedRef.current.has(ev.id)
          ) {
            notifiedRef.current.add(ev.id)
            playBeep()
            toast({
              title: `📅 Agenda: ${ev.titulo}`,
              description: `Seu compromisso está começando agora!`,
              className: 'bg-primary text-primary-foreground',
            })
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(`📅 Agenda: ${ev.titulo}`, {
                body: `Seu compromisso está começando agora!`,
              })
            }
          }
        })
      } catch (err) {
        console.error('Error fetching notifications:', err)
      }
    }

    checkEvents()
    const interval = setInterval(checkEvents, 60000)

    return () => clearInterval(interval)
  }, [user, toast])
}
