import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/src/lib/supabase-admin'
import { PublicGalleryClient } from '@/src/components/gallery/PublicGalleryClient'
import { PasswordGate } from '@/src/components/gallery/PasswordGate'
import { hasGalleryAccess } from '@/src/lib/gallery-access'
import { createSignedPhotoUrl } from '@/src/lib/photo-delivery'
import type { Photo } from '@/src/types'

export const dynamic = 'force-dynamic'

async function getGallery(slug: string) {
  const { data } = await supabaseAdmin
    .from('galleries')
    .select(`
      id, title, slug, client_name, expiry_date, seo_title, seo_description,
      metadata, is_password_protected, is_downloadable, is_favorites_enabled,
      access_mode, preview_limit, unlock_price_cents, watermark_enabled,
      photos(*),
      photographer:photographers(business_name, branding_colors, subscription_tier)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()
  return data
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const gallery = (await getGallery(params.slug)) as any
  return {
    title: gallery?.seo_title || `${gallery?.title || 'Gallery'} | Ivory Galleries`,
    description: gallery?.seo_description || `View your photos from ${gallery?.photographer?.business_name || 'your photographer'}`,
  }
}

export default async function PublicGalleryPage({ params }: { params: { slug: string } }) {
  const gallery = (await getGallery(params.slug)) as any
  if (!gallery) return notFound()
  if (gallery.expiry_date && new Date(gallery.expiry_date) < new Date()) return notFound()

  // Count the view (best-effort)
  await supabaseAdmin.rpc('track_gallery_view', { gallery_slug: params.slug }).then(() => {}, () => {})

  const cookieStore = cookies()
  const hasPasswordAccess = await hasGalleryAccess(
    gallery.id,
    'password',
    cookieStore.get(`gp_${gallery.id}`)?.value,
  )

  if (gallery.is_password_protected && !hasPasswordAccess) {
    return <PasswordGate galleryId={gallery.id} slug={gallery.slug} />
  }

  const hasPurchaseAccess = await hasGalleryAccess(
    gallery.id,
    'purchase',
    cookieStore.get(`unlocked_${gallery.id}`)?.value,
  )
  const isUnlocked = (gallery.access_mode ?? 'preview') === 'full' || hasPurchaseAccess

  const allPhotos: Photo[] = [...(gallery.photos || [])]
    .sort((a: Photo, b: Photo) => a.sort_order - b.sort_order)
  const visibleRecords = isUnlocked
    ? allPhotos
    : allPhotos.slice(0, gallery.preview_limit ?? 20)

  // Sign only the records this visitor may see. Locked photo records and URLs are
  // never passed to the Client Component.
  const visiblePhotos = (await Promise.all(
    visibleRecords.map(async (photo: Photo) => {
      const sourceUrl = photo.display_url || photo.original_url || photo.thumbnail_url
      const publicUrl = sourceUrl ? await createSignedPhotoUrl(sourceUrl) : null
      return publicUrl ? { ...photo, public_url: publicUrl } : null
    }),
  )).filter((photo): photo is Photo & { public_url: string } => Boolean(photo))

  const publicGallery = {
    id: gallery.id,
    title: gallery.title,
    slug: gallery.slug,
    client_name: gallery.client_name,
    expiry_date: gallery.expiry_date,
    metadata: gallery.metadata,
    is_downloadable: gallery.is_downloadable,
    is_favorites_enabled: gallery.is_favorites_enabled,
    unlock_price_cents: gallery.unlock_price_cents,
    watermark_enabled: gallery.watermark_enabled,
    photographer: gallery.photographer,
  }
  const isFreeTier = !gallery.photographer?.subscription_tier || gallery.photographer.subscription_tier === 'free'

  return (
    <PublicGalleryClient
      gallery={publicGallery as any}
      photos={visiblePhotos}
      totalCount={allPhotos.length}
      isUnlocked={isUnlocked}
      isFreeTier={isFreeTier}
    />
  )
}
