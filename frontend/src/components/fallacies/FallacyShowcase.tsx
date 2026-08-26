import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { AlertTriangle, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react'
import SectionReveal from '../common/SectionReveal'

const FALLACIES = [
  { type: 'ad_hominem', name: 'Ad Hominem', icon: '👤', color: '#EF4444', category: 'Relevance', description: 'Attacking the person making the argument rather than the argument itself.', example: '"You\'re too young to understand economics, so your point is invalid."', corrected: '"Your economic argument has a flaw: it doesn\'t account for inflation rates."', confidence: 92 },
  { type: 'strawman', name: 'Straw Man', icon: '🎭', color: '#F59E0B', category: 'Relevance', description: 'Misrepresenting someone\'s argument to make it easier to attack.', example: '"So you want to cut military spending? You want us to be defenseless!"', corrected: '"I disagree with cutting military spending because it could reduce our defensive capabilities."', confidence: 88 },
  { type: 'slippery_slope', name: 'Slippery Slope', icon: '📉', color: '#8B5CF6', category: 'Presumption', description: 'Assuming one event will inevitably lead to extreme consequences without justification.', example: '"If we allow same-sex marriage, next people will want to marry animals."', corrected: '"Changing marriage laws could have various social implications worth examining carefully."', confidence: 85 },
  { type: 'appeal_to_emotion', name: 'Appeal to Emotion', icon: '💔', color: '#EC4899', category: 'Relevance', description: 'Manipulating emotions rather than using logical reasoning to support a claim.', example: '"Think of the children! We must ban this immediately!"', corrected: '"Research shows this policy negatively impacts child development in these specific ways."', confidence: 79 },
  { type: 'false_dilemma', name: 'False Dilemma', icon: '⚖️', color: '#06B6D4', category: 'Presumption', description: 'Presenting only two options when more alternatives exist.', example: '"You\'re either with us or against us."', corrected: '"There are several positions one could take on this issue, including..."', confidence: 91 },
  { type: 'bandwagon', name: 'Bandwagon', icon: '🚂', color: '#10B981', category: 'Relevance', description: 'Arguing something is true because many people believe it.', example: '"Everyone is investing in crypto, so it must be a good investment."', corrected: '"Cryptocurrency has shown X% returns over Y period, though with significant volatility."', confidence: 83 },
  { type: 'hasty_generalization', name: 'Hasty Generalization', icon: '🔍', color: '#F97316', category: 'Presumption', description: 'Drawing broad conclusions from a small or unrepresentative sample.', example: '"I met two rude people from that city, so everyone there must be rude."', corrected: '"Based on a representative survey, the city has a hospitality rating of..."', confidence: 87 },
]

function FallacyCard({ fallacy, index }: { fallacy: typeof FALLACIES[0]; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="glass-card overflow-hidden card-hover cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: `${fallacy.color}20`, border: `1px solid ${fallacy.color}30` }}>
              {fallacy.icon}
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">{fallacy.name}</h3>
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: `${fallacy.color}15`, color: fallacy.color }}>
                {fallacy.category}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-xs text-slate-500">Detection</div>
              <div className="text-sm font-bold" style={{ color: fallacy.color }}>{fallacy.confidence}%</div>
            </div>
            {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
        </div>

        {/* Confidence bar */}
        <div className="score-bar mb-3">
          <motion.div
            className="score-fill"
            initial={{ width: 0 }}
            animate={inView ? { width: `${fallacy.confidence}%` } : {}}
            transition={{ duration: 1, delay: index * 0.08 + 0.3 }}
            style={{ background: `linear-gradient(90deg, ${fallacy.color}80, ${fallacy.color})` }}
          />
        </div>

        <p className="text-slate-400 text-xs leading-relaxed">{fallacy.description}</p>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-white/10"
          >
            <div className="p-5 space-y-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-error font-semibold mb-2">
                  <AlertTriangle className="w-3 h-3" /> Fallacious Example
                </div>
                <p className="text-slate-300 text-xs italic bg-error/10 border border-error/20 rounded-lg p-3">
                  {fallacy.example}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs text-success font-semibold mb-2">
                  <CheckCircle className="w-3 h-3" /> Corrected Version
                </div>
                <p className="text-slate-300 text-xs italic bg-success/10 border border-success/20 rounded-lg p-3">
                  {fallacy.corrected}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function FallacyShowcase() {
  return (
    <section id="fallacies" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionReveal className="text-center mb-16">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-warning border border-warning/30 mb-6">
            <AlertTriangle className="w-4 h-4" />
            Fallacy Detection Engine
          </div>
          <h2 className="text-4xl sm:text-5xl font-display font-black text-white mb-4">
            Detect <span className="gradient-text">logical fallacies</span> instantly
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Our hybrid AI engine combines rule-based detection with Hugging Face NLP to identify 10+ fallacy types with up to 94% accuracy.
          </p>
        </SectionReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {FALLACIES.map((fallacy, i) => (
            <FallacyCard key={fallacy.type} fallacy={fallacy} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
