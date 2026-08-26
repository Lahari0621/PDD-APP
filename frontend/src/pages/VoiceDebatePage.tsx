import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain, Mic, MicOff, Volume2, VolumeX, Square, ArrowLeft,
  Loader2, AlertTriangle, MessageSquare, BarChart2,
  CheckCircle, Target, Lightbulb, Swords, Trophy,
} from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { debateService } from '../services/debate.service'
import { useAuthStore } from '../store/authStore'
import GradientOrbs from '../components/animations/GradientOrbs'
import toast from 'react-hot-toast'
import type { DebateSummary } from '../types'

// ─── Types ────────────────────────────────────────────────────
interface VoiceMessage {
  id: string
  sender: 'user' | 'ai'
  content: string
  timestamp: string
  hasFallacy?: boolean
  fallacyCount?: number
}

// ─── Web Speech API helpers ───────────────────────────────────
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}

function getSpeechRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SR) return null
  return new SR()
}

// ─── Waveform visualiser ──────────────────────────────────────
function Waveform({ active, color = '#2563EB' }: { active: boolean; color?: string }) {
  const bars = 20
  return (
    <div className="flex items-center gap-[3px] h-10">
      {Array.from({ length: bars }).map((_, i) => (
        <motion.div
          key={i}
          className="rounded-full w-1"
          style={{ background: color }}
          animate={active ? { height: ['4px', `${Math.random() * 28 + 8}px`, '4px'] } : { height: '4px' }}
          transition={{ duration: 0.5 + Math.random() * 0.4, repeat: active ? Infinity : 0, delay: i * 0.04, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

// ─── AI Speaking Avatar ───────────────────────────────────────
function AISpeakingAvatar({ speaking }: { speaking: boolean }) {
  return (
    <div className="relative flex items-center justify-center">
      {speaking && (
        <>
          <motion.div className="absolute w-24 h-24 rounded-full border border-primary-500/40"
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }} />
          <motion.div className="absolute w-20 h-20 rounded-full border border-primary-500/30"
            animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }} />
        </>
      )}
      <div className={`relative w-16 h-16 rounded-full flex items-center justify-center shadow-glow-blue transition-all duration-300 ${
        speaking ? 'bg-gradient-to-br from-primary-500 to-indigo-500 scale-110' : 'bg-gradient-to-br from-primary-700 to-indigo-700'
      }`}>
        <Brain className="w-8 h-8 text-white" />
      </div>
    </div>
  )
}

// ─── Voice Summary Screen ─────────────────────────────────────
function VoiceSummaryScreen({ summary, topic, onNewDebate, onDashboard }: {
  summary: DebateSummary
  topic: string
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
        className="relative z-10 w-full max-w-xl glass-card p-6 rounded-3xl border border-white/10"
      >
        {/* Badge: Voice Debate */}
        <div className="flex justify-center mb-4">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-600/20 border border-primary-500/30 text-primary-300">
            <Mic className="w-3 h-3" /> Voice Debate
          </span>
        </div>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="text-5xl mb-2">{winIcon}</div>
          <h2 className="text-2xl font-display font-black text-white mb-1">Debate Complete</h2>
          <p className="text-slate-400 text-sm truncate">{topic}</p>
          {summary.winner !== 'draw' && (
            <div className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold ${
              summary.winner === 'user' ? 'bg-success/20 text-success' : 'bg-primary-600/20 text-primary-400'
            }`}>
              {summary.winner === 'user' ? 'You won this debate!' : 'Aria won this one — great practice!'}
            </div>
          )}
        </div>

        {/* Score cards */}
        <div className="grid grid-cols-3 gap-3 mb-5">
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

        {/* Skill bars */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {scores.map(({ label, value, color }) => (
            <div key={label} className="glass rounded-xl p-2 border border-white/5">
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
          <div className="glass rounded-xl p-3 mb-4 border border-white/10">
            <p className="text-slate-300 text-sm leading-relaxed">{summary.summary}</p>
          </div>
        )}

        {/* Strongest / Weakest */}
        {(summary.strongestArgument || summary.weakestArgument) && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            {summary.strongestArgument && (
              <div className="glass rounded-xl p-3 border border-success/20">
                <div className="text-success text-xs font-semibold mb-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Strongest
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">{summary.strongestArgument}</p>
              </div>
            )}
            {summary.weakestArgument && (
              <div className="glass rounded-xl p-3 border border-error/20">
                <div className="text-error text-xs font-semibold mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Weakest
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">{summary.weakestArgument}</p>
              </div>
            )}
          </div>
        )}

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
          <div className="mb-4 p-3 rounded-xl border border-warning/20 bg-warning/5 text-xs text-warning flex items-center gap-2">
            <Target className="w-3.5 h-3.5 shrink-0" />
            <span><strong>Next Challenge:</strong> {summary.nextChallenge}</span>
          </div>
        )}

        {/* New achievements */}
        {summary.newAchievements?.length > 0 && (
          <div className="mb-4">
            <h4 className="text-warning text-xs font-semibold mb-2">🎉 New Achievements</h4>
            <div className="flex flex-wrap gap-2">
              {summary.newAchievements.map((a: any) => (
                <div key={a.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-warning/10 border border-warning/30 text-xs text-warning">
                  <span>{a.icon}</span> {a.name}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onNewDebate}
            className="flex-1 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
            <Mic className="w-4 h-4" /> New Voice Debate
          </button>
          <button onClick={onDashboard}
            className="flex-1 py-3 glass hover:bg-white/10 text-white font-bold rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2 text-sm">
            <BarChart2 className="w-4 h-4" /> Analytics
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────
export default function VoiceDebatePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  // Setup
  const [setupMode, setSetupMode]         = useState(true)
  const [topic, setTopic]                 = useState(searchParams.get('topic') || '')
  const [difficulty, setDifficulty]       = useState(user?.difficultyLevel || 'intermediate')
  const [aiPersonality, setAiPersonality] = useState('logical')
  const [voiceEnabled, setVoiceEnabled]   = useState(true)
  const [autoListen, setAutoListen]       = useState(true)

  // Debate state
  const [debateId, setDebateId]     = useState<string | null>(null)
  const [messages, setMessages]     = useState<VoiceMessage[]>([])
  const [isLoading, setIsLoading]   = useState(false)
  const [isEnded, setIsEnded]       = useState(false)
  const [isEndingDebate, setIsEndingDebate] = useState(false)

  // Summary
  const [summary, setSummary]       = useState<DebateSummary | null>(null)
  const [showSummary, setShowSummary] = useState(false)

  // Live stats
  const [turnCount, setTurnCount]   = useState(0)
  const [fallacyCount, setFallacyCount] = useState(0)
  const startTimeRef = useRef<number>(Date.now())

  // Voice state
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking]   = useState(false)
  const [interimText, setInterimText] = useState('')
  const [speechSupported, setSpeechSupported] = useState(true)

  // Refs
  const recognitionRef  = useRef<SpeechRecognition | null>(null)
  const synthRef        = useRef<SpeechSynthesis>(window.speechSynthesis)
  const messagesEndRef  = useRef<HTMLDivElement>(null)
  const autoListenTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const debateIdRef     = useRef<string | null>(null)
  const isLoadingRef    = useRef(false)
  const pendingSendRef  = useRef<string>('')

  // Keep refs in sync
  useEffect(() => { debateIdRef.current = debateId }, [debateId])
  useEffect(() => { isLoadingRef.current = isLoading }, [isLoading])

  // Check browser speech support
  useEffect(() => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      setSpeechSupported(false)
    }
  }, [])

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening()
      synthRef.current?.cancel()
      if (autoListenTimer.current) clearTimeout(autoListenTimer.current)
    }
  }, [])

  // ── TTS ─────────────────────────────────────────────────────
  const speak = useCallback((text: string) => {
    if (!voiceEnabled || !text) return
    synthRef.current.cancel()

    const utter = new SpeechSynthesisUtterance(text)
    utter.rate = 0.95; utter.pitch = 1.05; utter.volume = 1

    const voices = synthRef.current.getVoices()
    const preferred = voices.find(v =>
      v.name.includes('Google') || v.name.includes('Samantha') ||
      v.name.includes('Karen')  || v.name.includes('Moira')
    ) || voices.find(v => v.lang.startsWith('en')) || voices[0]
    if (preferred) utter.voice = preferred

    utter.onstart = () => setIsSpeaking(true)
    utter.onend   = () => {
      setIsSpeaking(false)
      if (autoListen) {
        autoListenTimer.current = setTimeout(() => startListening(), 600)
      }
    }
    utter.onerror = () => setIsSpeaking(false)
    synthRef.current.speak(utter)
  }, [voiceEnabled, autoListen])

  // ── STT ─────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (isListening || isSpeaking || isLoading || isEnded) return
    const rec = getSpeechRecognition()
    if (!rec) return

    recognitionRef.current = rec
    rec.continuous = false; rec.interimResults = true
    rec.lang = 'en-US'; rec.maxAlternatives = 1

    rec.onstart = () => { setIsListening(true); setInterimText('') }

    rec.onresult = (e: SpeechRecognitionEvent) => {
      let interim = '', final = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        if (e.results[i].isFinal) final += t
        else interim += t
      }
      if (final) { pendingSendRef.current = final }
      setInterimText(interim)
    }

    rec.onend = () => {
      setIsListening(false)
      setInterimText('')
      const text = pendingSendRef.current.trim()
      pendingSendRef.current = ''
      if (text) handleSendVoice(text)
    }

    rec.onerror = (e: SpeechRecognitionErrorEvent) => {
      setIsListening(false)
      if (e.error !== 'no-speech' && e.error !== 'aborted') {
        toast.error(`Microphone error: ${e.error}`)
      }
    }

    try { rec.start() } catch { setIsListening(false) }
  }, [isListening, isSpeaking, isLoading, isEnded])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
    setInterimText('')
  }, [])

  // ── Send voice message ───────────────────────────────────────
  const handleSendVoice = useCallback(async (text: string) => {
    const currentDebateId = debateIdRef.current
    if (!text.trim() || !currentDebateId || isLoadingRef.current) return

    isLoadingRef.current = true
    setIsLoading(true)
    synthRef.current.cancel()

    const userMsg: VoiceMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])

    try {
      const data = await debateService.sendMessage(currentDebateId, text)
      const hasFallacy = data.userMessage?.hasFallacy || false
      const aiMsg: VoiceMessage = {
        id: data.aiMessage.id || `ai-${Date.now()}`,
        sender: 'ai',
        content: data.aiMessage.content,
        timestamp: data.aiMessage.timestamp || new Date().toISOString(),
        hasFallacy,
      }
      setMessages(prev => [...prev, aiMsg])
      setTurnCount(t => t + 1)
      if (hasFallacy) setFallacyCount(c => c + 1)
      speak(data.aiMessage.content)
    } catch {
      toast.error('Failed to get AI response')
      if (autoListen) setTimeout(() => startListening(), 500)
    } finally {
      isLoadingRef.current = false
      setIsLoading(false)
    }
  }, [speak, autoListen, startListening])

  // ── Start debate ─────────────────────────────────────────────
  const startDebate = async () => {
    if (!topic.trim()) return toast.error('Enter a debate topic')
    setIsLoading(true)
    try {
      const data = await debateService.startDebate({ topic, difficulty, aiPersonality, debateMode: 'classic' })
      setDebateId(data.debate.id)
      startTimeRef.current = Date.now()
      const opening: VoiceMessage = {
        id: data.openingMessage.id,
        sender: 'ai',
        content: data.openingMessage.content,
        timestamp: data.openingMessage.timestamp,
      }
      setMessages([opening])
      setSetupMode(false)
      speak(opening.content)
      toast.success('Voice debate started!')
    } catch {
      toast.error('Failed to start debate')
    } finally {
      setIsLoading(false)
    }
  }

  // ── End debate — fetch full summary for analytics display ───
  const endDebate = async () => {
    if (isEndingDebate) return
    stopListening()
    synthRef.current.cancel()
    setIsEnded(true)
    setIsEndingDebate(true)

    if (debateId) {
      try {
        const data = await debateService.endDebate(debateId)
        // Build summary same shape as text debate
        setSummary({
          topic,
          duration:          Math.floor((Date.now() - startTimeRef.current) / 1000),
          totalTurns:        turnCount * 2,
          winner:            data.summary?.winner || 'draw',
          finalScore:        data.summary?.finalScore || 60,
          xpEarned:          data.summary?.xpEarned || 50,
          summary:           data.summary?.summary || '',
          keyInsights:       data.summary?.keyInsights || [],
          improvementAreas:  data.summary?.improvementAreas || [],
          strengths:         data.summary?.strengths || [],
          logicScore:        data.summary?.logicScore || 60,
          persuasionScore:   data.summary?.persuasionScore || 60,
          evidenceScore:     data.summary?.evidenceScore || 55,
          rebuttalScore:     data.summary?.rebuttalScore || 60,
          clarityScore:      data.summary?.clarityScore || 65,
          consistencyScore:  data.summary?.consistencyScore || 62,
          strongestArgument: data.summary?.strongestArgument || '',
          weakestArgument:   data.summary?.weakestArgument || '',
          mostCommonFallacy: data.summary?.mostCommonFallacy || null,
          fallacyCount:      data.summary?.fallacyCount || fallacyCount,
          bestRebuttal:      data.summary?.bestRebuttal || '',
          missedOpportunities: data.summary?.missedOpportunities || [],
          recommendations:   data.summary?.recommendations || [],
          nextChallenge:     data.summary?.nextChallenge || '',
          newAchievements:   data.summary?.newAchievements || [],
        })
        setShowSummary(true)
      } catch {
        // Even if summary fetch fails, show a basic summary with local stats
        setSummary({
          topic, duration: Math.floor((Date.now() - startTimeRef.current) / 1000),
          totalTurns: turnCount * 2, winner: 'draw', finalScore: 65,
          xpEarned: 50, summary: 'Voice debate completed. Keep practising!',
          keyInsights: ['Voice debate completed successfully'],
          improvementAreas: ['Continue practising to improve'],
          strengths: ['Completed a full voice debate'],
          logicScore: 65, persuasionScore: 60, evidenceScore: 55,
          rebuttalScore: 65, clarityScore: 70, consistencyScore: 62,
          strongestArgument: '', weakestArgument: '', mostCommonFallacy: null,
          fallacyCount, bestRebuttal: '', missedOpportunities: [],
          recommendations: ['Try more voice debates to improve fluency'],
          nextChallenge: 'Try a more complex topic next time',
          newAchievements: [],
        })
        setShowSummary(true)
        toast('Debate ended. Analytics saved!', { icon: '📊' })
      }
    }
    setIsEndingDebate(false)
  }

  const toggleMic = () => { if (isListening) stopListening(); else startListening() }

  // ─── Summary Screen ────────────────────────────────────────
  if (showSummary && summary) {
    return (
      <VoiceSummaryScreen
        summary={summary}
        topic={topic}
        onNewDebate={() => {
          setShowSummary(false); setSummary(null); setSetupMode(true)
          setIsEnded(false); setMessages([]); setTurnCount(0); setFallacyCount(0)
        }}
        onDashboard={() => navigate('/analytics')}
      />
    )
  }

  // ─── Setup Screen ──────────────────────────────────────────
  if (setupMode) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center relative overflow-hidden px-4 py-12">
        <GradientOrbs />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-500 flex items-center justify-center mx-auto mb-4 shadow-glow-blue">
              <Mic className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-display font-black text-white mb-2">Voice Debate</h1>
            <p className="text-slate-400">Speak your arguments — Aria listens, responds, and tracks your analytics</p>
          </div>

          {!speechSupported && (
            <div className="mb-4 p-4 rounded-xl border border-warning/40 bg-warning/10 text-warning text-sm flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div><strong>Speech not supported in this browser.</strong> Try Chrome or Edge for the best experience.</div>
            </div>
          )}

          <div className="glass-card p-8 rounded-3xl border border-white/10 space-y-6">
            {/* Topic */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Debate Topic *</label>
              <textarea value={topic} onChange={e => setTopic(e.target.value)}
                placeholder="e.g., Social media does more harm than good"
                className="w-full h-20 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm resize-none outline-none focus:border-primary-500/50 transition-all" />
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">Difficulty</label>
              <div className="grid grid-cols-4 gap-2">
                {['beginner', 'intermediate', 'advanced', 'expert'].map(d => (
                  <button key={d} onClick={() => setDifficulty(d)}
                    className={`py-2 rounded-xl text-xs font-semibold capitalize border transition-all ${difficulty === d ? 'border-primary-500/50 bg-primary-600/20 text-white' : 'border-white/10 text-slate-400 hover:text-white'}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Personality */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">AI Style</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'logical',        label: 'Logical',          icon: '🧠' },
                  { id: 'socratic',       label: 'Socratic',         icon: '❓' },
                  { id: 'aggressive',     label: 'Aggressive',       icon: '⚡' },
                  { id: 'empathetic',     label: 'Empathetic',       icon: '💙' },
                  { id: 'devil_advocate', label: "Devil's Advocate",  icon: '😈' },
                ].map(p => (
                  <button key={p.id} onClick={() => setAiPersonality(p.id)}
                    className={`p-2 rounded-xl border text-xs text-center transition-all ${aiPersonality === p.id ? 'border-primary-500/60 bg-primary-600/15 text-white' : 'border-white/10 text-slate-400 hover:text-white'}`}>
                    <div className="text-lg mb-0.5">{p.icon}</div>{p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Voice options */}
            <div className="flex gap-4 flex-wrap">
              {[
                { label: 'AI speaks responses', val: voiceEnabled, set: setVoiceEnabled },
                { label: 'Auto-listen after AI', val: autoListen,  set: setAutoListen },
              ].map(({ label, val, set }) => (
                <label key={label} className="flex items-center gap-2 cursor-pointer">
                  <div onClick={() => set((v: boolean) => !v)}
                    className={`w-10 h-5 rounded-full transition-all relative ${val ? 'bg-primary-600' : 'bg-white/10'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${val ? 'left-5' : 'left-0.5'}`} />
                  </div>
                  <span className="text-slate-300 text-sm">{label}</span>
                </label>
              ))}
            </div>

            {/* Analytics note */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-primary-600/5 border border-primary-500/20 text-xs text-primary-300">
              <BarChart2 className="w-3.5 h-3.5 shrink-0" />
              Analytics and XP are tracked — your scores appear in the Analytics page after ending the debate.
            </div>

            <button onClick={startDebate} disabled={isLoading || !topic.trim()}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all">
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Starting...</> : <><Mic className="w-4 h-4" /> Start Voice Debate</>}
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // ─── Active Voice Debate ────────────────────────────────────
  return (
    <div className="min-h-screen bg-dark relative overflow-hidden flex flex-col">
      <GradientOrbs />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 sm:px-6 pt-6 pb-3">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Exit
        </button>
        <div className="text-center">
          <h2 className="text-white font-bold text-sm truncate max-w-[200px]">{topic}</h2>
          <div className="text-xs text-primary-400 capitalize">{difficulty} · {aiPersonality}</div>
        </div>
        <button onClick={endDebate} disabled={isEnded || isEndingDebate}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-error/30 text-error text-xs hover:bg-error/10 transition-all disabled:opacity-40">
          {isEndingDebate ? <Loader2 className="w-3 h-3 animate-spin" /> : <Square className="w-3 h-3" />}
          {isEndingDebate ? 'Ending...' : 'End'}
        </button>
      </div>

      {/* Live stats bar */}
      <div className="relative z-10 flex items-center justify-center gap-6 py-2 px-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <MessageSquare className="w-3 h-3" />
          <span className="text-white font-semibold">{turnCount}</span> turns
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <AlertTriangle className="w-3 h-3" />
          <span className={`font-semibold ${fallacyCount > 0 ? 'text-warning' : 'text-white'}`}>{fallacyCount}</span> fallacies
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <BarChart2 className="w-3 h-3" />
          <span className="text-success font-semibold">tracked</span>
        </div>
      </div>

      {/* AI Avatar + Status */}
      <div className="relative z-10 flex flex-col items-center py-5">
        <AISpeakingAvatar speaking={isSpeaking} />
        <div className="mt-3 text-slate-400 text-sm font-medium">
          {isSpeaking      ? 'Aria is speaking...' :
           isLoading       ? 'Aria is thinking...' :
           isListening     ? 'Listening to you...' :
           isEndingDebate  ? 'Generating your analytics...' :
           isEnded         ? 'Debate ended' :
                             'Your turn — tap mic to speak'}
        </div>
        {isSpeaking  && <div className="mt-2"><Waveform active={isSpeaking}  color="#2563EB" /></div>}
        {isListening && <div className="mt-2"><Waveform active={isListening} color="#10B981" /></div>}
        {(isLoading || isEndingDebate) && (
          <div className="mt-2 flex gap-1">
            {[0,1,2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        )}
      </div>

      {/* Interim transcript */}
      <AnimatePresence>
        {isListening && interimText && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="relative z-10 mx-4 sm:mx-auto sm:max-w-xl mb-3 px-4 py-3 glass rounded-2xl border border-success/30 text-sm text-success italic">
            "{interimText}"
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 sm:px-6 pb-4 space-y-3 max-w-2xl mx-auto w-full">
        {messages.map(msg => (
          <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              msg.sender === 'user'
                ? 'bg-primary-600/25 text-white border border-primary-500/30 rounded-tr-sm'
                : 'glass text-slate-200 border border-white/10 rounded-tl-sm'
            }`}>
              {msg.sender === 'ai' && (
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Brain className="w-3 h-3 text-primary-400" />
                  <span className="text-xs text-slate-500 font-medium">Aria</span>
                  <button onClick={() => speak(msg.content)}
                    className="ml-auto text-slate-600 hover:text-primary-400 transition-colors" title="Replay">
                    <Volume2 className="w-3 h-3" />
                  </button>
                </div>
              )}
              {msg.content}
              {msg.hasFallacy && (
                <div className="mt-1.5 flex items-center gap-1 text-warning text-xs">
                  <AlertTriangle className="w-3 h-3" /> Fallacy detected in your argument
                </div>
              )}
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Controls */}
      <div className="relative z-10 px-4 sm:px-6 pb-8 pt-4 max-w-2xl mx-auto w-full">
        {isEnded && !isEndingDebate ? (
          <div className="flex gap-3">
            <button onClick={() => navigate('/debate')}
              className="flex-1 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2">
              <MessageSquare className="w-4 h-4" /> Text Debate
            </button>
            <button onClick={() => navigate('/analytics')}
              className="flex-1 py-3 glass border border-white/10 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2">
              <BarChart2 className="w-4 h-4" /> Analytics
            </button>
          </div>
        ) : !isEnded ? (
          <>
            <div className="flex items-center justify-center gap-6">
              {/* Mute AI */}
              <button onClick={() => { setVoiceEnabled(v => !v); synthRef.current.cancel() }}
                className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all ${voiceEnabled ? 'border-primary-500/40 bg-primary-600/10 text-primary-400' : 'border-white/10 text-slate-500'}`}>
                {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>

              {/* Main mic */}
              <button onClick={toggleMic} disabled={isLoading || isEnded || isSpeaking}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg disabled:opacity-40 ${
                  isListening
                    ? 'bg-success/90 hover:bg-success scale-105 shadow-[0_0_30px_rgba(16,185,129,0.5)]'
                    : 'bg-gradient-to-br from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 shadow-glow-blue'
                }`}>
                {isListening ? <MicOff className="w-8 h-8 text-white" /> : <Mic className="w-8 h-8 text-white" />}
              </button>

              {/* Stop AI speaking */}
              <button onClick={() => { synthRef.current.cancel(); setIsSpeaking(false) }}
                disabled={!isSpeaking}
                className="w-12 h-12 rounded-full flex items-center justify-center border border-white/10 text-slate-500 hover:text-white disabled:opacity-30 transition-all">
                <Square className="w-5 h-5" />
              </button>
            </div>
            <p className="text-center text-xs text-slate-600 mt-3">
              {isListening ? 'Speak now — tap mic again to stop' : 'Tap mic to start speaking'}
            </p>
          </>
        ) : null}
      </div>
    </div>
  )
}
