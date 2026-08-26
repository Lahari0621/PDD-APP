import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Zap, BookOpen, ArrowRight } from 'lucide-react'
import SectionReveal from '../common/SectionReveal'

export default function CTASection() {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/30 via-dark to-indigo-900/20" />
        <div className="absolute inset-0 bg-grid opacity-30" />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <SectionReveal>
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-primary-300 border border-primary-500/30 mb-8">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            Ready to transform your thinking?
          </div>

          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-display font-black text-white leading-tight mb-6">
            Train your mind like{' '}
            <span className="gradient-text">athletes train</span>{' '}
            their bodies.
          </h2>

          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join 20,000+ critical thinkers who use AI Debate Partner to sharpen their reasoning, detect fallacies, and argue with confidence.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register"
              className="group flex items-center gap-3 px-10 py-5 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-2xl transition-all duration-300 text-lg shadow-glow-blue hover:shadow-glow-indigo"
            >
              <Zap className="w-5 h-5 group-hover:animate-pulse" />
              Start Your First Debate
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/learn"
              className="group flex items-center gap-3 px-10 py-5 glass hover:bg-white/10 text-white font-bold rounded-2xl transition-all duration-300 text-lg border border-white/10"
            >
              <BookOpen className="w-5 h-5 text-primary-400" />
              Explore Fallacies
            </Link>
          </div>

          <p className="mt-8 text-slate-600 text-sm">
            No credit card required · Free forever plan · Cancel anytime
          </p>
        </SectionReveal>
      </div>
    </section>
  )
}
