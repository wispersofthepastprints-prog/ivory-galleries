import { Zap, Shield, Palette, ShoppingBag, Heart, Lock } from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast Upload',
    desc: 'Drag, drop, done. Our chunked uploader handles RAWs, JPEGs, and HEICs up to 50MB each.',
  },
  {
    icon: Palette,
    title: 'Your Brand, Everywhere',
    desc: 'Custom colors, logos, and domains. Your clients see your studio, not ours.',
  },
  {
    icon: Heart,
    title: 'Client Favorites',
    desc: 'Let clients heart their must-have shots. Export a favorites list in one click.',
  },
  {
    icon: ShoppingBag,
    title: 'Print Store (Coming Soon)',
    desc: 'Sell prints, canvases, and albums directly from your galleries — launching in Studio. Join the waitlist to shape it.',
  },
  {
    icon: Shield,
    title: 'Password Protected',
    desc: 'Lock galleries behind passwords or email-gated access. Your work stays yours.',
  },
  {
    icon: Lock,
    title: 'Download Control',
    desc: 'Choose what clients can download — full-res, web-size, or nothing at all.',
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-obsidian mb-4">
            Everything you need to deliver
          </h2>
          <p className="text-fog text-lg max-w-xl mx-auto">
            From upload to sale, Ivory Galleries handles the busywork so you can shoot more.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(f => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className="p-8 rounded-2xl bg-cream border border-stone/10 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-gold" />
                </div>
                <h3 className="text-lg font-bold text-obsidian mb-2">{f.title}</h3>
                <p className="text-fog text-sm leading-relaxed">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
