import { Upload, Share2, CreditCard } from 'lucide-react'

const steps = [
  {
    num: '01',
    icon: Upload,
    title: 'Upload Your Photos',
    desc: 'Drag and drop entire wedding sets. We handle RAW conversion, thumbnails, and web-optimized previews.',
  },
  {
    num: '02',
    icon: Share2,
    title: 'Share the Gallery',
    desc: 'Send a branded link or QR code. Clients view on any device — phone, tablet, or desktop.',
  },
  {
    num: '03',
    icon: CreditCard,
    title: 'Get Paid',
    desc: 'Clients order prints and albums directly from your gallery — print ordering rolls out to Studio soon.',
  },
]

export function HowItWorks() {
  return (
    <section className="py-24 bg-obsidian text-ivory">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
          <p className="text-fog text-lg max-w-xl mx-auto">
            Three steps from shoot to sale. No complicated setup. No learning curve.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map(step => {
            const Icon = step.icon
            return (
              <div key={step.num} className="relative">
                <span className="text-6xl font-extrabold text-white/5 absolute -top-4 -left-2">
                  {step.num}
                </span>
                <div className="relative pt-8">
                  <div className="w-14 h-14 rounded-2xl bg-gold flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-obsidian" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-fog leading-relaxed">{step.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
