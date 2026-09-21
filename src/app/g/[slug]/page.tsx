import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/src/lib/supabase-admin'
import { PublicGalleryClient } from '@/src/components/gallery/PublicGalleryClient'
import { PasswordGate } from '@/src/components/gallery/PasswordGate'
import type { Photo } from '@/src/types'

export const dynamic = 'force-dynamic'

async function getGallery(slug: string) {
  const { data } = await supabaseAdmin
    .from('galleries')
    .select('*, photos(*), photographer:photographers(business_name, branding_colors, subscription_tier)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()
  return data
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const gallery = await getGallery(params.slug)
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

  // Password gate
  if (gallery.is_password_protected && cookieStore.get(`gp_${gallery.id}`)?.value !== '1') {
    return <PasswordGate galleryId={gallery.id} slug={gallery.slug} />
  }

  // Paid unlock check: full galleries always open; preview galleries need cookie or ?unlocked=1
  const isUnlocked =
    (gallery.access_mode ?? 'preview') === 'full' ||
    cookieStore.get(`unlocked_${gallery.id}`)?.value === '1'

  const photos: (Photo & { public_url: string })[] = (gallery.photos || [])
    .sort((a: Photo, b: Photo) => a.sort_order - b.sort_order)
    .map((p: Photo) => ({
      ...p,
      public_url: p.display_url || p.original_url || p.thumbnail_url,
    }))

  const visiblePhotos = isUnlocked ? photos : photos.slice(0, gallery.preview_limit ?? 20)
  const isFreeTier = !gallery.photographer?.subscription_tier || gallery.photographer.subscription_tier === 'free'

  return (
    <PublicGalleryClient
      gallery={gallery}
      photos={visiblePhotos}
      totalCount={photos.length}
      isUnlocked={isUnlocked}
      isFreeTier={isFreeTier}
    />
  )
}
