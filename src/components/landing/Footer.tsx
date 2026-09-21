import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-obsidian text-ivory py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logo.png" alt="Ivory Galleries" className="w-9 h-9 rounded-lg object-cover" />
              <span className="font-bold text-lg">Ivory Galleries</span>
            </div>
            <p className="text-fog text-sm leading-relaxed">
              Beautiful client galleries for professional photographers.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-fog">
              <li><Link href="#features" className="hover:text-ivory transition-colors">Features</Link></li>
              <li><Link href="#pricing" className="hover:text-ivory transition-colors">Pricing</Link></li>
              <li><Link href="#" className="hover:text-ivory transition-colors">Templates</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-fog">
              <li><Link href="#" className="hover:text-ivory transition-colors">About</Link></li>
              <li><Link href="#" className="hover:text-ivory transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-ivory transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-fog">
              <li><Link href="#" className="hover:text-ivory transition-colors">Privacy</Link></li>
              <li><Link href="#" className="hover:text-ivory transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 text-center text-sm text-fog">
          &copy; 2026 Ivory Galleries. Built for photographers, by photographers.
        </div>
      </div>
    </footer>
  )
}
