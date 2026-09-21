'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/src/lib/utils'
import {
  LayoutDashboard,
  Image,
  Upload,
  ShoppingBag,
  Settings,
  LogOut,
} from 'lucide-react'
import { supabaseBrowser } from '@/src/lib/supabase'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/galleries', label: 'Galleries', icon: Image },
  { href: '/dashboard/uploads', label: 'Uploads', icon: Upload },
  { href: '/dashboard/store', label: 'Print Store', icon: ShoppingBag },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabaseBrowser.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-64 min-h-screen bg-obsidian text-ivory flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo.png" alt="Ivory Galleries" className="w-10 h-10 rounded-xl object-cover" />
          <div>
            <h1 className="font-bold text-lg leading-tight">Ivory</h1>
            <p className="text-[10px] text-fog uppercase tracking-[0.2em]">Galleries</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-gold/10 text-gold'
                  : 'text-fog hover:text-ivory hover:bg-white/5'
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-fog hover:text-ivory hover:bg-white/5 transition-all w-full"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
