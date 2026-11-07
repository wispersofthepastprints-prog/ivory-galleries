import { createHash, randomBytes } from 'crypto'
import { supabaseAdmin } from '@/src/lib/supabase-admin'

export type GalleryAccessType = 'password' | 'purchase'

const ACCESS_SECONDS: Record<GalleryAccessType, number> = {
  password: 60 * 60 * 24 * 30,
  purchase: 60 * 60 * 24 * 365,
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export async function issueGalleryAccess(galleryId: string, accessType: GalleryAccessType) {
  const token = randomBytes(32).toString('base64url')
  const maxAge = ACCESS_SECONDS[accessType]
  const expiresAt = new Date(Date.now() + maxAge * 1000).toISOString()

  const { error } = await supabaseAdmin
    .from('gallery_access_grants')
    .insert({
      gallery_id: galleryId,
      access_type: accessType,
      token_hash: hashToken(token),
      expires_at: expiresAt,
    })

  if (error) throw error
  return { token, maxAge }
}

export async function hasGalleryAccess(
  galleryId: string,
  accessType: GalleryAccessType,
  token: string | undefined,
) {
  if (!token) return false

  const { data, error } = await supabaseAdmin
    .from('gallery_access_grants')
    .select('id')
    .eq('gallery_id', galleryId)
    .eq('access_type', accessType)
    .eq('token_hash', hashToken(token))
    .gt('expires_at', new Date().toISOString())
    .limit(1)
    .maybeSingle()

  return !error && Boolean(data)
}
