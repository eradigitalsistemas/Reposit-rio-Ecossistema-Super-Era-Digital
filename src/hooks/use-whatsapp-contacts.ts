import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { WhatsAppContact } from '@/types/whatsapp'

export function useWhatsappContacts() {
  const [contacts, setContacts] = useState<WhatsAppContact[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContacts = async () => {
      const { data } = await supabase
        .from('whatsapp_contacts')
        .select('*')
        .order('last_message_at', { ascending: false, nullsFirst: false })
      if (data) setContacts(data as WhatsAppContact[])
      setLoading(false)
    }
    fetchContacts()

    const channel = supabase
      .channel('public:whatsapp_contacts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'whatsapp_contacts' },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setContacts((prev) => {
              const next = prev.map((c) =>
                c.id === payload.new.id ? (payload.new as WhatsAppContact) : c,
              )
              return next.sort(
                (a, b) =>
                  new Date(b.last_message_at || 0).getTime() -
                  new Date(a.last_message_at || 0).getTime(),
              )
            })
          } else if (payload.eventType === 'INSERT') {
            setContacts((prev) => [payload.new as WhatsAppContact, ...prev])
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { contacts, loading }
}
