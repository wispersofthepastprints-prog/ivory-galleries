'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/src/components/layout/Header'
import { Card } from '@/src/components/ui/Card'
import { Button } from '@/src/components/ui/Button'
import { Input } from '@/src/components/ui/Input'
import { useGallery } from '@/src/hooks/useGallery'
import { generateSlug } from '@/src/lib/utils'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewGalleryPage() {
  const router = useRouter()
  const { createGallery } = useGallery()
  const [title, setTitle] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) return
    setLoading(true)

    try {
      const slug = generateSlug(title)
      const gallery = await createGallery({
        title,
        slug,
        client_name: clientName || null,
        client_email: clientEmail || null,
        event_date: eventDate || null,
        status: 'draft',
      })
      if (gallery) {
        router.push(`/dashboard/galleries/${gallery.id}`)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Header
        title="New Gallery"
        subtitle="Create a new client gallery"
        action={
          <Link href="/dashboard/galleries">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /> Back</Button>
          </Link>
        }
      />

      <Card padding="lg" className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Gallery Title"
            placeholder="e.g. Sarah & Mike Wedding"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Client Name"
              placeholder="e.g. Sarah Johnson"
              value={clientName}
              onChange={e => setClientName(e.target.value)}
            />
            <Input
              label="Client Email"
              type="email"
              placeholder="client@example.com"
              value={clientEmail}
              onChange={e => setClientEmail(e.target.value)}
            />
          </div>
          <Input
            label="Event Date"
            type="date"
            value={eventDate}
            onChange={e => setEventDate(e.target.value)}
          />

          <div className="flex items-center gap-3 pt-4">
            <Button type="submit" loading={loading}>Create Gallery</Button>
            <Link href="/dashboard/galleries">
              <Button variant="ghost" type="button">Cancel</Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  )
}
