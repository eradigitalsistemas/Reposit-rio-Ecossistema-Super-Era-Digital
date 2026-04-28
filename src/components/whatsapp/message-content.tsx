import { FileText, Download, MapPin, Loader2, Info, Bot, User } from 'lucide-react'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { WhatsAppMessage } from '@/types/whatsapp'

export function MessageContent({ message }: { message: WhatsAppMessage }) {
  const {
    type,
    text,
    media_url,
    transcription,
    media_description,
    transcription_status,
    transcription_error,
  } = message

  if (type === 'audio') {
    return (
      <div className="flex flex-col gap-2 min-w-[200px] mt-1">
        <audio controls className="h-10 w-full" src={media_url || ''} />
        {transcription_status && transcription_status !== 'skipped_group' && (
          <div className="bg-black/5 dark:bg-white/5 rounded p-2 text-sm border-l-2 border-[#00a884]">
            <div className="flex items-center gap-1 text-xs font-semibold text-[#00a884] mb-1">
              <Bot className="h-3 w-3" /> Transcrição automática
            </div>
            {transcription_status === 'pending' || transcription_status === 'processing' ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" /> Transcrevendo...
              </div>
            ) : transcription_status === 'failed' ? (
              <div className="flex items-center gap-1 text-orange-500">
                <Info className="h-3 w-3" /> {transcription_error || 'Falha'}
              </div>
            ) : transcription ? (
              <p className="italic text-foreground/90 leading-relaxed text-[13px]">
                {transcription}
              </p>
            ) : null}
          </div>
        )}
      </div>
    )
  }

  if (type === 'image') {
    return (
      <div className="flex flex-col gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <img
              src={media_url || ''}
              loading="lazy"
              className="max-w-[280px] max-h-[300px] rounded-lg cursor-pointer object-cover mt-1"
            />
          </DialogTrigger>
          <DialogContent className="max-w-4xl p-0 bg-transparent border-none shadow-none">
            <img
              src={media_url || ''}
              loading="lazy"
              className="w-full h-auto max-h-[85vh] object-contain"
            />
          </DialogContent>
        </Dialog>
        {text && <p className="whitespace-pre-wrap break-words px-1 text-[15px]">{text}</p>}
        {transcription_status === 'completed' && media_description && (
          <div className="bg-black/5 dark:bg-white/5 rounded p-2 text-sm border-l-2 border-[#00a884]">
            <div className="flex items-center gap-1 text-xs font-semibold text-[#00a884] mb-1">
              <Bot className="h-3 w-3" /> Descrição da imagem
            </div>
            <p className="italic text-foreground/90 leading-relaxed text-[13px]">
              {media_description}
            </p>
          </div>
        )}
      </div>
    )
  }

  if (type === 'video') {
    return (
      <div className="flex flex-col gap-1 mt-1">
        <video controls className="max-w-[280px] rounded-lg bg-black" src={media_url || ''} />
        {text && <p className="whitespace-pre-wrap break-words px-1">{text}</p>}
      </div>
    )
  }

  if (type === 'document') {
    return (
      <div className="flex items-center gap-3 bg-black/5 dark:bg-white/5 p-3 rounded-lg min-w-[200px] mt-1">
        <div className="bg-[#00a884] p-2 rounded text-white">
          <FileText className="h-6 w-6" />
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="font-medium text-sm truncate">{text || 'Documento'}</div>
        </div>
        <a
          href={media_url || '#'}
          target="_blank"
          rel="noreferrer"
          className="text-muted-foreground hover:text-foreground"
        >
          <Download className="h-5 w-5" />
        </a>
      </div>
    )
  }

  if (type === 'location') {
    return (
      <div className="flex flex-col gap-1 mt-1">
        <div className="bg-muted w-[250px] h-[150px] rounded-lg flex items-center justify-center">
          <MapPin className="h-8 w-8 text-muted-foreground" />
        </div>
        <a
          href={`https://maps.google.com/?q=${text}`}
          target="_blank"
          rel="noreferrer"
          className="text-blue-500 hover:underline text-sm px-1"
        >
          Ver no mapa
        </a>
      </div>
    )
  }

  if (type === 'contact') {
    return (
      <div className="flex items-center gap-3 min-w-[200px] border-b border-border/50 pb-2 mt-1">
        <Avatar className="h-10 w-10">
          <AvatarFallback>
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium">{text}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="whitespace-pre-wrap break-words px-1">
      {text?.split(/(\bhttps?:\/\/[^\s]+)/g).map((part, i) =>
        /^https?:\/\//.test(part) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noreferrer"
            className="text-blue-500 hover:underline"
          >
            {part}
          </a>
        ) : (
          part
        ),
      )}
    </div>
  )
}
