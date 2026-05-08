import { Check, CheckCheck, Clock, FileText, Play, Volume2 } from 'lucide-react'
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export function MessageBubble({
  message,
  isConsecutive,
}: {
  message: any
  isConsecutive: boolean
}) {
  const isMe = message.from_me
  const time = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

  return (
    <div
      className={cn(
        'flex w-full mb-1',
        isMe ? 'justify-end' : 'justify-start',
        !isConsecutive && 'mt-2',
      )}
    >
      <div
        className={cn(
          'max-w-[85%] sm:max-w-[75%] rounded-lg px-3 py-1.5 relative group shadow-sm',
          isMe
            ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-foreground rounded-tr-none'
            : 'bg-white dark:bg-[#202c33] text-foreground rounded-tl-none',
          isConsecutive && (isMe ? 'rounded-tr-lg' : 'rounded-tl-lg'),
        )}
      >
        {/* TEXT MESSAGE */}
        {message.type === 'text' && (
          <p className="text-[15px] leading-snug whitespace-pre-wrap break-words pb-3">
            {message.text}
          </p>
        )}

        {/* IMAGE MESSAGE */}
        {message.type === 'image' && (
          <div className="pb-3 pt-1">
            <Dialog>
              <DialogTrigger asChild>
                <img
                  src={
                    message.media_url || 'https://img.usecurling.com/p/300/300?q=image&color=gray'
                  }
                  alt="Mídia"
                  className="rounded-md max-h-[300px] w-auto object-cover cursor-pointer hover:opacity-90 transition-opacity"
                />
              </DialogTrigger>
              <DialogContent className="max-w-4xl p-1 bg-transparent border-none shadow-none">
                <DialogTitle className="sr-only">Visualizar Imagem</DialogTitle>
                <img
                  src={message.media_url || ''}
                  alt="Mídia ampliada"
                  className="w-full h-auto max-h-[85vh] object-contain rounded-md"
                />
              </DialogContent>
            </Dialog>
            {message.media_description && (
              <p className="text-[13px] italic bg-black/5 dark:bg-white/5 p-2 rounded mt-2 border-l-2 border-primary/50 text-muted-foreground leading-snug">
                {message.media_description}
              </p>
            )}
            {message.text && (
              <p className="text-[15px] mt-2 leading-snug whitespace-pre-wrap break-words">
                {message.text}
              </p>
            )}
          </div>
        )}

        {/* AUDIO MESSAGE */}
        {message.type === 'audio' && (
          <div className="pb-3 pt-1 flex flex-col gap-2 min-w-[220px]">
            <div className="flex items-center gap-3">
              <button className="h-10 w-10 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center shrink-0 text-primary">
                <Play className="h-5 w-5 fill-current ml-1" />
              </button>
              <div className="flex-1 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                <div className="w-1/3 h-full bg-[#00a884] rounded-full" />
              </div>
            </div>
            {message.transcription && (
              <div className="text-[13px] italic bg-black/5 dark:bg-white/5 p-2 rounded border-l-2 border-[#00a884] text-muted-foreground">
                <Volume2 className="h-3 w-3 inline mr-1 mb-0.5" />"{message.transcription}"
              </div>
            )}
          </div>
        )}

        {/* VIDEO MESSAGE */}
        {message.type === 'video' && (
          <div className="pb-3 pt-1">
            <Dialog>
              <DialogTrigger asChild>
                <div className="relative cursor-pointer group rounded-md overflow-hidden bg-black/10">
                  <video
                    src={message.media_url || ''}
                    className="rounded-md max-h-[300px] w-auto object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                    <Play className="h-12 w-12 text-white fill-white opacity-90 shadow-sm" />
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-4xl p-1 bg-transparent border-none shadow-none">
                <DialogTitle className="sr-only">Visualizar Vídeo</DialogTitle>
                <video
                  src={message.media_url || ''}
                  controls
                  autoPlay
                  className="w-full h-auto max-h-[85vh] rounded-md"
                />
              </DialogContent>
            </Dialog>
            {message.text && (
              <p className="text-[15px] mt-2 leading-snug whitespace-pre-wrap break-words">
                {message.text}
              </p>
            )}
          </div>
        )}

        {/* DOCUMENT MESSAGE */}
        {message.type === 'document' && (
          <div className="pb-3 pt-1">
            <a
              href={message.media_url || '#'}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 bg-black/5 dark:bg-white/5 p-3 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
              <div className="h-10 w-10 bg-primary/10 rounded-md flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] leading-tight font-medium truncate">
                  {message.text || 'Documento'}
                </p>
                <p className="text-[11px] text-muted-foreground uppercase mt-0.5">
                  {message.media_type?.split('/')[1] || 'ARQUIVO'}
                </p>
              </div>
            </a>
          </div>
        )}

        {/* DEFAULT FALLBACK FOR OTHER TYPES */}
        {!['text', 'image', 'audio', 'video', 'document'].includes(message.type) && (
          <p className="text-[15px] italic text-muted-foreground pb-3">
            Mensagem não suportada ({message.type})
          </p>
        )}

        {/* STATUS AND TIME INDICATOR */}
        <div className="absolute right-2 bottom-1 flex items-center gap-1 text-[10px] text-muted-foreground/80">
          <span>{time}</span>
          {isMe && (
            <span className="ml-0.5">
              {message.status === 'pending' && <Clock className="h-[11px] w-[11px]" />}
              {message.status === 'sent' && <Check className="h-[13px] w-[13px]" />}
              {message.status === 'delivered' && <CheckCheck className="h-[13px] w-[13px]" />}
              {(message.status === 'read' || message.status === 'played') && (
                <CheckCheck className="h-[13px] w-[13px] text-[#53bdeb]" />
              )}
              {message.status === 'failed' && <span className="text-red-500 font-medium">!</span>}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
