import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import AnimatedCounter from '../common/AnimatedCounter'
import { STATS_COUNTERS } from '../../constants'
import { Star, Quote } from 'lucide-react'

const TESTIMONIALS = [
  { name: 'Sarah Chen', role: 'Debate Coach, Stanford', text: 'This platform transformed how my students approach argumentation. The fallacy detection is incredibly accurate.', rating: 5, avatar: 'SC' },
  { name: 'Marcus Williams', role: 'Philosophy Professor', text: 'Finally, an AI tool that teaches critical thinking rather than just providing answers. Remarkable technology.', rating: 5, avatar: 'MW' },
  { name: 'Priya Patel', role: 'Law Student', text: 'Practicing with AI debate partner improved my moot court performance dramatically. The feedback is invaluable.', rating: 5, avatar: 'PP' },
]

export default function TrustSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats */}
        <div ref={ref} className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {STATS_COUNTERS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="glass-card p-6 text-center card-hover"
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-3xl sm:text-4xl font-black gradient-text mb-1">
                {inView && <AnimatedCounter end={stat.value} suffix={stat.suffix} />}
              </div>
              <div className="text-slate-400 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl font-display font-bold text-white mb-4"
          >
            Trusted by <span className="gradient-text">critical thinkers</span> worldwide
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
              className="glass-card p-6 card-hover relative"
            >
              <Quote className="w-8 h-8 text-primary-500/30 mb-4" />
              <p className="text-slate-300 text-sm leading-relaxed mb-6">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                  {t.avatar}
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{t.name}</div>
                  <div className="text-slate-500 text-xs">{t.role}</div>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-3 h-3 text-warning fill-warning" />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
