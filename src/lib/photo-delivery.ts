import { supabaseAdmin } from '@/src/lib/supabase-admin'

const PUBLIC_PHOTO_MARKER = '/storage/v1/object/public/photos/'
const SIGNED_URL_SECONDS = 60 * 60

function storagePathFromPublicUrl(url: string) {
  const markerIndex = url.indexOf(PUBLIC_PHOTO_MARKER)
  if (markerIndex < 0) return null

  const path = url.slice(markerIndex + PUBLIC_PHOTO_MARKER.length)
  try {
    return decodeURIComponent(path)
  } catch {
    return null
  }
}

export async function createSignedPhotoUrl(url: string) {
  const path = storagePathFromPublicUrl(url)
  if (!path) return null

  const { data, error } = await supabaseAdmin.storage
    .from('photos')
    .createSignedUrl(path, SIGNED_URL_SECONDS)

  return error ? null : data?.signedUrl ?? null
}
