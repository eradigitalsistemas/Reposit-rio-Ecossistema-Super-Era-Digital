import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { WhatsAppMessage } from '@/types/whatsapp'

export function useWhatsappMessages(contactId: string | null) {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const fetchMessages = async (offset = 0) => {
    if (!contactId) return
    setLoading(true)
    const { data } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .eq('contact_id', contactId)
      .order('timestamp', { ascending: false })
      .range(offset, offset + 49)

    if (data) {
      setMessages((prev) =>
        offset === 0
          ? (data.reverse() as WhatsAppMessage[])
          : [...(data.reverse() as WhatsAppMessage[]), ...prev],
      )
      setHasMore(data.length === 50)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!contactId) {
      setMessages([])
      return
    }
    fetchMessages(0)
    supabase.rpc('fn_mark_chat_read', { p_contact_id: contactId })

    const channel = supabase
      .channel(`messages:${contactId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'whatsapp_messages',
          filter: `contact_id=eq.${contactId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as WhatsAppMessage])
          supabase.rpc('fn_mark_chat_read', { p_contact_id: contactId })
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'whatsapp_messages',
          filter: `contact_id=eq.${contactId}`,
        },
        (payload) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === payload.new.id ? (payload.new as WhatsAppMessage) : m)),
          )
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [contactId])

  const loadMore = () => {
    if (!loading && hasMore) fetchMessages(messages.length)
  }

  return { messages, loading, hasMore, loadMore }
}
