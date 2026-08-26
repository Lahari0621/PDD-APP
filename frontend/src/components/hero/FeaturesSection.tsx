import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { MessageSquare, Users, BarChart3, Mic, BookOpen, Trophy, Brain, TrendingUp } from 'lucide-react'
import SectionReveal from '../common/SectionReveal'

const FEATURES = [
  { icon: MessageSquare, title: 'Real-Time AI Debates', description: 'Engage in live debates with Gemini AI that adapts to your skill level and challenges your reasoning.', color: '#2563EB', gradient: 'from-blue-600/20 to-blue-800/5' },
  { icon: Users, title: 'AI Personalities', description: 'Choose from 5 distinct AI debate styles: Socratic, Aggressive, Empathetic, Logical, or Devil\'s Advocate.', color: '#6366F1', gradient: 'from-indigo-600/20 to-indigo-800/5' },
  { icon: BarChart3, title: 'Debate Analytics', description: 'Deep performance insights with radar charts, logic score trends, and fallacy breakdown analysis.', color: '#8B5CF6', gradient: 'from-violet-600/20 to-violet-800/5' },
  { icon: Mic, title: 'Voice Debate UI', description: 'Practice verbal argumentation with voice input support for a more immersive debate experience.', color: '#EC4899', gradient: 'from-pink-600/20 to-pink-800/5' },
  { icon: BookOpen, title: 'Learning Hub', description: '50+ reasoning modules, fallacy flashcards, quizzes, and structured critical thinking courses.', color: '#10B981', gradient: 'from-emerald-600/20 to-emerald-800/5' },
  { icon: Trophy, title: 'Gamification', description: 'Earn XP, unlock achievements, climb tier rankings from Bronze to Diamond, and maintain streaks.', color: '#F59E0B', gradient: 'from-amber-600/20 to-amber-800/5' },
  { icon: Brain, title: 'AI Coaching', description: 'Personalized coaching tips powered by Gemini AI based on your debate history and weak points.', color: '#06B6D4', gradient: 'from-cyan-600/20 to-cyan-800/5' },
  { icon: TrendingUp, title: 'Progress Tracking', description: 'Visualize your critical thinking growth with detailed skill radar charts and improvement curves.', color: '#F97316', gradient: 'from-orange-600/20 to-orange-800/5' },
]

export default function FeaturesSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.05 })

  return (
    <section id="features" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionReveal className="text-center mb-16">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-primary-300 border border-primary-500/30 mb-6">
            <Brain className="w-4 h-4" />
            Platform Features
          </div>
          <h2 className="text-4xl sm:text-5xl font-display font-black text-white mb-4">
            Everything you need to <span className="gradient-text">master debate</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            A complete ecosystem for developing world-class argumentation and critical thinking skills.
          </p>
        </SectionReveal>

        <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className={`glass-card p-6 card-hover bg-gradient-to-br ${feature.gradient} group`}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ background: `${feature.color}20`, border: `1px solid ${feature.color}40` }}>
                  <Icon className="w-6 h-6" style={{ color: feature.color }} />
                </div>
                <h3 className="text-white font-bold mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
