import { supabase } from '@/lib/supabase/client'

const BUCKET = 'empresa-files'

export async function uploadEmpresaFile(
  empresaId: string,
  file: File,
  subdir: string,
): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `empresas/${empresaId}/${subdir}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file)
  if (error) throw error
  return path
}

export async function uploadColaboradorFile(
  colaboradorId: string,
  file: File,
  subdir: string,
): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `colaboradores/${colaboradorId}/${subdir}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file)
  if (error) throw error
  return path
}

export async function deleteEmpresaFile(path: string): Promise<void> {
  await supabase.storage.from(BUCKET).remove([path])
}

export async function getEmpresaFileUrl(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600)
  if (error) return null
  return data?.signedUrl ?? null
}
