'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { usePhotos } from '@/src/hooks/usePhotos'
import { useGallery } from '@/src/hooks/useGallery'
import { useAuth } from '@/src/hooks/useAuth'
import { supabaseBrowser } from '@/src/lib/supabase'
import { Upload, CheckCircle2 } from 'lucide-react'

export default function UploadsPage() {
  const { photographer } = useAuth()
  const { galleries } = useGallery()
  const { uploadPhoto, uploading } = usePhotos()
  const [galleryId, setGalleryId] = useState('')
  const [done, setDone] = useState(0)
  const [error, setError] = useState('')

  const readyGalleries = galleries.filter(g => g.status !== 'archived')

  useEffect(() => {
    if (!galleryId && readyGalleries.length > 0) setGalleryId(readyGalleries[0].id)
  }, [galleries]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !photographer) return
    setError('')
    if (!galleryId) { setError('Select a gallery first.'); return }

        for (const file of Array.from(e.target.files)) {
      try {
        await uploadPhoto(file, galleryId, photographer.id)
        setDone(d => d + 1)
      } catch (err: any) {
        setError(err?.message ?? 'Upload failed — please try again')
        break
      }
    }
    e.target.value = ''
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-obsidian">Upload Photos</h1>
        <p className="text-fog text-sm">Photos are uploaded to the selected gallery and appear instantly.</p>
      </div>

      <Card className="p-6">
        <label className="block text-sm font-medium text-obsidian mb-2">Target gallery</label>
        <select value={galleryId} onChange={(e) => setGalleryId(e.target.value)}
          className="w-full max-w-md px-4 py-3 rounded-xl border border-stone/30 bg-white focus:outline-none focus:ring-2 focus:ring-gold/50 mb-6">
          <option value="" disabled>Select a gallery…</option>
          {readyGalleries.map(g => (
            <option key={g.id} value={g.id}>{g.title}{g.status === 'draft' ? ' (draft)' : ''}</option>
          ))}
        </select>

        <label className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-stone/40 rounded-2xl cursor-pointer hover:border-gold/60 hover:bg-gold/5 transition-colors">
          <Upload className="w-10 h-10 text-gold mb-3" />
          <span className="text-obsidian font-medium">Click to select photos</span>
          <span className="text-fog text-sm mt-1">JPEG, PNG or HEIC — uploaded straight to your gallery</span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
        </label>

        {uploading && <p className="text-sm text-gold mt-4">Uploading…</p>}
        {done > 0 && !uploading && (
          <p className="text-sm text-green-600 mt-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {done} photo{done === 1 ? '' : 's'} uploaded.
          </p>
        )}
        {error && <p className="text-sm text-red-500 mt-4">{error}</p>}
      </Card>
    </div>
  )
}
