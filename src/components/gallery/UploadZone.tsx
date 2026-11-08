'use client'

import { useCallback } from 'react'
import { ImagePlus } from 'lucide-react'
import { PHOTO_ACCEPT, PHOTO_MIME_TYPES } from '@/src/lib/photo-upload'

interface UploadZoneProps {
  onUpload: (files: File[]) => void
  accept?: string
}

export function UploadZone({ onUpload, accept = PHOTO_ACCEPT }: UploadZoneProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const files = Array.from(e.dataTransfer.files).filter(f => PHOTO_MIME_TYPES.includes(f.type as (typeof PHOTO_MIME_TYPES)[number]))
      onUpload(files)
    },
    [onUpload]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []).filter(f => PHOTO_MIME_TYPES.includes(f.type as (typeof PHOTO_MIME_TYPES)[number]))
      onUpload(files)
      e.target.value = ''
    },
    [onUpload]
  )

  return (
    <div
      onDragOver={e => e.preventDefault()}
      onDrop={handleDrop}
      className="border-2 border-dashed border-stone/20 rounded-2xl p-12 text-center hover:border-gold/50 hover:bg-gold/5 transition-all cursor-pointer group"
    >
      <input
        type="file"
        multiple
        accept={accept}
        onChange={handleChange}
        className="hidden"
        id="upload-input"
      />
      <label htmlFor="upload-input" className="cursor-pointer block">
        <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
          <ImagePlus className="w-8 h-8 text-gold" />
        </div>
        <p className="text-obsidian font-semibold mb-1">Drop photos here or click to browse</p>
        <p className="text-fog text-sm">JPG, PNG, or WebP up to 25 MB each</p>
      </label>
    </div>
  )
}
