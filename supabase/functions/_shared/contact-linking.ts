import { SupabaseClient } from 'jsr:@supabase/supabase-js@2'

export interface LinkLidArgs {
  userId: string
  instanceId: string
  lidJid: string
  phoneJid: string
  canonicalPhone: string
  displayName?: string | null
}

export async function linkLidToPhone(supabase: SupabaseClient, args: LinkLidArgs): Promise<void> {
  const { userId, instanceId, lidJid, phoneJid, canonicalPhone, displayName } = args

  const { data: existingIdentity } = await supabase
    .from('contact_identity')
    .select('*')
    .eq('instance_id', instanceId)
    .eq('canonical_phone', canonicalPhone)
    .maybeSingle()

  if (existingIdentity) {
    const updates: any = {}
    if (existingIdentity.lid_jid !== lidJid) updates.lid_jid = lidJid
    if (existingIdentity.phone_jid !== phoneJid) updates.phone_jid = phoneJid
    if (displayName && !existingIdentity.display_name) updates.display_name = displayName

    if (Object.keys(updates).length > 0) {
      await supabase.from('contact_identity').update(updates).eq('id', existingIdentity.id)
    }
  } else {
    await supabase.from('contact_identity').insert({
      instance_id: instanceId,
      user_id: userId,
      canonical_phone: canonicalPhone,
      phone_jid: phoneJid,
      lid_jid: lidJid,
      display_name: displayName || null,
    })
  }

  const { data: phoneContact } = await supabase
    .from('whatsapp_contacts')
    .select('id')
    .eq('user_id', userId)
    .eq('remote_jid', phoneJid)
    .maybeSingle()

  const { data: lidContact } = await supabase
    .from('whatsapp_contacts')
    .select('id')
    .eq('user_id', userId)
    .eq('remote_jid', lidJid)
    .maybeSingle()

  if (phoneContact && lidContact && phoneContact.id !== lidContact.id) {
    await supabase.rpc('merge_whatsapp_contacts', {
      p_user_id: userId,
      p_primary_contact_id: phoneContact.id,
      p_secondary_contact_ids: [lidContact.id],
    })
  }
}
