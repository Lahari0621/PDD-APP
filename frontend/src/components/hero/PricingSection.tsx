import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Check, Zap, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PRICING_PLANS } from '../../constants'
import SectionReveal from '../common/SectionReveal'

export default function PricingSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <section id="pricing" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionReveal className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-display font-black text-white mb-4">
            Simple, <span className="gradient-text">transparent</span> pricing
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Start free, upgrade when you're ready. No hidden fees.
          </p>
        </SectionReveal>

        <div ref={ref} className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PRICING_PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative glass-card p-8 card-hover ${plan.highlighted ? 'border-primary-500/50 shadow-glow-blue' : ''}`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-primary-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                  <Star className="w-3 h-3 fill-white" />
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-white font-bold text-xl mb-1">{plan.name}</h3>
                <p className="text-slate-400 text-sm mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">${plan.price}</span>
                  {plan.price > 0 && <span className="text-slate-400 text-sm">/{plan.period}</span>}
                  {plan.price === 0 && <span className="text-slate-400 text-sm">forever</span>}
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                to={plan.id === 'education' ? '/contact' : '/register'}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all duration-300 ${
                  plan.highlighted
                    ? 'bg-primary-600 hover:bg-primary-500 text-white shadow-glow-blue hover:shadow-glow-indigo'
                    : 'glass hover:bg-white/10 text-white border border-white/10'
                }`}
              >
                {plan.highlighted && <Zap className="w-4 h-4" />}
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
