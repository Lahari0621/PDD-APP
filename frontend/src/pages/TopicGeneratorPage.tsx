import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shuffle, Loader2, ChevronRight, Brain, ArrowRight, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { debateService } from '../services/debate.service'
import GradientOrbs from '../components/animations/GradientOrbs'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { id: 'technology', label: 'Technology', icon: '💻' },
  { id: 'science', label: 'Science', icon: '🔬' },
  { id: 'politics', label: 'Politics', icon: '🗳️' },
  { id: 'philosophy', label: 'Philosophy', icon: '📜' },
  { id: 'ethics', label: 'Ethics', icon: '⚖️' },
  { id: 'education', label: 'Education', icon: '📚' },
  { id: 'environment', label: 'Environment', icon: '🌍' },
  { id: 'society', label: 'Society', icon: '👥' },
]

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced', 'expert']
const DIFF_COLORS: Record<string, string> = {
  beginner: '#10B981', intermediate: '#F59E0B', advanced: '#EF4444', expert: '#8B5CF6'
}

interface GeneratedTopic {
  topic: string
  proPosition: string
  conPosition: string
  proArguments: string[]
  conArguments: string[]
  difficultyExplanation: string
  suggestedEvidence: string[]
}

export default function TopicGeneratorPage() {
  const [category, setCategory]     = useState('technology')
  const [difficulty, setDifficulty] = useState('intermediate')
  const [loading, setLoading]       = useState(false)
  const [result, setResult]         = useState<GeneratedTopic | null>(null)

  const generate = async () => {
    setLoading(true)
    setResult(null)
    try {
      const data = await debateService.generateTopic(category, difficulty)
      setResult(data.topic)
    } catch {
      toast.error('Failed to generate topic. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark relative overflow-hidden">
      <GradientOrbs />
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-8 pt-24">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-500 mb-4 shadow-glow-blue">
            <Shuffle className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-display font-black text-white mb-2">Topic Generator</h1>
          <p className="text-slate-400">Generate a fresh debate topic with positions and arguments.</p>
        </div>

        {/* Controls */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 mb-6 space-y-5">
          <div>
            <p className="text-slate-300 text-sm font-semibold mb-3">Category</p>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((c) => (
                <button key={c.id} onClick={() => setCategory(c.id)}
                  className={`p-3 rounded-xl border text-center transition-all ${category === c.id ? 'border-primary-500/60 bg-primary-600/15' : 'border-white/10 hover:bg-white/5'}`}
                >
                  <div className="text-xl mb-1">{c.icon}</div>
                  <div className="text-white text-xs font-semibold">{c.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-slate-300 text-sm font-semibold mb-3">Difficulty</p>
            <div className="flex gap-2">
              {DIFFICULTIES.map((d) => (
                <button key={d} onClick={() => setDifficulty(d)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize border transition-all ${difficulty === d ? 'text-white border-transparent' : 'border-white/10 text-slate-400 hover:text-white'}`}
                  style={difficulty === d ? { background: DIFF_COLORS[d], borderColor: DIFF_COLORS[d] } : {}}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <button onClick={generate} disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Shuffle className="w-4 h-4" /> Generate Topic</>}
          </button>
        </div>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Topic */}
              <div className="glass-card p-6 rounded-2xl border border-primary-500/30">
                <div className="text-xs text-primary-400 font-semibold uppercase tracking-wider mb-2">Generated Topic</div>
                <h2 className="text-white font-black text-xl leading-snug mb-4">{result.topic}</h2>
                <Link
                  to={`/debate?topic=${encodeURIComponent(result.topic)}`}
                  className="flex items-center justify-center gap-2 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl transition-all"
                >
                  <Brain className="w-4 h-4" /> Debate This Topic <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Positions */}
              <div className="grid grid-cols-2 gap-3">
                <div className="glass-card p-4 rounded-2xl border border-success/30">
                  <div className="text-success text-xs font-semibold mb-2 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> PRO Position
                  </div>
                  <p className="text-slate-300 text-sm">{result.proPosition}</p>
                </div>
                <div className="glass-card p-4 rounded-2xl border border-error/30">
                  <div className="text-error text-xs font-semibold mb-2 flex items-center gap-1">
                    <ChevronRight className="w-3.5 h-3.5 rotate-180" /> CON Position
                  </div>
                  <p className="text-slate-300 text-sm">{result.conPosition}</p>
                </div>
              </div>

              {/* Arguments */}
              <div className="grid grid-cols-2 gap-3">
                <div className="glass-card p-4 rounded-2xl border border-white/10">
                  <div className="text-slate-400 text-xs font-semibold mb-2">Pro Arguments</div>
                  <ul className="space-y-1.5">
                    {result.proArguments?.map((a, i) => (
                      <li key={i} className="text-slate-300 text-xs flex gap-2">
                        <span className="text-success shrink-0">+</span>{a}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="glass-card p-4 rounded-2xl border border-white/10">
                  <div className="text-slate-400 text-xs font-semibold mb-2">Con Arguments</div>
                  <ul className="space-y-1.5">
                    {result.conArguments?.map((a, i) => (
                      <li key={i} className="text-slate-300 text-xs flex gap-2">
                        <span className="text-error shrink-0">−</span>{a}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Difficulty + Evidence */}
              <div className="glass-card p-4 rounded-2xl border border-white/10">
                <div className="text-slate-400 text-xs font-semibold mb-1">Why {difficulty}?</div>
                <p className="text-slate-300 text-sm mb-3">{result.difficultyExplanation}</p>
                {result.suggestedEvidence?.length > 0 && (
                  <>
                    <div className="text-slate-400 text-xs font-semibold mb-1">Suggested Evidence Types</div>
                    <div className="flex flex-wrap gap-1.5">
                      {result.suggestedEvidence.map((e, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-primary-600/15 border border-primary-500/20 text-primary-300">{e}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
