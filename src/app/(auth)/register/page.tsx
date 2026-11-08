'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { supabaseBrowser } from '@/src/lib/supabase'
import { isValidEmail, isValidPassword } from '@/src/lib/validators'
import { trackEvent } from '@/src/components/Analytics'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmationSent, setConfirmationSent] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!isValidEmail(email)) { setError('Please enter a valid email address.'); return }
    if (!isValidPassword(password)) { setError('Password must be at least 8 characters.'); return }

    setLoading(true)
    const { data, error: authError } = await supabaseBrowser.auth.signUp({
      email,
      password,
      options: {
        data: { business_name: businessName || email.split('@')[0] },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (data.user) trackEvent('signup_completed', '/register')
    if (data.session) {
      router.push('/dashboard')
    } else {
      setConfirmationSent(true)
      setLoading(false)
    }
  }

  if (confirmationSent) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8 text-center">
          <h1 className="text-2xl font-bold text-obsidian mb-3">Check your email</h1>
          <p className="text-fog leading-relaxed">Confirm your address to finish creating your studio. Then sign in to open your dashboard.</p>
          <Link href="/login" className="inline-block mt-6 text-gold font-semibold hover:underline">Go to sign in</Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo.png" alt="" className="w-24 h-24 rounded-2xl object-cover mx-auto mb-4 shadow-lg" />
          <h1 className="text-2xl font-bold text-obsidian">Create your studio</h1>
          <p className="text-fog text-sm mt-1">Start delivering galleries in minutes</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label htmlFor="business-name" className="block text-sm font-medium text-obsidian mb-1">Business name</label>
            <input id="business-name" type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Whispers of the Past" autoComplete="organization"
              className="w-full px-4 py-3 rounded-xl border border-stone/30 bg-white focus:outline-none focus:ring-2 focus:ring-gold/50" />
          </div>
          <div>
            <label htmlFor="register-email" className="block text-sm font-medium text-obsidian mb-1">Email</label>
            <input id="register-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              placeholder="you@studio.com" autoComplete="email"
              className="w-full px-4 py-3 rounded-xl border border-stone/30 bg-white focus:outline-none focus:ring-2 focus:ring-gold/50" />
          </div>
          <div>
            <label htmlFor="register-password" className="block text-sm font-medium text-obsidian mb-1">Password</label>
            <input id="register-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              placeholder="Minimum 8 characters" autoComplete="new-password"
              className="w-full px-4 py-3 rounded-xl border border-stone/30 bg-white focus:outline-none focus:ring-2 focus:ring-gold/50" />
          </div>

          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <p className="text-center text-sm text-fog mt-6">
          Already have an account? <Link href="/login" className="text-gold font-semibold hover:underline">Sign in</Link>
        </p>
      </Card>
    </div>
  )
}
