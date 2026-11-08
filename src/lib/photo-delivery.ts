import { supabaseAdmin } from '@/src/lib/supabase-admin'
import { photoPathFromUrl } from '@/src/lib/photo-upload'

const SIGNED_URL_SECONDS = 60 * 60

export async function createSignedPhotoUrl(url: string) {
  const path = photoPathFromUrl(url)
  if (!path) return null

  const { data, error } = await supabaseAdmin.storage
    .from('photos')
    .createSignedUrl(path, SIGNED_URL_SECONDS)

  return error ? null : data?.signedUrl ?? null
}
