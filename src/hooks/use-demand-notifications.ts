import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import useAuthStore from '@/stores/useAuthStore'
import { playNotificationSound } from '@/lib/sounds'

export function useDemandNotifications() {
  const { user } = useAuthStore()
  const initialized = useRef(false)
  const [activeNotification, setActiveNotification] = useState<any>(null)

  const fetchNextUnread = async () => {
    if (!user?.id) return
    const { data, error } = await supabase
      .from('notificacoes')
      .select('*')
      .eq('usuario_id', user.id)
      .eq('lida', false)
      .order('data_criacao', { ascending: false })
      .limit(1)

    if (!error && data && data.length > 0) {
      setActiveNotification(data[0])
    }
  }

  useEffect(() => {
    if (!user?.id) return

    let isMounted = true

    const fetchUnread = async () => {
      const { data, error } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('usuario_id', user.id)
        .eq('lida', false)
        .order('data_criacao', { ascending: false })
        .limit(1)

      if (error || !data || !isMounted) return

      if (data.length > 0) {
        playNotificationSound()
        setActiveNotification(data[0])
      }
    }

    if (!initialized.current) {
      initialized.current = true
      fetchUnread()
    }

    const channel = supabase
      .channel('demand_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notificacoes',
          filter: `usuario_id=eq.${user.id}`,
        },
        (payload) => {
          if (!isMounted) return
          const newNotif = payload.new
          if (!newNotif.lida) {
            playNotificationSound()
            setActiveNotification(newNotif)
          }
        },
      )
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  const markAsRead = async (id: string) => {
    setActiveNotification(null)
    await supabase.from('notificacoes').update({ lida: true }).eq('id', id)
    setTimeout(() => {
      fetchNextUnread()
    }, 500)
  }

  const closeNotification = () => {
    setActiveNotification(null)
  }

  return { activeNotification, markAsRead, closeNotification }
}
