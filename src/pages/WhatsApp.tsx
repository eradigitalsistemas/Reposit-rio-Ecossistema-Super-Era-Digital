import { useState } from 'react'
import { ConversationsSidebar } from '@/components/whatsapp/conversations-sidebar'
import { MessagesPanel } from '@/components/whatsapp/messages-panel'
import { useWhatsappContacts } from '@/hooks/use-whatsapp-contacts'

export default function WhatsApp() {
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null)
  const { contacts } = useWhatsappContacts()

  const selectedContact = contacts.find((c) => c.id === selectedContactId) || null

  return (
    <div className="h-[calc(100dvh-4rem)] sm:h-[calc(100vh-4rem)] w-full bg-background flex overflow-hidden border-t border-border">
      <ConversationsSidebar
        contacts={contacts}
        selectedContactId={selectedContactId}
        onSelectContact={setSelectedContactId}
      />
      <MessagesPanel contact={selectedContact} onBack={() => setSelectedContactId(null)} />
    </div>
  )
}
