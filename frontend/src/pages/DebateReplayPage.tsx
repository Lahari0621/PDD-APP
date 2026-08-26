import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, ArrowLeft, AlertTriangle, CheckCircle, Clock, BarChart2, Play, Pause } from 'lucide-react'
import { debateService } from '../services/debate.service'
import GradientOrbs from '../components/animations/GradientOrbs'
import type { ReplayEntry } from '../types'

export default function DebateReplayPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [selected, setSelected] = useState<ReplayEntry | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['debate-replay', id],
    queryFn: () => debateService.getDebate(id!),
    enabled: !!id,
  })

  const debate   = data?.debate
  const timeline: ReplayEntry[] = data?.replayTimeline || []

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-primary-500/30 border-t-primary-500 animate-spin" />
      </div>
    )
  }

  if (isError || !debate) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center text-center px-4">
        <div>
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-slate-400 mb-4">Debate not found</p>
          <button onClick={() => navigate(-1)} className="px-5 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold">Go Back</button>
        </div>
      </div>
    )
  }

  const totalFallacies   = timeline.filter(e => e.hasFallacy).length
  const avgLogic = timeline.filter(e => e.sender === 'user' && e.logicScore).reduce((s, e) => s + (e.logicScore || 0), 0) / Math.max(1, timeline.filter(e => e.sender === 'user' && e.logicScore).length)

  return (
    <div className="min-h-screen bg-dark relative overflow-hidden">
      <GradientOrbs />
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 pt-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-white font-black text-xl">Debate Replay</h1>
            <p className="text-slate-400 text-sm truncate max-w-lg">{debate.topic}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Result',   value: debate.winner === 'user' ? '🏆 Win' : debate.winner === 'draw' ? '🤝 Draw' : '📚 Loss', color: '#F59E0B' },
            { label: 'Score',    value: `${debate.finalScore || 0}%`, color: '#2563EB' },
            { label: 'Fallacies', value: totalFallacies, color: '#EF4444' },
            { label: 'Avg Logic', value: `${Math.round(avgLogic) || 0}%`, color: '#10B981' },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass-card p-4 rounded-2xl border border-white/10 text-center">
              <div className="font-black text-lg" style={{ color }}>{value}</div>
              <div className="text-slate-500 text-xs">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Timeline */}
          <div className="lg:col-span-2">
            <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary-400" /> Timeline
            </h3>
            <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
              {timeline.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => setSelected(selected?.id === entry.id ? null : entry)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                    selected?.id === entry.id
                      ? 'border-primary-500/50 bg-primary-600/10'
                      : 'border-white/5 hover:border-white/15 glass'
                  }`}
                >
                  {/* Turn icon */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    entry.sender === 'user' ? 'bg-primary-600/30 border border-primary-500/40' : 'bg-indigo-600/30 border border-indigo-500/40'
                  }`}>
                    {entry.sender === 'ai' ? <Brain className="w-3 h-3 text-indigo-400" /> : <span className="text-primary-400 text-xs font-bold">U</span>}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-300 capitalize">{entry.sender === 'ai' ? 'Aria' : 'You'}</span>
                      <span className="text-xs text-slate-600">{entry.timestamp}</span>
                    </div>
                    <p className="text-slate-500 text-xs truncate">{entry.content.slice(0, 60)}...</p>
                    <div className="flex items-center gap-2 mt-1">
                      {entry.hasFallacy && (
                        <span className="text-xs text-error flex items-center gap-0.5">
                          <AlertTriangle className="w-2.5 h-2.5" /> Fallacy
                        </span>
                      )}
                      {entry.logicScore && (
                        <span className="text-xs text-primary-400">Logic: {entry.logicScore}%</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-3">
            <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-primary-400" /> Message Analysis
            </h3>
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="glass-card p-6 rounded-2xl border border-white/10 space-y-4"
                >
                  {/* Speaker + time */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`px-2 py-0.5 rounded-full text-xs font-bold ${selected.sender === 'user' ? 'bg-primary-600/20 text-primary-300' : 'bg-indigo-600/20 text-indigo-300'}`}>
                        {selected.sender === 'ai' ? 'Aria' : 'You'}
                      </div>
                      <span className="text-slate-500 text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {selected.timestamp}
                      </span>
                    </div>
                    <span className="text-slate-500 text-xs">Turn {selected.turnNumber}</span>
                  </div>

                  {/* Message content */}
                  <div className={`p-4 rounded-xl border text-sm text-slate-200 leading-relaxed ${
                    selected.sender === 'user' ? 'border-primary-500/20 bg-primary-600/5' : 'border-indigo-500/20 bg-indigo-600/5'
                  }`}>
                    {selected.content}
                  </div>

                  {/* Scores */}
                  {selected.logicScore && (
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Logic Score',      value: selected.logicScore,      color: '#2563EB' },
                        { label: 'Confidence Score', value: selected.confidenceScore || 0, color: '#8B5CF6' },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="glass rounded-xl p-3 border border-white/10">
                          <div className="flex justify-between mb-1">
                            <span className="text-slate-500 text-xs">{label}</span>
                            <span className="text-xs font-bold" style={{ color }}>{value}%</span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Fallacies */}
                  {selected.hasFallacy && selected.fallacies?.length > 0 && (
                    <div>
                      <div className="text-error text-xs font-semibold mb-2 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Detected Fallacies
                      </div>
                      <div className="space-y-2">
                        {selected.fallacies.map((f, i) => (
                          <div key={i} className="glass rounded-xl p-3 border"
                            style={{ borderColor: `${f.color}30` }}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold" style={{ color: f.color }}>{f.name}</span>
                              <span className="text-xs text-slate-500">{Math.round(f.confidence * 100)}% confidence</span>
                            </div>
                            <p className="text-slate-400 text-xs">{f.description}</p>
                            {f.highlightedText && (
                              <p className="text-slate-500 text-xs mt-1 italic">"{f.highlightedText}"</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!selected.hasFallacy && selected.sender === 'user' && (
                    <div className="flex items-center gap-2 text-success text-xs">
                      <CheckCircle className="w-3.5 h-3.5" /> No fallacies detected in this argument
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-card p-10 rounded-2xl border border-white/10 text-center"
                >
                  <Play className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">Click any message in the timeline to see its analysis.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
