import { supabase } from '@/lib/supabase/client'

interface NotifData {
  titulo: string
  mensagem: string
  tipo: string | null
  referencia_id: string | null
  usuario_id: string | null
}

export async function createReminderNotification(original: NotifData, days: number): Promise<void> {
  if (!original.usuario_id) return

  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + days)

  const reminderRef = original.referencia_id
    ? `${original.referencia_id}_reminder_${days}d_${Date.now()}`
    : null

  await supabase.from('notificacoes').insert({
    usuario_id: original.usuario_id,
    titulo: original.titulo,
    mensagem: original.mensagem,
    tipo: original.tipo || 'vencimento_documento',
    referencia_id: reminderRef,
    data_criacao: futureDate.toISOString(),
    lida: false,
  })
}
