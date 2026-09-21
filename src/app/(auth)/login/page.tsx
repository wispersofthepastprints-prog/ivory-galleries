'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/src/components/ui/Button'
import { Input } from '@/src/components/ui/Input'
import { Card } from '@/src/components/ui/Card'
import { supabaseBrowser } from '@/src/lib/supabase'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabaseBrowser.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <Card padding="xl" className="text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/logo.png" alt="Ivory Galleries" className="w-24 h-24 rounded-2xl object-cover mx-auto mb-6 shadow-lg" />
      <h1 className="text-2xl font-bold text-obsidian mb-2">Welcome back</h1>
      <p className="text-fog text-sm mb-8">Sign in to your Ivory Galleries account</p>

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <Input
          label="Email"
          type="email"
          placeholder="you@studio.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" className="w-full" loading={loading}>
          Sign In
        </Button>
      </form>

      <p className="mt-6 text-sm text-fog">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-gold font-semibold hover:underline">
          Get started free
        </Link>
      </p>
    </Card>
  )
}
