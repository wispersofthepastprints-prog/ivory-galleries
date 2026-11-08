import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Analytics } from '@/src/components/Analytics'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://galleries.whispersofthepast.co'),
  title: 'Client Gallery Software for Photographers | Ivory Galleries',
  description: 'Deliver client photos in a clean online gallery, control previews and downloads, and offer paid gallery access on Studio.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Ivory Galleries — Client Photo Delivery',
    description: 'Simple client galleries for wedding and portrait photographers.',
    url: '/',
    siteName: 'Ivory Galleries',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
