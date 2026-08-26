import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain, Send, Pause, Play, Square, AlertTriangle, ChevronRight,
  Zap, ArrowLeft, Loader2, MessageSquare, RefreshCw, TrendingUp,
  Target, Clock, Shuffle, Swords, HelpCircle, BarChart2, CheckCircle, X,
  Trophy, Lightbulb,
} from 'lucide-react'
import { useDebateStore } from '../store/debateStore'
import { useAuthStore } from '../store/authStore'
import { debateService } from '../services/debate.service'
import { AI_PERSONALITIES, DIFFICULTY_COLORS } from '../constants'
import toast from 'react-hot-toast'
import GradientOrbs from '../components/animations/GradientOrbs'
import type { DebateMessage, Fallacy, ArgumentScores, DebateSummary } from '../types'

// ─── Argument Strength Meter ──────────────────────────────────
function ArgumentStrengthMeter({ scores }: { scores: ArgumentScores }) {
  const bars = [
    { label: 'Logic',       value: scores.logic },
    { label: 'Evidence',    value: scores.evidence },
    { label: 'Relevance',   value: scores.relevance },
    { label: 'Persuasion',  value: scores.persuasion },
    { label: 'Clarity',     value: scores.clarity },
  ]
  const color = scores.overall >= 75 ? '#10B981' : scores.overall >= 50 ? '#F59E0B' : '#EF4444'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl border border-white/10 p-3 mb-3"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
          <BarChart2 className="w-3 h-3" /> Argument Strength
        </span>
        <span className="text-sm font-black" style={{ color }}>{scores.overall}%</span>
      </div>
      {/* Overall bar */}
      <div className="h-2 bg-white/5 rounded-full mb-2 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${scores.overall}%` }}
          transition={{ duration: 0.6 }}
        />
      </div>
      {/* Individual bars */}
      <div className="grid grid-cols-5 gap-1">
        {bars.map(({ label, value }) => (
          <div key={label} className="text-center">
            <div className="h-1 bg-white/5 rounded-full mb-0.5 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary-500"
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="text-slate-500 text-[9px]">{label}</div>
            <div className="text-white text-[9px] font-bold">{value}</div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Fallacy Panel (with Try Again) ──────────────────────────
function FallacyPanel({ fallacy, onClose }: { fallacy: Fallacy; onClose: () => void }) {
  const [tryAgainMode, setTryAgainMode] = useState(false)
  const [rewritten, setRewritten]       = useState('')
  const [comparing, setComparing]       = useState(false)
  const [comparison, setComparison]     = useState<any>(null)

  const handleCompare = async () => {
    if (!rewritten.trim()) return
    setComparing(true)
    try {
      const data = await debateService.tryAgain(fallacy.highlightedText || '', rewritten, fallacy.name)
      setComparison(data)
    } catch {
      toast.error('Comparison failed')
    } finally {
      setComparing(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 320 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 320 }}
      className="fixed right-4 top-1/2 -translate-y-1/2 z-50 w-80 glass-dark rounded-2xl p-5 border shadow-glass"
      style={{ borderColor: `${fallacy.color}40` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" style={{ color: fallacy.color }} />
          <span className="font-bold text-sm" style={{ color: fallacy.color }}>{fallacy.name}</span>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white text-sm">
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-slate-300 text-xs leading-relaxed mb-2">{fallacy.description}</p>

      {fallacy.why && (
        <div className="bg-white/5 rounded-lg p-2 mb-2 border border-white/10">
          <p className="text-slate-400 text-xs font-semibold mb-0.5">Why it's a fallacy:</p>
          <p className="text-slate-300 text-xs leading-relaxed">{fallacy.why}</p>
        </div>
      )}

      {fallacy.highlightedText && (
        <div className="bg-error/10 border border-error/20 rounded-lg p-2 mb-2">
          <p className="text-error text-xs italic">"{fallacy.highlightedText}"</p>
        </div>
      )}

      {fallacy.correction && (
        <div className="bg-success/10 border border-success/20 rounded-lg p-2 mb-3">
          <p className="text-success text-xs font-semibold mb-0.5">How to fix it:</p>
          <p className="text-slate-300 text-xs leading-relaxed">{fallacy.correction}</p>
        </div>
      )}

      {/* Confidence bar */}
      <div className="flex items-center gap-2 text-xs mb-3">
        <span className="text-slate-500">Confidence:</span>
        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${Math.round(fallacy.confidence * 100)}%`, background: fallacy.color }} />
        </div>
        <span className="font-bold" style={{ color: fallacy.color }}>{Math.round(fallacy.confidence * 100)}%</span>
      </div>

      {/* Try Again */}
      {!tryAgainMode ? (
        <button
          onClick={() => setTryAgainMode(true)}
          className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg border border-primary-500/30 text-primary-400 hover:bg-primary-600/10 transition-all"
        >
          <RefreshCw className="w-3 h-3" /> Try Again — Rewrite Argument
        </button>
      ) : (
        <div className="space-y-2">
          <p className="text-slate-400 text-xs">Rewrite your argument without the fallacy:</p>
          <textarea
            value={rewritten}
            onChange={(e) => setRewritten(e.target.value)}
            rows={3}
            placeholder="Write a stronger version..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs resize-none outline-none focus:border-primary-500/50"
          />
          <button
            onClick={handleCompare}
            disabled={comparing || !rewritten.trim()}
            className="w-full py-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-40 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1"
          >
            {comparing ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
            Compare
          </button>

          {comparison && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1.5 mt-2">
              <div className={`text-xs p-2 rounded-lg border ${comparison.original.hasFallacy ? 'bg-error/10 border-error/20 text-error' : 'bg-success/10 border-success/20 text-success'}`}>
                Original: {comparison.original.hasFallacy ? `⚠ Fallacy detected (${comparison.original.score}%)` : `✓ Clean (${comparison.original.score}%)`}
              </div>
              <div className={`text-xs p-2 rounded-lg border ${comparison.rewritten.hasFallacy ? 'bg-error/10 border-error/20 text-error' : 'bg-success/10 border-success/20 text-success'}`}>
                Rewritten: {comparison.rewritten.hasFallacy ? `⚠ Still has fallacy (${comparison.rewritten.score}%)` : `✓ Clean (${comparison.rewritten.score}%)`}
              </div>
              {comparison.improvement !== 0 && (
                <div className={`text-xs font-bold text-center ${comparison.improvement > 0 ? 'text-success' : 'text-error'}`}>
                  {comparison.improvement > 0 ? `+${comparison.improvement}%` : `${comparison.improvement}%`} improvement
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  )
}

// ─── Message Bubble ────────────────────────────────────────────
function MessageBubble({ message, onFallacyClick }: { message: DebateMessage; onFallacyClick: (f: Fallacy) => void }) {
  const isUser = message.sender === 'user'
  const [showTooltip, setShowTooltip] = useState<string | null>(null)

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, type: 'spring', stiffness: 200 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        {!isUser && (
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-600 to-indigo-500 flex items-center justify-center">
              <Brain className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs text-slate-500 font-medium">Aria — AI Coach</span>
          </div>
        )}
        <div className={`relative px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-primary-600/25 text-white border border-primary-500/30 rounded-tr-sm'
            : 'glass text-slate-200 border border-white/10 rounded-tl-sm'
        }`}>
          {message.content}
        </div>

        {/* Fallacy badges */}
        {message.hasFallacy && message.fallacies && message.fallacies.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {message.fallacies.map((f, i) => (
              <button key={i} onClick={() => onFallacyClick(f)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold transition-all hover:scale-105"
                style={{ background: `${f.color}20`, border: `1px solid ${f.color}40`, color: f.color }}>
                <AlertTriangle className="w-2.5 h-2.5" />
                {f.name} · {Math.round(f.confidence * 100)}%
              </button>
            ))}
          </div>
        )}

        {/* Argument scores for user messages */}
        {isUser && message.argumentScores && (
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
            <span>Logic: <span className="text-primary-400 font-semibold">{message.argumentScores.logic}</span></span>
            <span>Evidence: <span className="text-success font-semibold">{message.argumentScores.evidence}</span></span>
            <span className="font-semibold" style={{ color: message.argumentScores.overall >= 70 ? '#10B981' : '#F59E0B' }}>
              Overall: {message.argumentScores.overall}%
            </span>
          </div>
        )}

        <div className="text-xs text-slate-600 mt-1">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Debate Summary Screen ─────────────────────────────────────
function DebateSummaryScreen({ summary, onNewDebate, onDashboard }: {
  summary: DebateSummary
  onNewDebate: () => void
  onDashboard: () => void
}) {
  const scores = [
    { label: 'Logic',       value: summary.logicScore,       color: '#2563EB' },
    { label: 'Persuasion',  value: summary.persuasionScore,  color: '#8B5CF6' },
    { label: 'Evidence',    value: summary.evidenceScore,    color: '#10B981' },
    { label: 'Rebuttal',    value: summary.rebuttalScore,    color: '#F59E0B' },
    { label: 'Clarity',     value: summary.clarityScore,     color: '#06B6D4' },
    { label: 'Consistency', value: summary.consistencyScore, color: '#EC4899' },
  ]

  const winIcon = summary.winner === 'user' ? '🏆' : summary.winner === 'draw' ? '🤝' : '📚'

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center relative overflow-hidden px-4 py-8">
      <GradientOrbs />
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-2xl glass-card p-8 rounded-3xl border border-white/10"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">{winIcon}</div>
          <h2 className="text-3xl font-display font-black text-white mb-1">Debate Complete</h2>
          <p className="text-slate-400 text-sm">{summary.topic}</p>
          {summary.winner !== 'draw' && (
            <div className={`mt-2 inline-block px-3 py-1 rounded-full text-sm font-bold ${summary.winner === 'user' ? 'bg-success/20 text-success' : 'bg-primary-600/20 text-primary-400'}`}>
              {summary.winner === 'user' ? 'You won this debate!' : 'Aria won this one — great practice!'}
            </div>
          )}
        </div>

        {/* Score grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="glass rounded-xl p-3 text-center border border-white/10">
            <div className="text-2xl font-black text-primary-400">{summary.finalScore}%</div>
            <div className="text-slate-500 text-xs">Overall</div>
          </div>
          <div className="glass rounded-xl p-3 text-center border border-white/10">
            <div className="text-2xl font-black text-warning">+{summary.xpEarned}</div>
            <div className="text-slate-500 text-xs">XP Earned</div>
          </div>
          <div className="glass rounded-xl p-3 text-center border border-white/10">
            <div className="text-2xl font-black text-slate-300">{summary.fallacyCount}</div>
            <div className="text-slate-500 text-xs">Fallacies</div>
          </div>
        </div>

        {/* Skill scores */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {scores.map(({ label, value, color }) => (
            <div key={label} className="glass rounded-xl p-2.5 border border-white/5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-500 text-xs">{label}</span>
                <span className="text-xs font-bold" style={{ color }}>{value}</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="h-full rounded-full"
                  style={{ background: color }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Summary text */}
        {summary.summary && (
          <div className="glass rounded-xl p-4 mb-4 border border-white/10">
            <p className="text-slate-300 text-sm leading-relaxed">{summary.summary}</p>
          </div>
        )}

        {/* Strongest / Weakest */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {summary.strongestArgument && (
            <div className="glass rounded-xl p-3 border border-success/20">
              <div className="text-success text-xs font-semibold mb-1 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Strongest Argument
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">{summary.strongestArgument}</p>
            </div>
          )}
          {summary.weakestArgument && (
            <div className="glass rounded-xl p-3 border border-error/20">
              <div className="text-error text-xs font-semibold mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Weakest Argument
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">{summary.weakestArgument}</p>
            </div>
          )}
        </div>

        {/* Key insights */}
        {summary.keyInsights?.length > 0 && (
          <div className="mb-4">
            <h4 className="text-white font-semibold text-xs mb-2 flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-warning" /> Key Insights
            </h4>
            <ul className="space-y-1">
              {summary.keyInsights.map((insight, i) => (
                <li key={i} className="text-slate-400 text-xs flex items-start gap-2">
                  <span className="text-primary-400 mt-0.5 shrink-0">•</span>{insight}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {summary.recommendations?.length > 0 && (
          <div className="mb-4 p-3 rounded-xl border border-primary-500/20 bg-primary-600/5">
            <h4 className="text-primary-300 text-xs font-semibold mb-2 flex items-center gap-1">
              <Brain className="w-3.5 h-3.5" /> AI Recommendations
            </h4>
            <ul className="space-y-1">
              {summary.recommendations.map((rec, i) => (
                <li key={i} className="text-slate-300 text-xs flex items-start gap-2">
                  <span className="text-primary-400 shrink-0">{i + 1}.</span>{rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Next challenge */}
        {summary.nextChallenge && (
          <div className="mb-5 p-3 rounded-xl border border-warning/20 bg-warning/5 text-xs text-warning flex items-center gap-2">
            <Target className="w-3.5 h-3.5 shrink-0" />
            <span><strong>Next Challenge:</strong> {summary.nextChallenge}</span>
          </div>
        )}

        {/* New achievements */}
        {summary.newAchievements && summary.newAchievements.length > 0 && (
          <div className="mb-5">
            <h4 className="text-warning text-xs font-semibold mb-2">🎉 New Achievements</h4>
            <div className="flex flex-wrap gap-2">
              {summary.newAchievements.map((a) => (
                <div key={a.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-warning/10 border border-warning/30 text-xs text-warning">
                  <span>{a.icon}</span> {a.name}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onNewDebate}
            className="flex-1 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2">
            <Swords className="w-4 h-4" /> New Debate
          </button>
          <button onClick={onDashboard}
            className="flex-1 py-3 glass hover:bg-white/10 text-white font-bold rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2">
            <BarChart2 className="w-4 h-4" /> Dashboard
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Main DebatePage ───────────────────────────────────────────
export default function DebatePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const {
    currentDebate, messages, isTyping, isLoading,
    setCurrentDebate, addMessage, setMessages, setTyping, setLoading,
    clearDebate, lastArgumentScores, setLastArgumentScores, adaptiveDifficulty,
    setAdaptiveDifficulty,
  } = useDebateStore()

  const [setupMode, setSetupMode]           = useState(!currentDebate)
  const [topic, setTopic]                   = useState(searchParams.get('topic') || '')
  const [difficulty, setDifficulty]         = useState<string>(user?.difficultyLevel || 'intermediate')
  const [aiPersonality, setAiPersonality]   = useState('logical')
  const [userPosition, setUserPosition]     = useState('')
  const [debateMode, setDebateMode]         = useState<'classic' | 'cross_examination' | 'rapid_fire'>('classic')
  const [inputText, setInputText]           = useState('')
  const [isPaused, setIsPaused]             = useState(false)
  const [activeFallacy, setActiveFallacy]   = useState<Fallacy | null>(null)
  const [showSummary, setShowSummary]       = useState(false)
  const [summary, setSummary]               = useState<DebateSummary | null>(null)
  const [turnCount, setTurnCount]           = useState(0)
  const [rapidFireLeft, setRapidFireLeft]   = useState(60)
  const [showStrengthMeter, setShowStrengthMeter] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef       = useRef<HTMLTextAreaElement>(null)
  const rapidFireTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Rapid fire countdown
  useEffect(() => {
    if (debateMode !== 'rapid_fire' || !currentDebate || isPaused || isTyping) return
    rapidFireTimer.current = setInterval(() => {
      setRapidFireLeft(t => {
        if (t <= 1) {
          clearInterval(rapidFireTimer.current!)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(rapidFireTimer.current!)
  }, [debateMode, currentDebate, isPaused, isTyping, turnCount])

  const startDebate = async () => {
    if (!topic.trim()) return toast.error('Please enter a debate topic')
    setLoading(true)
    try {
      const data = await debateService.startDebate({
        topic, difficulty, aiPersonality, userPosition,
        debateMode, adaptiveDifficulty: false,
      })
      setCurrentDebate(data.debate)
      setMessages([{
        id:        data.openingMessage.id,
        sender:    'ai',
        content:   data.openingMessage.content,
        timestamp: data.openingMessage.timestamp,
      }])
      setSetupMode(false)
      setTurnCount(1)
      if (debateMode === 'rapid_fire') setRapidFireLeft(60)
      toast.success('Debate started!')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to start debate')
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!inputText.trim() || !currentDebate || isPaused) return
    const content = inputText.trim()
    setInputText('')
    setTyping(true)
    if (debateMode === 'rapid_fire') setRapidFireLeft(60)

    const tempId = `temp-${Date.now()}`
    addMessage({ id: tempId, sender: 'user', content, timestamp: new Date().toISOString() })

    try {
      const data = await debateService.sendMessage(currentDebate.id, content)
      const { messages: cur } = useDebateStore.getState()
      const userMsg = {
        ...data.userMessage,
        argumentScores: data.userMessage.argumentScores,
      }
      setMessages([...cur.filter(m => m.id !== tempId), userMsg, data.aiMessage])
      setTurnCount(t => t + 1)

      // Update argument scores display
      if (data.userMessage.argumentScores) {
        setLastArgumentScores(data.userMessage.argumentScores)
        setShowStrengthMeter(true)
      }
      // Update adaptive difficulty indicator
      if (data.adaptiveDifficulty && data.adaptiveDifficulty !== currentDebate.difficulty) {
        setAdaptiveDifficulty(data.adaptiveDifficulty)
        toast(`Difficulty adjusted to ${data.adaptiveDifficulty}`, { icon: '🎯', duration: 3000 })
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to send message')
      const { messages: cur } = useDebateStore.getState()
      setMessages(cur.filter(m => m.id !== tempId))
    } finally {
      setTyping(false)
    }
  }

  const endDebate = async () => {
    if (!currentDebate) return
    setLoading(true)
    try {
      const data = await debateService.endDebate(currentDebate.id)
      setSummary(data.summary)
      setShowSummary(true)
    } catch {
      toast.error('Failed to end debate')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Rapid fire time up → auto-end
  useEffect(() => {
    if (debateMode === 'rapid_fire' && rapidFireLeft === 0 && currentDebate) {
      toast('Time up! Ending rapid fire debate.', { icon: '⏱' })
      endDebate()
    }
  }, [rapidFireLeft])

  // ── Summary screen ───────────────────────────────────────────
  if (showSummary && summary) {
    return (
      <DebateSummaryScreen
        summary={summary}
        onNewDebate={() => { clearDebate(); setSetupMode(true); setShowSummary(false); setSummary(null) }}
        onDashboard={() => navigate('/dashboard')}
      />
    )
  }

  // ── Setup screen ─────────────────────────────────────────────
  if (setupMode) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center relative overflow-hidden px-4 py-12">
        <GradientOrbs />
        <div className="absolute inset-0 bg-grid opacity-20" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-2xl"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-500 flex items-center justify-center mx-auto mb-4 shadow-glow-blue">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-display font-black text-white mb-2">Start a Debate</h1>
            <p className="text-slate-400">Configure your session with Aria</p>
          </div>

          <div className="glass-card p-8 rounded-3xl border border-white/10 space-y-6">
            {/* Topic */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Debate Topic *</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Social media does more harm than good"
                className="w-full h-20 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm resize-none outline-none focus:border-primary-500/50 transition-all"
              />
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Your Position <span className="text-slate-500 font-normal">(optional)</span></label>
              <input
                value={userPosition}
                onChange={(e) => setUserPosition(e.target.value)}
                placeholder="e.g., I argue that social media is harmful..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm outline-none focus:border-primary-500/50 transition-all"
              />
            </div>

            {/* Debate Mode */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">Debate Mode</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'classic',           label: 'Classic',           icon: <MessageSquare className="w-4 h-4" />, desc: 'Standard debate' },
                  { id: 'cross_examination', label: 'Cross-Examination', icon: <HelpCircle className="w-4 h-4" />, desc: 'Deep questioning' },
                  { id: 'rapid_fire',        label: 'Rapid Fire',        icon: <Zap className="w-4 h-4" />, desc: '60s per round' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setDebateMode(m.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all ${debateMode === m.id ? 'border-primary-500/60 bg-primary-600/15' : 'border-white/10 hover:bg-white/5'}`}
                  >
                    <div className={`mb-1 ${debateMode === m.id ? 'text-primary-400' : 'text-slate-500'}`}>{m.icon}</div>
                    <div className="text-white text-xs font-semibold">{m.label}</div>
                    <div className="text-slate-500 text-xs">{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">Difficulty</label>
              <div className="grid grid-cols-4 gap-2">
                {['beginner', 'intermediate', 'advanced', 'expert'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize transition-all border ${difficulty === d ? 'border-primary-500/50 bg-primary-600/20 text-white' : 'border-white/10 text-slate-400 hover:text-white'}`}
                    style={difficulty === d ? { color: DIFFICULTY_COLORS[d as keyof typeof DIFFICULTY_COLORS] } : {}}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Personality */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">AI Personality</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {AI_PERSONALITIES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setAiPersonality(p.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${aiPersonality === p.id ? 'border-primary-500/50 bg-primary-600/20' : 'border-white/10 hover:bg-white/5'}`}
                  >
                    <span className="text-xl">{p.icon}</span>
                    <div>
                      <div className="text-white text-sm font-semibold">{p.name}</div>
                      <div className="text-slate-500 text-xs">{p.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startDebate}
              disabled={isLoading || !topic.trim()}
              className="w-full flex items-center justify-center gap-3 py-4 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-glow-blue text-lg"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Brain className="w-5 h-5" />Begin Debate</>}
            </button>
            <button
              onClick={() => navigate(`/voice-debate${topic.trim() ? `?topic=${encodeURIComponent(topic)}` : ''}`)}
              className="w-full flex items-center justify-center gap-2 py-3 glass border border-white/10 hover:border-primary-500/40 text-slate-300 hover:text-white font-semibold rounded-xl transition-all text-sm"
            >
              🎤 Switch to Voice Debate
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── Active debate ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-dark flex flex-col relative overflow-hidden">
      <GradientOrbs />
      <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 glass-dark border-b border-white/10 px-4 py-3 pt-16">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="text-white font-semibold text-sm truncate max-w-xs">{currentDebate?.topic}</div>
              <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                <span className="capitalize" style={{ color: DIFFICULTY_COLORS[(adaptiveDifficulty || currentDebate?.difficulty) as keyof typeof DIFFICULTY_COLORS] || '#94A3B8' }}>
                  {adaptiveDifficulty || currentDebate?.difficulty}
                </span>
                {adaptiveDifficulty && adaptiveDifficulty !== currentDebate?.difficulty && (
                  <span className="text-warning text-xs">(adaptive)</span>
                )}
                <span>·</span>
                <span className="capitalize">{currentDebate?.debateMode?.replace('_', ' ') || 'classic'}</span>
                <span>·</span>
                <span>Turn {turnCount}</span>
                <span>·</span>
                <div className={`w-1.5 h-1.5 rounded-full ${isPaused ? 'bg-warning' : 'bg-success'} animate-pulse`} />
                <span>{isPaused ? 'Paused' : 'Live'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Rapid fire timer */}
            {debateMode === 'rapid_fire' && currentDebate && (
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${rapidFireLeft <= 10 ? 'text-error bg-error/10 border border-error/30' : 'text-warning bg-warning/10 border border-warning/30'}`}>
                <Clock className="w-3 h-3" />
                {String(Math.floor(rapidFireLeft / 60)).padStart(2, '0')}:{String(rapidFireLeft % 60).padStart(2, '0')}
              </div>
            )}
            <button onClick={() => setIsPaused(!isPaused)}
              className="glass p-2 rounded-lg text-slate-400 hover:text-white transition-all border border-white/10">
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
            <button onClick={endDebate} disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-2 bg-error/20 hover:bg-error/30 text-error rounded-lg text-xs font-semibold transition-all border border-error/30">
              {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Square className="w-3 h-3" />}
              End
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 && (
            <div className="text-center py-20 text-slate-600">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Starting debate...</p>
            </div>
          )}
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} onFallacyClick={setActiveFallacy} />
          ))}
          {isTyping && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start mb-4">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-600 to-indigo-500 flex items-center justify-center">
                  <Brain className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="glass rounded-2xl rounded-tl-sm border border-white/10 px-4 py-3 ml-2">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Fallacy Panel */}
      <AnimatePresence>
        {activeFallacy && (
          <FallacyPanel fallacy={activeFallacy} onClose={() => setActiveFallacy(null)} />
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="relative z-10 glass-dark border-t border-white/10 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          {/* Argument Strength Meter */}
          <AnimatePresence>
            {showStrengthMeter && lastArgumentScores && (
              <ArgumentStrengthMeter scores={lastArgumentScores} />
            )}
          </AnimatePresence>

          {isPaused && (
            <div className="text-center text-warning text-sm mb-3 flex items-center justify-center gap-2">
              <Pause className="w-4 h-4" /> Debate paused
            </div>
          )}

          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isPaused ? 'Debate is paused...' :
                  debateMode === 'cross_examination' ? 'Respond to Aria\'s questions...' :
                  debateMode === 'rapid_fire' ? 'Quick! Type your argument...' :
                  'Type your argument... (Enter to send)'
                }
                disabled={isPaused || isTyping}
                rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm resize-none outline-none focus:border-primary-500/50 transition-all disabled:opacity-50"
              />
              <div className="absolute bottom-2 right-3 text-xs text-slate-600">{inputText.length}/1000</div>
            </div>
            <button
              onClick={sendMessage}
              disabled={!inputText.trim() || isPaused || isTyping}
              className="w-11 h-11 bg-primary-600 hover:bg-primary-500 disabled:opacity-40 rounded-xl flex items-center justify-center transition-all shadow-glow-sm"
            >
              {isTyping ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
            </button>
          </div>

          <div className="flex items-center justify-between mt-2 text-xs text-slate-600">
            <span>Fallacies: <span className="text-warning font-semibold">{messages.filter(m => m.hasFallacy).length}</span></span>
            {lastArgumentScores && (
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Last score: <span className={`font-semibold ml-1 ${lastArgumentScores.overall >= 70 ? 'text-success' : lastArgumentScores.overall >= 50 ? 'text-warning' : 'text-error'}`}>
                  {lastArgumentScores.overall}%
                </span>
              </span>
            )}
            <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-warning" /> Aria AI</span>
          </div>
        </div>
      </div>
    </div>
  )
}
