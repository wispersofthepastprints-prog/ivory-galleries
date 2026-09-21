'use client'

import { useState } from 'react'
import { Lock, Loader2 } from 'lucide-react'

export function PasswordGate({ galleryId, slug }: { galleryId: string; slug: string }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/galleries/unlock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ galleryId, slug, password }),
    })
    if (res.ok) {
      window.location.href = `/g/${slug}`
    } else {
      setError('Incorrect password. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center p-6">
      <form onSubmit={submit} className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-sm text-center">
        <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-7 h-7 text-gold" />
        </div>
        <h1 className="text-xl font-bold text-obsidian mb-1">This gallery is private</h1>
        <p className="text-fog text-sm mb-6">Enter the password from your photographer to continue.</p>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="Password" required autoFocus
          className="w-full px-4 py-3 rounded-xl border border-stone/30 mb-3 focus:outline-none focus:ring-2 focus:ring-gold/50" />
        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-xl bg-gold text-obsidian font-semibold hover:bg-gold/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />} View Gallery
        </button>
                <div className="flex items-center justify-center gap-2 mt-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo.png" alt="Ivory Galleries" className="w-5 h-5 rounded object-cover" />
          <p className="text-xs text-fog">Powered by Ivory Galleries · a Whispers of the Past product</p>
        </div>
      </form>
    </div>
  )
}
