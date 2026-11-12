'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Image,
  Upload,
  DollarSign,
  Settings,
  LogOut,
  X,
} from 'lucide-react'
import { supabaseBrowser } from '@/src/lib/supabase'
import { cn } from '@/src/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/galleries', label: 'Galleries', icon: Image },
  { href: '/dashboard/uploads', label: 'Uploads', icon: Upload },
  { href: '/dashboard/store', label: 'Sales', icon: DollarSign },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabaseBrowser.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-obsidian/60 lg:hidden"
        />
      )}
      <aside
        id="dashboard-navigation"
        className={cn(
          'fixed left-0 top-0 z-50 flex h-dvh w-64 max-w-[85vw] flex-col bg-obsidian text-ivory transition-transform duration-200 ease-out lg:visible lg:translate-x-0',
          isOpen ? 'visible translate-x-0' : 'invisible -translate-x-full'
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 p-6">
          <Link href="/dashboard" onClick={onClose} className="flex min-w-0 items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo.png" alt="Ivory Galleries" className="h-10 w-10 rounded-xl object-cover" />
            <div>
              <h1 className="font-bold text-lg leading-tight">Ivory</h1>
              <p className="text-[10px] text-fog uppercase tracking-[0.2em]">Galleries</p>
            </div>
          </Link>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-fog transition-colors hover:bg-white/5 hover:text-ivory focus:outline-none focus-visible:ring-2 focus-visible:ring-gold lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label="Dashboard navigation" className="flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex min-h-11 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold',
                  isActive
                    ? 'bg-gold/10 text-gold'
                    : 'text-fog hover:text-ivory hover:bg-white/5'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex min-h-11 w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-fog transition-all hover:bg-white/5 hover:text-ivory focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
