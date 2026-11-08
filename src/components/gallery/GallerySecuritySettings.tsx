'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Gallery } from '@/src/types'
import { Button } from '@/src/components/ui/Button'

interface Props {
  gallery: Gallery
  canUsePasswords: boolean
  onChanged: (enabled: boolean) => Promise<void>
}

export function GallerySecuritySettings({ gallery, canUsePasswords, onChanged }: Props) {
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const save = async (enabled: boolean) => {
    setError('')
    setMessage('')
    if (enabled && password.length < 8) {
      setError('Enter a new password of at least 8 characters.')
      return
    }
    setSaving(true)
    try {
      const response = await fetch('/api/galleries/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ galleryId: gallery.id, enabled, password }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to save password settings.')
      await onChanged(enabled)
      setPassword('')
      setMessage(enabled ? 'Password protection is active.' : 'Password protection is off.')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save password settings.')
    } finally {
      setSaving(false)
    }
  }

  if (!canUsePasswords) {
    return <p className="text-xs text-fog">Available on Pro and Studio. <Link href="/dashboard/settings?tab=billing" className="text-gold underline">Upgrade</Link></p>
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-fog">{gallery.is_password_protected ? 'A password is currently required.' : 'No password is currently required.'}</p>
      <label htmlFor="gallery-password" className="block text-xs font-medium text-fog">{gallery.is_password_protected ? 'New password' : 'Set a password'}</label>
      <input id="gallery-password" type="password" value={password} onChange={event => setPassword(event.target.value)} minLength={8} autoComplete="new-password"
        className="w-full px-3 py-2 rounded-lg border border-stone/30 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold/50" />
      <div className="flex gap-2">
        <Button size="sm" variant="outline" loading={saving} onClick={() => save(true)}>{gallery.is_password_protected ? 'Change password' : 'Enable password'}</Button>
        {gallery.is_password_protected && <Button size="sm" variant="ghost" disabled={saving} onClick={() => save(false)}>Turn off</Button>}
      </div>
      {message && <p className="text-xs text-green-700">{message}</p>}
      {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
