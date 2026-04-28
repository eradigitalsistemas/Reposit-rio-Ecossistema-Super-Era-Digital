import { Clock, Check, CheckCheck, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { WhatsAppMessage } from '@/types/whatsapp'
import { MessageContent } from './message-content'

export function MessageBubble({
  message,
  isConsecutive,
}: {
  message: WhatsAppMessage
  isConsecutive: boolean
}) {
  const isMe = message.from_me
  const isReaction = message.type === 'reaction'
  const isSticker = message.type === 'sticker'

  if (isReaction) {
    return (
      <div className={cn('flex w-full', isMe ? 'justify-end' : 'justify-start')}>
        <div className="text-4xl">{message.text}</div>
      </div>
    )
  }

  if (isSticker) {
    return (
      <div
        className={cn(
          'flex w-full',
          isMe ? 'justify-end' : 'justify-start',
          isConsecutive ? 'mt-1' : 'mt-2',
        )}
      >
        <img
          src={message.media_url || ''}
          loading="lazy"
          className="max-w-[150px] max-h-[150px] object-contain"
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex w-full',
        isMe ? 'justify-end' : 'justify-start',
        isConsecutive ? 'mt-1' : 'mt-2',
      )}
    >
      <div
        className={cn(
          'relative max-w-[85%] sm:max-w-[65%] text-[15px] rounded-xl shadow-sm px-2 py-1.5',
          isMe
            ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-foreground'
            : 'bg-white dark:bg-[#202c33] text-foreground',
          !isConsecutive && isMe && 'rounded-tr-none',
          !isConsecutive && !isMe && 'rounded-tl-none',
        )}
      >
        {!isConsecutive && (
          <div
            className={cn(
              'absolute top-0 w-2 h-3',
              isMe
                ? '-right-2 text-[#d9fdd3] dark:text-[#005c4b]'
                : '-left-2 text-white dark:text-[#202c33]',
            )}
          >
            <svg viewBox="0 0 8 13" width="8" height="13" className="fill-current">
              {isMe ? (
                <path d="M0 0h8v1c-1.3 0-2.3.1-3.2.4-2.8 1-4.8 3.5-4.8 6.6v5H0V0z" />
              ) : (
                <path d="M8 0H0v1c1.3 0 2.3.1 3.2.4 2.8 1 4.8 3.5 4.8 6.6v5H8V0z" />
              )}
            </svg>
          </div>
        )}

        <div className="pb-4">
          <MessageContent message={message} />
        </div>

        <div
          className={cn(
            'absolute bottom-1 right-2 flex items-center gap-1 text-[11px]',
            isMe ? 'text-[#00000073] dark:text-[#ffffff99]' : 'text-muted-foreground',
          )}
        >
          {new Date(message.timestamp!).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
          {isMe && <MessageStatus status={message.status} />}
        </div>
      </div>
    </div>
  )
}

function MessageStatus({ status }: { status: string | null }) {
  if (status === 'pending') return <Clock className="h-3 w-3" />
  if (status === 'sent') return <Check className="h-3 w-3" />
  if (status === 'delivered') return <CheckCheck className="h-3 w-3" />
  if (status === 'read' || status === 'played')
    return <CheckCheck className="h-3 w-3 text-[#53bdeb]" />
  if (status === 'failed') return <AlertCircle className="h-3 w-3 text-red-500" />
  return <Check className="h-3 w-3 opacity-50" />
}
