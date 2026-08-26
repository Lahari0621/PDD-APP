import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { MessageSquare, Brain, Zap, AlertTriangle, TrendingUp, BarChart3 } from 'lucide-react'
import SectionReveal from '../common/SectionReveal'

const STEPS = [
  { icon: MessageSquare, title: 'User Argument', description: 'You present your argument or position on any topic', color: '#2563EB', step: '01' },
  { icon: Brain, title: 'AI Analysis', description: 'Our hybrid NLP engine analyzes your reasoning in real-time', color: '#6366F1', step: '02' },
  { icon: Zap, title: 'Gemini Response', description: 'Gemini AI generates an intelligent counter-argument', color: '#8B5CF6', step: '03' },
  { icon: AlertTriangle, title: 'Fallacy Detection', description: 'Hugging Face + rule-based engine identifies logical fallacies', color: '#F59E0B', step: '04' },
  { icon: TrendingUp, title: 'Reasoning Feedback', description: 'Personalized coaching tips to strengthen your arguments', color: '#10B981', step: '05' },
  { icon: BarChart3, title: 'Performance Analytics', description: 'Track your critical thinking growth over time', color: '#EC4899', step: '06' },
]

export default function HowItWorks() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionReveal className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-display font-black text-white mb-4">
            How it <span className="gradient-text">works</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            A sophisticated AI pipeline that transforms every debate into a learning opportunity.
          </p>
        </SectionReveal>

        <div ref={ref} className="relative">
          {/* Vertical line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary-600/50 via-indigo-500/50 to-transparent hidden lg:block" />

          <div className="space-y-8">
            {STEPS.map((step, i) => {
              const Icon = step.icon
              const isLeft = i % 2 === 0
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className={`flex items-center gap-8 ${isLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
                >
                  {/* Content */}
                  <div className={`flex-1 ${isLeft ? 'lg:text-right' : 'lg:text-left'}`}>
                    <div className={`glass-card p-6 inline-block max-w-sm card-hover ${isLeft ? 'lg:ml-auto' : ''}`}>
                      <div className={`flex items-center gap-3 mb-3 ${isLeft ? 'lg:flex-row-reverse' : ''}`}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: `${step.color}20`, border: `1px solid ${step.color}40` }}>
                          <Icon className="w-5 h-5" style={{ color: step.color }} />
                        </div>
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider" style={{ color: step.color }}>
                            Step {step.step}
                          </div>
                          <h3 className="text-white font-bold">{step.title}</h3>
                        </div>
                      </div>
                      <p className="text-slate-400 text-sm">{step.description}</p>
                    </div>
                  </div>

                  {/* Center node */}
                  <div className="hidden lg:flex w-12 h-12 rounded-full items-center justify-center flex-shrink-0 z-10"
                    style={{ background: `${step.color}20`, border: `2px solid ${step.color}60`, boxShadow: `0 0 20px ${step.color}30` }}>
                    <Icon className="w-5 h-5" style={{ color: step.color }} />
                  </div>

                  {/* Spacer */}
                  <div className="flex-1 hidden lg:block" />
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
