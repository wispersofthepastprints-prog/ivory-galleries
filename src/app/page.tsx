import { Navbar } from '@/src/components/landing/Navbar'
import { Hero } from '@/src/components/landing/Hero'
import { Features } from '@/src/components/landing/Features'
import { HowItWorks } from '@/src/components/landing/HowItWorks'
import { PricingSection } from '@/src/components/landing/PricingSection'
import { CTA } from '@/src/components/landing/CTA'
import { Footer } from '@/src/components/landing/Footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <PricingSection />
      <CTA />
      <Footer />
    </div>
  )
}
