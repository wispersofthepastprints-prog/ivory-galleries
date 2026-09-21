'use client'

import { useState, useCallback } from 'react'
import { UploadQueueItem } from '@/src/types'
import { usePhotos } from './usePhotos'
import { useAuth } from './useAuth'

export function useUpload() {
  const [queue, setQueue] = useState<UploadQueueItem[]>([])
  const { uploadPhoto } = usePhotos()
  const { photographer } = useAuth()

  const addToQueue = useCallback((files: FileList | null) => {
    if (!files) return
    const newItems: UploadQueueItem[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).slice(2),
      file,
      progress: 0,
      status: 'pending',
    }))
    setQueue(prev => [...prev, ...newItems])
    return newItems
  }, [])

  const processQueue = useCallback(async (galleryId: string) => {
    if (!photographer) return
    const pending = queue.filter(item => item.status === 'pending')

    for (const item of pending) {
      setQueue(prev =>
        prev.map(i => (i.id === item.id ? { ...i, status: 'uploading', progress: 10 } : i))
      )

      try {
        await uploadPhoto(item.file, galleryId, photographer.id)
        setQueue(prev =>
          prev.map(i => (i.id === item.id ? { ...i, status: 'complete', progress: 100 } : i))
        )
      } catch (err: any) {
        setQueue(prev =>
          prev.map(i => (i.id === item.id ? { ...i, status: 'error', error: err.message } : i))
        )
      }
    }
  }, [queue, photographer, uploadPhoto])

  const clearCompleted = useCallback(() => {
    setQueue(prev => prev.filter(item => item.status !== 'complete'))
  }, [])

  return { queue, addToQueue, processQueue, clearCompleted }
}
