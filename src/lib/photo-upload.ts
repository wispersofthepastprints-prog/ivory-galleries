export const PHOTO_MAX_BYTES = 25 * 1024 * 1024
export const PHOTO_ACCEPT = 'image/jpeg,image/png,image/webp'
export const PHOTO_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

export function validatePhotoFile(file: File) {
  if (!PHOTO_MIME_TYPES.includes(file.type as (typeof PHOTO_MIME_TYPES)[number])) {
    throw new Error(`"${file.name}" must be a JPG, PNG, or WebP image.`)
  }
  if (file.size <= 0) {
    throw new Error(`"${file.name}" is empty.`)
  }
  if (file.size > PHOTO_MAX_BYTES) {
    throw new Error(`"${file.name}" is too large. The maximum is 25 MB.`)
  }
}

export function photoPathFromUrl(url: string) {
  const marker = '/storage/v1/object/public/photos/'
  const markerIndex = url.indexOf(marker)
  if (markerIndex < 0) return null

  const path = url.slice(markerIndex + marker.length).split('?')[0]
  try {
    return decodeURIComponent(path)
  } catch {
    return null
  }
}
