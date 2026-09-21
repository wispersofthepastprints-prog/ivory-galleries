'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { supabaseBrowser } from '@/src/lib/supabase'
import { isValidEmail, isValidPassword } from '@/src/lib/validators'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [tier, setTier] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setTier(params.get('tier'))
  }, [])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!isValidEmail(email)) { setError('Please enter a valid email address.'); return }
    if (!isValidPassword(password)) { setError('Password must be at least 8 characters.'); return }

    setLoading(true)
    const { data, error: authError } = await supabaseBrowser.auth.signUp({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Best-effort profile creation; if email confirmation is enabled there's no
    // session yet, so this may fail silently — a DB trigger can backfill instead.
    if (data.user) {
      const { error: profileError } = await supabaseBrowser.from('photographers').insert({
        id: data.user.id,
        email,
        business_name: businessName || email.split('@')[0],
      })
      if (profileError) console.warn('Profile insert deferred:', profileError.message)
    }

    if (tier) {
      window.location.href = `/api/stripe/checkout?tier=${encodeURIComponent(tier)}`
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo.png" alt="Ivory Galleries" className="w-24 h-24 rounded-2xl object-cover mx-auto mb-4 shadow-lg" />
          <h1 className="text-2xl font-bold text-obsidian">Create your studio</h1>
          <p className="text-fog text-sm mt-1">Start delivering galleries in minutes</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-obsidian mb-1">Business name</label>
            <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Whispers of the Past"
              className="w-full px-4 py-3 rounded-xl border border-stone/30 bg-white focus:outline-none focus:ring-2 focus:ring-gold/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-obsidian mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              placeholder="you@studio.com"
              className="w-full px-4 py-3 rounded-xl border border-stone/30 bg-white focus:outline-none focus:ring-2 focus:ring-gold/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-obsidian mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              placeholder="Minimum 8 characters"
              className="w-full px-4 py-3 rounded-xl border border-stone/30 bg-white focus:outline-none focus:ring-2 focus:ring-gold/50" />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <p className="text-center text-sm text-fog mt-6">
          Already have an account? <Link href="/login" className="text-gold font-semibold hover:underline">Sign in</Link>
        </p>
      </Card>
    </div>
  )
}
