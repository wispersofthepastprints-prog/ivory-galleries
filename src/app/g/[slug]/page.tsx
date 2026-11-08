import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/src/lib/supabase-admin'
import { PublicGalleryClient, type PublicGallery } from '@/src/components/gallery/PublicGalleryClient'
import { PasswordGate } from '@/src/components/gallery/PasswordGate'
import { hasGalleryAccess } from '@/src/lib/gallery-access'
import { createSignedPhotoUrl } from '@/src/lib/photo-delivery'
import type { Photo, Photographer } from '@/src/types'

export const dynamic = 'force-dynamic'

type GalleryRecord = {
  id: string
  title: string
  slug: string
  client_name: string | null
  expiry_date: string | null
  seo_title: string | null
  seo_description: string | null
  metadata: Record<string, unknown> | null
  is_password_protected: boolean
  is_downloadable: boolean
  is_favorites_enabled: boolean
  access_mode: 'preview' | 'full'
  preview_limit: number
  unlock_price_cents: number | null
  watermark_enabled: boolean | null
  photos: Photo[]
  photographer: Pick<Photographer, 'business_name' | 'branding_colors' | 'subscription_tier' | 'subscription_status'> | null
}

async function getGallery(slug: string): Promise<GalleryRecord | null> {
  const { data } = await supabaseAdmin
    .from('galleries')
    .select(`
      id, title, slug, client_name, expiry_date, seo_title, seo_description,
      metadata, is_password_protected, is_downloadable, is_favorites_enabled,
      access_mode, preview_limit, unlock_price_cents, watermark_enabled,
      photos(*),
      photographer:photographers(business_name, branding_colors, subscription_tier, subscription_status)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()
  if (!data) return null
  const record = data as unknown as Omit<GalleryRecord, 'photographer'> & { photographer: GalleryRecord['photographer'] | GalleryRecord['photographer'][] }
  return {
    ...record,
    photographer: Array.isArray(record.photographer) ? record.photographer[0] || null : record.photographer,
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const gallery = await getGallery(slug)
  return {
    title: gallery?.seo_title || 'Private client gallery | Ivory Galleries',
    description: gallery?.seo_description || 'A private client photo gallery.',
    robots: { index: false, follow: false },
  }
}

export default async function PublicGalleryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const gallery = await getGallery(slug)
  if (!gallery) return notFound()
  if (gallery.expiry_date && new Date(gallery.expiry_date) < new Date()) return notFound()

  await supabaseAdmin.rpc('track_gallery_view', { gallery_slug: slug }).then(() => {}, () => {})
  const cookieStore = await cookies()
  const hasPasswordAccess = await hasGalleryAccess(gallery.id, 'password', cookieStore.get(`gp_${gallery.id}`)?.value)
  if (gallery.is_password_protected && !hasPasswordAccess) {
    return <PasswordGate galleryId={gallery.id} slug={gallery.slug} />
  }

  const hasPurchaseAccess = await hasGalleryAccess(gallery.id, 'purchase', cookieStore.get(`unlocked_${gallery.id}`)?.value)
  const isUnlocked = gallery.access_mode === 'full' || hasPurchaseAccess
  const allPhotos = [...(gallery.photos || [])].sort((a, b) => a.sort_order - b.sort_order)
  const visibleRecords = isUnlocked ? allPhotos : allPhotos.slice(0, gallery.preview_limit)
  const visiblePhotos = (await Promise.all(visibleRecords.map(async photo => {
    const sourceUrl = photo.display_url || photo.original_url || photo.thumbnail_url
    const signedUrl = sourceUrl ? await createSignedPhotoUrl(sourceUrl) : null
    return signedUrl ? { ...photo, public_url: signedUrl } : null
  }))).filter((photo): photo is Photo & { public_url: string } => Boolean(photo))

  const publicGallery: PublicGallery = {
    id: gallery.id,
    title: gallery.title,
    slug: gallery.slug,
    client_name: gallery.client_name,
    metadata: gallery.metadata,
    is_downloadable: gallery.is_downloadable,
    is_favorites_enabled: gallery.is_favorites_enabled,
    unlock_price_cents: gallery.unlock_price_cents,
    watermark_enabled: gallery.watermark_enabled,
    photographer: gallery.photographer ? {
      business_name: gallery.photographer.business_name,
      branding_colors: gallery.photographer.branding_colors,
    } : null,
  }
  const isFreeTier = !gallery.photographer || gallery.photographer.subscription_tier === 'free'
  const canSellUnlocks = ['studio', 'agency'].includes(gallery.photographer?.subscription_tier || '') && ['active', 'trialing'].includes(gallery.photographer?.subscription_status || '')

  return (
    <PublicGalleryClient
      gallery={publicGallery}
      photos={visiblePhotos}
      totalCount={allPhotos.length}
      isUnlocked={isUnlocked}
      isFreeTier={isFreeTier}
      canSellUnlocks={canSellUnlocks}
    />
  )
}
