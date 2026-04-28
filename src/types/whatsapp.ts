export type WhatsAppContact = {
  id: string
  instance_id: string | null
  remote_jid: string
  phone_number: string | null
  push_name: string | null
  profile_pic_url: string | null
  is_group: boolean | null
  last_message_at: string | null
  last_message_text: string | null
  unread_count: number | null
}

export type WhatsAppMessage = {
  id: string
  contact_id: string | null
  uazapi_message_id: string | null
  from_me: boolean | null
  type: string | null
  text: string | null
  media_url: string | null
  media_type: string | null
  transcription: string | null
  media_description: string | null
  transcription_status: string | null
  transcription_error: string | null
  timestamp: string | null
  status: string | null
}
