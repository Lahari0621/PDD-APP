import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Swords, Loader2, Trophy, BarChart2, Play, ChevronRight } from 'lucide-react'
import { debateService } from '../services/debate.service'
import GradientOrbs from '../components/animations/GradientOrbs'
import toast from 'react-hot-toast'

const SAMPLE_TOPICS = [
  'Artificial intelligence will ultimately benefit humanity',
  'Social media does more harm than good',
  'Universal Basic Income should be implemented globally',
  'Space exploration is worth the investment',
  'Democracy is the best form of government',
]

interface Round {
  speaker: string
  type: string
  content: string
}

interface Judgment {
  winner: string
  logicScore: Record<string, number>
  evidenceScore: Record<string, number>
  persuasionScore: Record<string, number>
  rebuttalScore: Record<string, number>
  explanation: string
}

interface AIDebate {
  topic: string
  proAI: string
  conAI: string
  rounds: Round[]
  judgment: Judgment
}

export default function AiVsAiPage() {
  const [topic, setTopic]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [debate, setDebate]       = useState<AIDebate | null>(null)
  const [visibleIdx, setVisibleIdx] = useState(0)
  const [playing, setPlaying]     = useState(false)

  const generate = async () => {
    if (!topic.trim()) return toast.error('Enter a topic first')
    setLoading(true)
    setDebate(null)
    setVisibleIdx(0)
    try {
      const data = await debateService.aiVsAiDebate(topic)
      setDebate(data.debate)
    } catch {
      toast.error('Failed to generate debate. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const playDebate = async () => {
    if (!debate) return
    setPlaying(true)
    setVisibleIdx(0)
    for (let i = 0; i < debate.rounds.length; i++) {
      await new Promise(r => setTimeout(r, 1800))
      setVisibleIdx(i + 1)
    }
    setPlaying(false)
  }

  const typeColor: Record<string, string> = {
    opening: '#2563EB', rebuttal: '#F59E0B', closing: '#10B981',
  }

  return (
    <div className="min-h-screen bg-dark relative overflow-hidden">
      <GradientOrbs />
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-8 pt-24">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-500 mb-4 shadow-glow-blue">
            <Swords className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-display font-black text-white mb-2">AI vs AI Debate</h1>
          <p className="text-slate-400">Watch two AI debaters argue a topic and see who wins.</p>
        </div>

        {/* Input */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 mb-6">
          <label className="block text-sm font-semibold text-slate-300 mb-2">Debate Topic</label>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generate()}
            placeholder="Enter any topic..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm outline-none focus:border-primary-500/50 transition-all mb-4"
          />

          <div className="flex flex-wrap gap-2 mb-4">
            {SAMPLE_TOPICS.map((t) => (
              <button key={t} onClick={() => setTopic(t)}
                className="text-xs px-3 py-1.5 glass rounded-full border border-white/10 text-slate-400 hover:text-white hover:border-primary-500/30 transition-all">
                {t.length > 40 ? t.slice(0, 40) + '...' : t}
              </button>
            ))}
          </div>

          <button onClick={generate} disabled={loading || !topic.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating debate...</> : <><Swords className="w-4 h-4" /> Generate Debate</>}
          </button>
        </div>

        {/* Debate viewer */}
        <AnimatePresence>
          {debate && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Combatants */}
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex-1 glass-card p-4 rounded-2xl border border-primary-500/30 text-center">
                  <div className="text-2xl mb-1">🤖</div>
                  <div className="text-primary-300 font-bold">{debate.proAI}</div>
                  <div className="text-xs text-slate-500">PRO</div>
                </div>
                <div className="text-2xl font-black text-slate-400">VS</div>
                <div className="flex-1 glass-card p-4 rounded-2xl border border-indigo-500/30 text-center">
                  <div className="text-2xl mb-1">🤖</div>
                  <div className="text-indigo-300 font-bold">{debate.conAI}</div>
                  <div className="text-xs text-slate-500">ANTI</div>
                </div>
              </div>

              {/* Play button */}
              {visibleIdx === 0 && !playing && (
                <button onClick={playDebate}
                  className="w-full flex items-center justify-center gap-2 py-3 mb-4 glass border border-white/10 text-white font-semibold rounded-xl hover:bg-white/5 transition-all">
                  <Play className="w-4 h-4 text-primary-400" /> Play Debate
                </button>
              )}

              {/* Rounds */}
              <div className="space-y-3 mb-6">
                {debate.rounds.slice(0, visibleIdx).map((round, i) => {
                  const isPro = round.speaker === debate.proAI
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: isPro ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4 }}
                      className={`flex ${isPro ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`max-w-[80%] glass-card p-4 rounded-2xl border ${isPro ? 'border-primary-500/30 rounded-tl-sm' : 'border-indigo-500/30 rounded-tr-sm'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-bold ${isPro ? 'text-primary-300' : 'text-indigo-300'}`}>
                            {round.speaker}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full capitalize font-semibold"
                            style={{ background: `${typeColor[round.type] || '#6366F1'}20`, color: typeColor[round.type] || '#6366F1' }}>
                            {round.type}
                          </span>
                        </div>
                        <p className="text-slate-200 text-sm leading-relaxed">{round.content}</p>
                      </div>
                    </motion.div>
                  )
                })}

                {playing && visibleIdx < debate.rounds.length && (
                  <div className="flex justify-center py-2">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Judgment */}
              {visibleIdx >= debate.rounds.length && debate.judgment && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-6 rounded-2xl border border-warning/30">
                  <div className="flex items-center gap-2 mb-4">
                    <Trophy className="w-5 h-5 text-warning" />
                    <h3 className="text-white font-bold">Judgment</h3>
                  </div>

                  <div className={`text-center mb-4 py-3 rounded-xl font-black text-xl ${debate.judgment.winner === 'draw' ? 'text-slate-300' : 'text-warning'}`}>
                    {debate.judgment.winner === 'draw' ? '🤝 Draw' : `🏆 ${debate.judgment.winner} wins!`}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      { label: 'Logic',      key: 'logicScore' },
                      { label: 'Evidence',   key: 'evidenceScore' },
                      { label: 'Persuasion', key: 'persuasionScore' },
                      { label: 'Rebuttal',   key: 'rebuttalScore' },
                    ].map(({ label, key }) => {
                      const scores = debate.judgment[key as keyof Judgment] as Record<string, number>
                      return (
                        <div key={key} className="glass rounded-xl p-3 border border-white/10">
                          <div className="text-slate-400 text-xs mb-2">{label}</div>
                          <div className="flex justify-between text-sm">
                            <span className="text-primary-300 font-bold">{debate.proAI}: {scores?.[debate.proAI] || 0}</span>
                            <span className="text-indigo-300 font-bold">{debate.conAI}: {scores?.[debate.conAI] || 0}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <p className="text-slate-300 text-sm leading-relaxed">{debate.judgment.explanation}</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
