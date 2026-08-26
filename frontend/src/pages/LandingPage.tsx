import ParticleField from '../components/animations/ParticleField'
import GradientOrbs from '../components/animations/GradientOrbs'
import HeroSection from '../components/hero/HeroSection'
import TrustSection from '../components/hero/TrustSection'
import InteractiveDemo from '../components/hero/InteractiveDemo'
import HowItWorks from '../components/hero/HowItWorks'
import FallacyShowcase from '../components/fallacies/FallacyShowcase'
import FeaturesSection from '../components/hero/FeaturesSection'
import PricingSection from '../components/hero/PricingSection'
import CTASection from '../components/hero/CTASection'
import Footer from '../components/layout/Footer'

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-dark overflow-x-hidden">
      <ParticleField />
      <GradientOrbs />
      <HeroSection />
      <TrustSection />
      <InteractiveDemo />
      <HowItWorks />
      <FallacyShowcase />
      <FeaturesSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  )
}
