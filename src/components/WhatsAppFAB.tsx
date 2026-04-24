import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function WhatsAppFAB() {
  const navigate = useNavigate()
  const location = useLocation()

  if (location.pathname.includes('/whatsapp')) return null

  return (
    <Button
      onClick={() => navigate('/whatsapp')}
      className={cn(
        'fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 z-50 transition-transform hover:scale-105 active:scale-95 group',
        'animate-in fade-in slide-in-from-bottom-10 duration-500',
      )}
    >
      <MessageCircle className="h-6 w-6 text-white" />
      <span className="absolute -top-1 -right-1 flex h-4 w-4">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-white dark:border-zinc-900"></span>
      </span>
      <span className="sr-only">Abrir WhatsApp Mirror</span>

      {/* Tooltip hint */}
      <span className="absolute right-full mr-4 bg-foreground text-background text-xs font-medium px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        WhatsApp Mirror
      </span>
    </Button>
  )
}
