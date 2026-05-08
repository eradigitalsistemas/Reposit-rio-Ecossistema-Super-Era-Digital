import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  Loader2,
  Paperclip,
  Send,
  Mic,
  X,
  Image as ImageIcon,
  FileText,
  FileVideo,
  StopCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useWhatsappMessages } from '@/hooks/use-whatsapp-messages'
import { supabase } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'
import { MessageBubble } from './message-bubble'
import { WhatsAppContact } from '@/types/whatsapp'
import { useCoreAuth } from '@/hooks/use-auth'

function getBRTDate(dateStr: string) {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return new Date()
  const brtString = d.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' })
  return new Date(brtString)
}

function formatDate(dateStr: string) {
  const d = getBRTDate(dateStr)
  const now = getBRTDate(new Date().toISOString())
  if (d.toDateString() === now.toDateString()) return 'Hoje'
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return 'Ontem'
  return d.toLocaleDateString('pt-BR')
}

export function MessagesPanel({
  contact,
  onBack,
}: {
  contact: WhatsAppContact | null
  onBack: () => void
}) {
  const { messages } = useWhatsappMessages(contact?.id || null)
  const { user } = useCoreAuth()
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [attachment, setAttachment] = useState<{ file: File; type: string; url: string } | null>(
    null,
  )
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const audioChunks = useRef<BlobPart[]>([])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecording) {
      interval = setInterval(() => setRecordingTime((prev) => prev + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }, [messages])

  if (!contact) {
    return (
      <div className="flex-1 hidden sm:flex flex-col items-center justify-center bg-muted/10 relative">
        <div className="text-center z-10 p-6 rounded-xl bg-background/80 backdrop-blur shadow-sm border">
          <h2 className="text-xl font-medium mb-2">WhatsApp Web</h2>
          <p className="text-muted-foreground text-sm">
            Selecione uma conversa para começar a interagir
          </p>
        </div>
      </div>
    )
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    let type = 'document'
    if (file.type.startsWith('image/')) type = 'image'
    else if (file.type.startsWith('video/')) type = 'video'
    else if (file.type.startsWith('audio/')) type = 'audio'

    setAttachment({ file, type, url: URL.createObjectURL(file) })
    e.target.value = ''
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      mediaRecorder.current = recorder
      audioChunks.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data)
      }

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/ogg; codecs=opus' })
        const file = new File([audioBlob], 'audio.ogg', { type: 'audio/ogg' })
        setAttachment({ file, type: 'audio', url: URL.createObjectURL(file) })
        stream.getTracks().forEach((track) => track.stop())
        setRecordingTime(0)
      }

      recorder.start()
      setIsRecording(true)
      setRecordingTime(0)
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Não foi possível acessar o microfone',
        variant: 'destructive',
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop()
      setIsRecording(false)
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleSend = async () => {
    if (!input.trim() && !attachment) return
    setSending(true)
    try {
      if (attachment) {
        const formData = new FormData()
        formData.append(
          'instance_id',
          contact.instance_id || '07a2137e-124d-4161-9942-a901d3123bc2',
        )
        formData.append('phone', contact.phone_number || '')
        formData.append('message', input.trim())
        formData.append('user_id', user?.id || '')
        formData.append('file', attachment.file)

        const {
          data: { session },
        } = await supabase.auth.getSession()
        const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-media`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${session?.access_token}` },
          body: formData,
        })
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.error || errData.details || 'Falha ao enviar mídia')
        }
      } else {
        const { error } = await supabase.functions.invoke('send-message', {
          body: {
            instance_id: contact.instance_id || '07a2137e-124d-4161-9942-a901d3123bc2',
            phone: contact.phone_number,
            message: input.trim(),
            user_id: user?.id,
          },
        })
        if (error) throw error
      }
      setInput('')
      if (attachment?.url) URL.revokeObjectURL(attachment.url)
      setAttachment(null)
    } catch (err: any) {
      toast({ title: 'Erro ao enviar', description: err.message, variant: 'destructive' })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col relative w-full h-full">
      <div className="h-16 px-4 flex items-center gap-3 bg-[#f0f2f5] dark:bg-[#202c33] border-b border-border shadow-sm z-10 shrink-0">
        <Button variant="ghost" size="icon" className="sm:hidden -ml-2" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="h-10 w-10">
          <AvatarImage src={contact.profile_pic_url || ''} />
          <AvatarFallback>{contact.push_name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-semibold text-sm">{contact.push_name || contact.phone_number}</span>
          <span className="text-xs text-muted-foreground">{contact.phone_number}</span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative bg-[#efeae2] dark:bg-[#0b141a]">
        <div className="absolute inset-0 opacity-40 dark:opacity-5 pointer-events-none bg-[url('https://img.usecurling.com/p/500/500?q=pattern&shape=outline&color=gray')] bg-[length:300px]" />
        <ScrollArea className="h-full px-4 py-4 sm:px-8">
          <div className="flex flex-col gap-1 pb-4 max-w-4xl mx-auto z-10 relative">
            {messages.map((msg, i) => {
              const currentDay = getBRTDate(msg.timestamp!).toLocaleDateString('pt-BR')
              const prevDay =
                i > 0 ? getBRTDate(messages[i - 1].timestamp!).toLocaleDateString('pt-BR') : null
              const showDateSeparator = currentDay !== prevDay

              const isConsecutive =
                !showDateSeparator &&
                i > 0 &&
                messages[i - 1].from_me === msg.from_me &&
                new Date(msg.timestamp!).getTime() -
                  new Date(messages[i - 1].timestamp!).getTime() <
                  60000

              return (
                <div key={msg.id}>
                  {showDateSeparator && (
                    <div className="flex justify-center my-4">
                      <span className="bg-background/80 backdrop-blur shadow-sm text-xs px-3 py-1 rounded-lg text-muted-foreground uppercase">
                        {formatDate(msg.timestamp!)}
                      </span>
                    </div>
                  )}
                  <MessageBubble message={msg} isConsecutive={isConsecutive} />
                </div>
              )
            })}
            <div ref={scrollRef} className="h-1" />
          </div>
        </ScrollArea>
      </div>

      {attachment && (
        <div className="absolute bottom-[72px] left-0 right-0 bg-[#f0f2f5] dark:bg-[#202c33] p-4 border-t border-border shadow-lg z-20 flex gap-4 items-center animate-fade-in-up">
          <div className="relative shrink-0">
            {attachment.type === 'image' && (
              <img src={attachment.url} className="h-20 w-20 object-cover rounded-lg border" />
            )}
            {attachment.type === 'video' && (
              <video src={attachment.url} className="h-20 w-20 object-cover rounded-lg border" />
            )}
            {attachment.type === 'document' && (
              <div className="h-20 w-20 bg-background border flex flex-col items-center justify-center rounded-lg gap-1">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground max-w-full px-1 truncate">
                  {attachment.file.name.split('.').pop()?.toUpperCase()}
                </span>
              </div>
            )}
            {attachment.type === 'audio' && (
              <div className="h-20 w-32 bg-background border flex flex-col items-center justify-center rounded-lg gap-2">
                <Mic className="h-6 w-6 text-[#00a884]" />
                <span className="text-xs font-medium">Áudio</span>
              </div>
            )}
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-md"
              onClick={() => {
                URL.revokeObjectURL(attachment.url)
                setAttachment(null)
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{attachment.file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(attachment.file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
      )}

      <div className="p-3 bg-[#f0f2f5] dark:bg-[#202c33] flex items-end gap-2 z-10 shrink-0">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar"
        />
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 rounded-full"
          onClick={() => fileInputRef.current?.click()}
          disabled={sending || isRecording}
        >
          <Paperclip className="h-5 w-5 text-muted-foreground hover:text-foreground" />
        </Button>

        {isRecording ? (
          <div className="flex-1 flex items-center bg-white dark:bg-[#2a3942] rounded-lg px-4 py-2.5 h-[44px]">
            <div className="flex items-center gap-3 w-full animate-pulse text-destructive">
              <Mic className="h-5 w-5" />
              <span className="font-medium text-sm">Gravando... {formatTime(recordingTime)}</span>
            </div>
          </div>
        ) : (
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder={attachment ? 'Adicione uma legenda...' : 'Digite uma mensagem'}
            className="flex-1 bg-white dark:bg-[#2a3942] border-0 rounded-lg px-4 py-2.5 text-[15px] focus:ring-0 focus:outline-none resize-none min-h-[44px] max-h-[120px]"
            rows={1}
          />
        )}

        {input.trim() || attachment ? (
          <Button
            onClick={handleSend}
            disabled={sending || isRecording}
            className="shrink-0 h-11 w-11 rounded-full bg-[#00a884] hover:bg-[#008f6f] text-white p-0 transition-colors shadow-sm"
          >
            {sending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5 ml-0.5" />
            )}
          </Button>
        ) : (
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={sending}
            variant={isRecording ? 'destructive' : 'ghost'}
            className={`shrink-0 h-11 w-11 rounded-full p-0 transition-colors ${!isRecording && 'text-muted-foreground hover:text-foreground'}`}
          >
            {isRecording ? <StopCircle className="h-6 w-6" /> : <Mic className="h-5 w-5" />}
          </Button>
        )}
      </div>
    </div>
  )
}
