import { useState } from 'react'
import { Search, Users, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { WhatsAppContact } from '@/types/whatsapp'

export function ConversationsSidebar({
  contacts,
  selectedContactId,
  onSelectContact,
}: {
  contacts: WhatsAppContact[]
  selectedContactId: string | null
  onSelectContact: (id: string) => void
}) {
  const [search, setSearch] = useState('')

  const filtered = contacts.filter((c) =>
    (c.push_name || c.phone_number || '').toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div
      className={cn(
        'flex flex-col border-r border-border bg-card',
        selectedContactId ? 'hidden sm:flex w-[30%] min-w-[320px] max-w-[420px]' : 'w-full',
      )}
    >
      <div className="p-3 border-b border-border bg-[#f0f2f5] dark:bg-[#202c33]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar ou começar uma nova conversa"
            className="pl-9 bg-white dark:bg-[#2a3942] border-0 h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="flex-1 bg-white dark:bg-[#111b21]">
        {filtered.map((contact) => (
          <button
            key={contact.id}
            onClick={() => onSelectContact(contact.id)}
            className={cn(
              'flex items-center gap-3 w-full p-3 hover:bg-[#f5f6f6] dark:hover:bg-[#202c33] transition-colors text-left border-b border-border/50',
              selectedContactId === contact.id && 'bg-[#f0f2f5] dark:bg-[#2a3942]',
            )}
          >
            <Avatar className="h-12 w-12 shrink-0">
              <AvatarImage src={contact.profile_pic_url || ''} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {contact.is_group ? (
                  <Users className="h-5 w-5" />
                ) : (
                  contact.push_name?.[0]?.toUpperCase() || <User className="h-5 w-5" />
                )}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden min-w-0">
              <div className="flex justify-between items-baseline mb-0.5">
                <span className="font-medium text-[16px] truncate">
                  {contact.push_name || contact.phone_number}
                </span>
                <span className="text-xs text-muted-foreground shrink-0 ml-2">
                  {contact.last_message_at ? formatTime(contact.last_message_at) : ''}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[14px] text-muted-foreground truncate">
                  {contact.last_message_text || 'Mensagem...'}
                </span>
                {contact.unread_count && contact.unread_count > 0 ? (
                  <span className="bg-[#25D366] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center shrink-0">
                    {contact.unread_count}
                  </span>
                ) : null}
              </div>
            </div>
          </button>
        ))}
      </ScrollArea>
    </div>
  )
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) {
    return 'Ontem'
  }
  return d.toLocaleDateString()
}
