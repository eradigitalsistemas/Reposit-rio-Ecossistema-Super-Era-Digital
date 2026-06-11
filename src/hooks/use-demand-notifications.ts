import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import useAuthStore from '@/stores/useAuthStore'
import { toast } from 'sonner'
import { playNotificationSound } from '@/lib/sounds'
import { useNavigate } from 'react-router-dom'

export function useDemandNotifications() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const initialized = useRef(false)

  useEffect(() => {
    if (!user?.id) return

    let isMounted = true

    async function markAsRead(id: string) {
      await supabase.from('notificacoes').update({ lida: true }).eq('id', id)
    }

    function showNotification(notif: any, playSound = false) {
      if (playSound) playNotificationSound()

      toast(notif.titulo, {
        description: notif.mensagem,
        action: {
          label: 'Ver',
          onClick: () => {
            markAsRead(notif.id)
            if (notif.demanda_id) {
              navigate(`/?highlight=${notif.demanda_id}`)
            }
          },
        },
        onDismiss: () => {
          markAsRead(notif.id)
        },
        duration: 10000,
      })
    }

    const fetchUnread = async () => {
      const { data, error } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('usuario_id', user.id)
        .eq('lida', false)

      if (error || !data || !isMounted) return

      if (data.length > 0) {
        playNotificationSound()
      }

      // Show limited amount of unread notifications to avoid filling up the screen
      const toShow = data.slice(0, 5)

      toShow.forEach((notif) => {
        showNotification(notif, false)
      })
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
            showNotification(newNotif, true)
          }
        },
      )
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [user?.id, navigate])
}
