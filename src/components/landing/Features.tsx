import { Zap, Shield, Palette, CalendarClock, DollarSign, Lock } from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Simple Image Uploads',
    desc: 'Drag and drop image files up to 25MB each, with your originals stored for client delivery.',
  },
  {
    icon: Palette,
    title: 'Your Studio Presentation',
    desc: 'Client galleries carry your studio name in a clean, professional layout designed for review.',
  },
  {
    icon: DollarSign,
    title: 'Paid Gallery Unlocks',
    desc: 'On Studio, offer a limited free preview and charge clients in AUD to unlock the complete gallery.',
  },
  {
    icon: CalendarClock,
    title: 'Controlled Availability',
    desc: 'Set a gallery expiry date or keep the link available until you choose to unpublish it.',
  },
  {
    icon: Shield,
    title: 'Preview Access Controls',
    desc: 'Choose a fully open gallery or limit the free preview until the client unlocks the rest.',
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
