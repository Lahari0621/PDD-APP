import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, Search, AlertTriangle, CheckCircle, Brain, Zap, ChevronRight, X, Star, RefreshCw, TrendingUp, Lightbulb, History, Clock, Trophy, Target } from 'lucide-react'
import { fallacyService } from '../services/fallacy.service'
import { quizService } from '../services/quiz.service'
import type { QuizQuestion, QuizResultAnswer, QuizMode } from '../types'
import GradientOrbs from '../components/animations/GradientOrbs'
import SectionReveal from '../components/common/SectionReveal'
import type { FallacyLibraryItem } from '../types'

const FLASHCARDS = [
  { front: 'Ad Hominem', back: 'Attacking the person making the argument rather than the argument itself.', color: '#EF4444', icon: '👤' },
  { front: 'Straw Man', back: 'Misrepresenting someone\'s argument to make it easier to attack.', color: '#F59E0B', icon: '🎭' },
  { front: 'Slippery Slope', back: 'Assuming one event will inevitably lead to extreme consequences without justification.', color: '#8B5CF6', icon: '📉' },
  { front: 'Appeal to Emotion', back: 'Manipulating emotions rather than using logical reasoning to support a claim.', color: '#EC4899', icon: '💔' },
  { front: 'False Dilemma', back: 'Presenting only two options when more alternatives exist.', color: '#06B6D4', icon: '⚖️' },
  { front: 'Bandwagon', back: 'Arguing something is true or good because many people believe it.', color: '#10B981', icon: '🚂' },
]

function FlashCard({ card }: { card: typeof FLASHCARDS[0] }) {
  const [flipped, setFlipped] = useState(false)
  return (
    <div className="perspective-1000 h-40 cursor-pointer" onClick={() => setFlipped(!flipped)}>
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full h-full transform-style-3d"
      >
        {/* Front */}
        <div className="absolute inset-0 backface-hidden glass-card rounded-2xl flex flex-col items-center justify-center p-4 border border-white/10"
          style={{ borderColor: `${card.color}30` }}>
          <div className="text-3xl mb-2">{card.icon}</div>
          <div className="text-white font-bold text-center">{card.front}</div>
          <div className="text-xs text-slate-500 mt-2">Click to reveal</div>
        </div>
        {/* Back */}
        <div className="absolute inset-0 backface-hidden glass-card rounded-2xl flex items-center justify-center p-4 border"
          style={{ transform: 'rotateY(180deg)', borderColor: `${card.color}40`, background: `${card.color}10` }}>
          <p className="text-slate-200 text-sm text-center leading-relaxed">{card.back}</p>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Quiz difficulty / category config ───────────────────────
const DIFFICULTIES = [
  { id: 'all',          label: 'All Levels',    color: '#6366F1' },
  { id: 'beginner',     label: 'Beginner',      color: '#10B981' },
  { id: 'intermediate', label: 'Intermediate',  color: '#F59E0B' },
  { id: 'advanced',     label: 'Advanced',      color: '#EF4444' },
  { id: 'expert',       label: 'Expert',        color: '#8B5CF6' },
]

const QUIZ_MODES: { id: QuizMode; label: string; icon: string; desc: string }[] = [
  { id: 'random',    label: 'Random Quiz',       icon: '🎲', desc: 'Mix of all topics' },
  { id: 'practice',  label: 'Practice Quiz',     icon: '📝', desc: 'Focus on one topic' },
  { id: 'weakness',  label: 'Weakness Quiz',     icon: '🎯', desc: 'Target your weak spots' },
]

const CATEGORIES = [
  { id: 'logical_fallacies',  label: 'Logical Fallacies',  icon: '⚠️' },
  { id: 'critical_thinking',  label: 'Critical Thinking',  icon: '🧠' },
  { id: 'argument_analysis',  label: 'Argument Analysis',  icon: '🔍' },
  { id: 'evidence_and_claims',label: 'Evidence & Claims',   icon: '📊' },
  { id: 'debate_strategy',    label: 'Debate Strategy',     icon: '⚔️' },
  { id: 'cognitive_biases',   label: 'Cognitive Biases',    icon: '🪞' },
  { id: 'persuasion',         label: 'Persuasion',          icon: '🎤' },
  { id: 'socratic_reasoning', label: 'Socratic Reasoning',  icon: '🤔' },
  { id: 'ethics',             label: 'Ethics',              icon: '⚖️' },
  { id: 'philosophy',         label: 'Philosophy',          icon: '📜' },
  { id: 'logical_reasoning',  label: 'Logical Reasoning',   icon: '🔢' },
  { id: 'counterarguments',   label: 'Counterarguments',    icon: '↩️' },
  { id: 'decision_making',    label: 'Decision Making',     icon: '🎯' },
  { id: 'communication',      label: 'Communication',       icon: '💬' },
  { id: 'general_reasoning',  label: 'General Reasoning',   icon: '💡' },
]

// ─── Quiz Setup Screen ────────────────────────────────────────
function QuizSetup({ onStart }: {
  onStart: (cfg: { difficulty: string; category: string; mode: QuizMode; count: number }) => void
}) {
  const [difficulty, setDifficulty] = useState('all')
  const [category, setCategory]     = useState('')
  const [mode, setMode]             = useState<QuizMode>('random')
  const [count, setCount]           = useState(5)

  const handleStart = () => {
    onStart({
      difficulty: difficulty === 'all' ? '' : difficulty,
      category:   mode === 'random' ? '' : category,
      mode,
      count,
    })
  }

  return (
    <div className="space-y-6">

      {/* Mode selector */}
      <div>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Quiz Mode</p>
        <div className="grid grid-cols-3 gap-2">
          {QUIZ_MODES.map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              className={`p-3 rounded-xl border text-left transition-all ${mode === m.id ? 'border-primary-500/60 bg-primary-600/15' : 'border-white/10 hover:border-white/20'}`}
            >
              <div className="text-lg mb-1">{m.icon}</div>
              <div className="text-white text-xs font-semibold">{m.label}</div>
              <div className="text-slate-500 text-xs">{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Difficulty</p>
        <div className="flex flex-wrap gap-2">
          {DIFFICULTIES.map(d => (
            <button key={d.id} onClick={() => setDifficulty(d.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${difficulty === d.id ? 'text-white border-transparent' : 'border-white/10 text-slate-400 hover:text-white'}`}
              style={difficulty === d.id ? { background: d.color, borderColor: d.color } : {}}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category (only for practice mode) */}
      {mode === 'practice' && (
        <div>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Topic</p>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            <button
              onClick={() => setCategory('')}
              className={`px-3 py-2 rounded-xl border text-left text-xs transition-all ${category === '' ? 'border-primary-500/60 bg-primary-600/15 text-white' : 'border-white/10 text-slate-400 hover:text-white'}`}
            >
              All Topics
            </button>
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => setCategory(c.id)}
                className={`px-3 py-2 rounded-xl border text-left text-xs transition-all ${category === c.id ? 'border-primary-500/60 bg-primary-600/15 text-white' : 'border-white/10 text-slate-400 hover:text-white'}`}
              >
                {c.icon} {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Question count */}
      <div>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Number of Questions</p>
        <div className="flex gap-2">
          {[5, 10, 15].map(n => (
            <button key={n} onClick={() => setCount(n)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${count === n ? 'bg-primary-600 border-primary-500 text-white' : 'border-white/10 text-slate-400 hover:text-white'}`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <button onClick={handleStart}
        className="w-full py-3.5 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
        <Brain className="w-4 h-4" />
        Start Quiz
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}

// ─── Active Quiz Screen ───────────────────────────────────────
function ActiveQuiz({ questions, onFinish }: {
  questions: QuizQuestion[]
  onFinish: (answers: { questionId: string; selectedAnswer: number }[], timeSpent: number) => void
}) {
  const [currentQ, setCurrentQ]       = useState(0)
  const [selected, setSelected]       = useState<number | null>(null)
  const [answers, setAnswers]         = useState<{ questionId: string; selectedAnswer: number }[]>([])
  const [showHint, setShowHint]       = useState(false)
  const startTime                     = useRef(Date.now())

  const q = questions[currentQ]
  const progress = ((currentQ) / questions.length) * 100

  const handleAnswer = (idx: number) => {
    if (selected !== null) return
    setSelected(idx)
  }

  const handleNext = () => {
    if (selected === null) return
    const newAnswers = [...answers, { questionId: q._id, selectedAnswer: selected }]
    setAnswers(newAnswers)

    if (currentQ < questions.length - 1) {
      setCurrentQ(c => c + 1)
      setSelected(null)
      setShowHint(false)
    } else {
      const timeSpent = Math.round((Date.now() - startTime.current) / 1000)
      onFinish(newAnswers, timeSpent)
    }
  }

  const diffColor: Record<string, string> = {
    beginner: '#10B981', intermediate: '#F59E0B', advanced: '#EF4444', expert: '#8B5CF6'
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-sm">Question {currentQ + 1} / {questions.length}</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold capitalize"
            style={{ background: `${diffColor[q.difficulty] || '#6366F1'}20`, color: diffColor[q.difficulty] || '#6366F1' }}>
            {q.difficulty}
          </span>
        </div>
        <span className="text-xs text-slate-500 capitalize">{q.module}</span>
      </div>

      {/* Progress bar */}
      <div className="score-bar mb-5">
        <div className="score-fill transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      {/* Question */}
      <h3 className="text-white font-bold text-base mb-5 leading-relaxed">{q.question}</h3>

      {/* Options */}
      <div className="space-y-2.5 mb-5">
        {q.options.map((opt, i) => (
          <button key={i} onClick={() => handleAnswer(i)}
            disabled={selected !== null}
            className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
              selected === null
                ? 'border-white/10 text-slate-300 hover:border-primary-500/50 hover:bg-primary-600/10'
                : i === selected
                  ? 'border-primary-500/60 bg-primary-600/20 text-white'
                  : 'border-white/5 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span className="mr-3 font-bold text-slate-500">{String.fromCharCode(65 + i)}.</span>{opt}
          </button>
        ))}
      </div>

      {/* Hint */}
      {q.hint && (
        <div className="mb-4">
          {!showHint ? (
            <button onClick={() => setShowHint(true)}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary-400 transition-colors">
              <Lightbulb className="w-3.5 h-3.5" />
              Show hint
            </button>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-start gap-2 text-xs text-amber-400/80 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2">
              <Lightbulb className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              {q.hint}
            </motion.div>
          )}
        </div>
      )}

      {/* Next button */}
      {selected !== null && (
        <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          onClick={handleNext}
          className="w-full py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
          {currentQ < questions.length - 1 ? 'Next Question' : 'See Results'}
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      )}
    </div>
  )
}

// ─── Quiz Result Screen ───────────────────────────────────────
function QuizResultScreen({ result, onRetry, onNewQuiz }: {
  result: import('../services/quiz.service').QuizResult
  onRetry: () => void
  onNewQuiz: () => void
}) {
  const pct = result.accuracy
  const emoji = pct >= 80 ? '🏆' : pct >= 60 ? '🎯' : '📚'
  const msg   = pct >= 80 ? 'Excellent work!' : pct >= 60 ? 'Good effort!' : 'Keep practising!'

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    return m > 0 ? `${m}m ${s % 60}s` : `${s}s`
  }

  return (
    <div>
      {/* Summary */}
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">{emoji}</div>
        <h3 className="text-2xl font-bold text-white mb-1">Quiz Complete!</h3>
        <p className="text-slate-400 text-sm">{msg}</p>
      </div>

      {/* Score grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          { label: 'Score',     value: `${result.correctAnswers} / ${result.totalQuestions}`, color: '#6366F1' },
          { label: 'Accuracy',  value: `${result.accuracy}%`,       color: pct >= 60 ? '#10B981' : '#EF4444' },
          { label: 'XP Earned', value: `+${result.xpEarned} XP`,    color: '#F59E0B' },
          { label: 'Time',      value: formatTime(result.timeSpent), color: '#06B6D4' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass rounded-xl p-3 border border-white/10 text-center">
            <div className="font-bold text-lg" style={{ color }}>{value}</div>
            <div className="text-slate-500 text-xs">{label}</div>
          </div>
        ))}
      </div>

      {/* Per-question breakdown */}
      <div className="mb-5">
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Question Review</p>
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {result.answers.map((a, i) => (
            <div key={i}
              className={`p-3 rounded-xl border text-xs ${a.isCorrect ? 'bg-success/5 border-success/20' : 'bg-error/5 border-error/20'}`}>
              <div className="flex items-start gap-2 mb-1">
                {a.isCorrect
                  ? <CheckCircle className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                  : <X className="w-3.5 h-3.5 text-error shrink-0 mt-0.5" />}
                <p className="text-slate-300 leading-snug">{a.questionText}</p>
              </div>
              {!a.isCorrect && (
                <p className="text-success text-xs ml-5">
                  Correct answer: <span className="font-semibold">{a.correctText}</span>
                </p>
              )}
              <p className="text-slate-500 text-xs ml-5 mt-1">{a.explanation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Weak areas */}
      {result.weakCategories.length > 0 && (
        <div className="mb-5 p-3 rounded-xl border border-warning/20 bg-warning/5">
          <p className="text-warning text-xs font-semibold mb-1.5 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Needs Improvement
          </p>
          <div className="flex flex-wrap gap-1.5">
            {result.weakCategories.map(c => (
              <span key={c} className="text-xs px-2 py-0.5 rounded-full bg-warning/10 text-warning/80 capitalize">
                {c.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
          {result.recommendedNext && (
            <p className="text-slate-400 text-xs mt-2">
              Recommended: <span className="text-primary-400 capitalize">{result.recommendedNext.replace(/_/g, ' ')}</span>
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={onRetry}
          className="flex-1 py-2.5 border border-white/10 text-slate-300 hover:text-white font-semibold rounded-xl transition-all text-sm flex items-center justify-center gap-2">
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
        <button onClick={onNewQuiz}
          className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2">
          <Brain className="w-3.5 h-3.5" /> New Quiz
        </button>
      </div>
    </div>
  )
}

// ─── Quiz History Screen ──────────────────────────────────────
function QuizHistory() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['quiz-history'],
    queryFn: quizService.getHistory,
    staleTime: 0,
    refetchOnMount: true,
  })

  const results = data?.results || []

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const formatTime = (s: number) => {
    if (!s) return '—'
    const m = Math.floor(s / 60)
    return m > 0 ? `${m}m ${s % 60}s` : `${s}s`
  }

  const accuracyColor = (pct: number) =>
    pct >= 80 ? '#10B981' : pct >= 60 ? '#F59E0B' : '#EF4444'

  const accuracyEmoji = (pct: number) =>
    pct >= 80 ? '🏆' : pct >= 60 ? '🎯' : '📚'

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-primary-500/30 border-t-primary-500 animate-spin" />
        <p className="text-slate-400 text-sm">Loading history…</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-3">⚠️</div>
        <p className="text-slate-400 text-sm mb-4">Failed to load quiz history.</p>
        <button onClick={() => refetch()}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold rounded-xl transition-all">
          Try Again
        </button>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">📋</div>
        <h3 className="text-white font-bold text-lg mb-2">No quizzes yet</h3>
        <p className="text-slate-400 text-sm">Complete your first quiz to see your history here.</p>
      </div>
    )
  }

  // Summary stats across all results
  const totalQuizzes   = results.length
  const avgAccuracy    = Math.round(results.reduce((s: number, r: any) => s + r.score, 0) / totalQuizzes)
  const totalXp        = results.reduce((s: number, r: any) => s + (r.xpEarned || 0), 0)
  const bestScore      = Math.max(...results.map((r: any) => r.score))

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Trophy,  label: 'Quizzes Taken',  value: totalQuizzes,       color: '#6366F1' },
          { icon: Target,  label: 'Avg Accuracy',   value: `${avgAccuracy}%`,  color: avgAccuracy >= 60 ? '#10B981' : '#EF4444' },
          { icon: Zap,     label: 'Total XP',        value: `+${totalXp}`,      color: '#F59E0B' },
          { icon: Brain,   label: 'Best Score',      value: `${bestScore}%`,    color: '#06B6D4' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="glass-card rounded-2xl p-4 border border-white/10 text-center">
            <Icon className="w-4 h-4 mx-auto mb-1.5" style={{ color }} />
            <div className="text-white font-bold text-xl" style={{ color }}>{value}</div>
            <div className="text-slate-500 text-xs">{label}</div>
          </div>
        ))}
      </div>

      {/* History list */}
      <div className="space-y-3">
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Recent Attempts</p>
        {results.map((r: any, i: number) => (
          <motion.div
            key={r._id || i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="glass-card rounded-2xl border border-white/10 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              {/* Left: emoji + title */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="text-2xl shrink-0">{accuracyEmoji(r.score)}</div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-semibold text-sm capitalize">
                      {(r.quizType || 'quiz').replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-400 capitalize border border-white/10">
                      {r.totalQuestions}Q
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      {formatTime(r.timeSpent)}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatDate(r.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: score */}
              <div className="text-right shrink-0">
                <div className="text-lg font-black" style={{ color: accuracyColor(r.score) }}>
                  {r.score}%
                </div>
                <div className="text-xs text-slate-500">
                  {r.correctAnswers}/{r.totalQuestions} correct
                </div>
                {r.xpEarned > 0 && (
                  <div className="text-xs text-amber-400 font-semibold mt-0.5">
                    +{r.xpEarned} XP
                  </div>
                )}
              </div>
            </div>

            {/* Accuracy bar */}
            <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${r.score}%`, background: accuracyColor(r.score) }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Refresh button */}
      <button onClick={() => refetch()}
        className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors mx-auto">
        <RefreshCw className="w-3.5 h-3.5" />
        Refresh
      </button>
    </div>
  )
}

// ─── Main QuizSection ─────────────────────────────────────────
function QuizSection() {
  type Phase = 'setup' | 'loading' | 'active' | 'submitting' | 'result' | 'error'

  const [phase,     setPhase]     = useState<Phase>('setup')
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [result,    setResult]    = useState<import('../services/quiz.service').QuizResult | null>(null)
  const [errorMsg,  setErrorMsg]  = useState('')
  const lastConfig = useRef<{ difficulty: string; category: string; mode: QuizMode; count: number } | null>(null)

  const handleStart = async (cfg: { difficulty: string; category: string; mode: QuizMode; count: number }) => {
    lastConfig.current = cfg
    setPhase('loading')
    setErrorMsg('')
    try {
      let data
      if (cfg.mode === 'weakness') {
        data = await quizService.getWeaknessQuiz({ count: cfg.count, difficulty: cfg.difficulty || undefined })
      } else {
        data = await quizService.getQuestions({
          difficulty: cfg.difficulty || undefined,
          category:   cfg.category   || undefined,
          count:      cfg.count,
          mode:       cfg.mode,
        })
      }
      // Ensure we actually got questions
      if (!data.questions || data.questions.length === 0) {
        setErrorMsg('No questions found for those settings. Try a different difficulty or topic.')
        setPhase('error')
        return
      }
      setQuestions(data.questions)
      setPhase('active')
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.error || 'Failed to load questions. Please try again.')
      setPhase('error')
    }
  }

  const handleFinish = async (
    answers: { questionId: string; selectedAnswer: number }[],
    timeSpent: number
  ) => {
    setPhase('submitting')
    try {
      const data = await quizService.submitResult({
        answers,
        timeSpent,
        quizType:   lastConfig.current?.category || 'fallacy_identification',
        difficulty: lastConfig.current?.difficulty,
        category:   lastConfig.current?.category,
      })
      setResult(data.result)
      setPhase('result')
    } catch (e: any) {
      // Saving failed (e.g. network issue) — build a basic local result
      // so the user still sees their score
      const correctCount = 0 // we can't verify server-side, so show 0 with a note
      setResult({
        id: 'local',
        score: 0,
        totalQuestions: answers.length,
        correctAnswers: correctCount,
        incorrectAnswers: answers.length,
        accuracy: 0,
        xpEarned: 0,
        timeSpent,
        answers: [],
        weakCategories: [],
        recommendedNext: null,
      })
      setErrorMsg('Could not connect to server to verify answers. Results not saved.')
      setPhase('result')
    }
  }

  const handleNewQuiz = () => {
    setPhase('setup')
    setResult(null)
    setQuestions([])
  }

  const handleRetry = () => {
    if (lastConfig.current) handleStart(lastConfig.current)
  }

  return (
    <div>
      <AnimatePresence mode="wait">
        {phase === 'setup' && (
          <motion.div key="setup" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <QuizSetup onStart={handleStart} />
          </motion.div>
        )}

        {phase === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-primary-500/30 border-t-primary-500 animate-spin" />
            <p className="text-slate-400 text-sm">Loading your personalised questions…</p>
          </motion.div>
        )}

        {phase === 'active' && questions.length > 0 && (
          <motion.div key="active" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <ActiveQuiz questions={questions} onFinish={handleFinish} />
          </motion.div>
        )}

        {phase === 'submitting' && (
          <motion.div key="submitting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-primary-500/30 border-t-primary-500 animate-spin" />
            <p className="text-slate-400 text-sm">Calculating your results…</p>
          </motion.div>
        )}

        {phase === 'result' && result && (
          <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {errorMsg && (
              <div className="mb-4 px-3 py-2 rounded-lg border border-warning/30 bg-warning/10 text-warning text-xs">
                ⚠️ {errorMsg}
              </div>
            )}
            <QuizResultScreen result={result} onRetry={handleRetry} onNewQuiz={handleNewQuiz} />
          </motion.div>
        )}

        {phase === 'error' && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-center py-12">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="text-error text-sm mb-4">{errorMsg}</p>
            <button onClick={() => setPhase('setup')}
              className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl transition-all text-sm">
              Back to Setup
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function LearnPage() {
  const [activeTab, setActiveTab] = useState<'library' | 'flashcards' | 'quiz' | 'history'>('library')
  const [search, setSearch] = useState('')
  const [selectedFallacy, setSelectedFallacy] = useState<FallacyLibraryItem | null>(null)

  const { data: libraryData } = useQuery({
    queryKey: ['fallacy-library'],
    queryFn: fallacyService.getLibrary,
  })

  const fallacies: FallacyLibraryItem[] = libraryData?.fallacies || []
  const filtered = fallacies.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.description.toLowerCase().includes(search.toLowerCase())
  )

  const TABS = [
    { id: 'library',    label: 'Fallacy Library', icon: BookOpen },
    { id: 'flashcards', label: 'Flashcards',       icon: Star     },
    { id: 'quiz',       label: 'Quiz',             icon: Brain    },
    { id: 'history',    label: 'History',          icon: History  },
  ]

  return (
    <div className="min-h-screen bg-dark relative overflow-hidden">
      <GradientOrbs />
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <SectionReveal className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-indigo-500 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-display font-black text-white">Learning Hub</h1>
          </div>
          <p className="text-slate-400">Master logical fallacies, sharpen your reasoning, and become a better debater.</p>
        </SectionReveal>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 glass-card p-1 rounded-2xl border border-white/10 w-fit">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === id ? 'bg-primary-600 text-white shadow-glow-sm' : 'text-slate-400 hover:text-white'
              }`}>
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Library Tab */}
        {activeTab === 'library' && (
          <div>
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search fallacies..."
                className="w-full max-w-md bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-600 text-sm outline-none focus:border-primary-500/50 transition-all"
              />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((fallacy, i) => (
                <motion.div key={fallacy.type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedFallacy(fallacy)}
                  className="glass-card p-5 rounded-2xl border border-white/10 cursor-pointer card-hover"
                  style={{ borderColor: selectedFallacy?.type === fallacy.type ? `${fallacy.color}50` : undefined }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                      style={{ background: `${fallacy.color}20` }}>
                      {fallacy.icon}
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-sm">{fallacy.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full capitalize"
                        style={{ background: `${fallacy.color}15`, color: fallacy.color }}>
                        {fallacy.category}
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">{fallacy.shortDescription}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Flashcards Tab */}
        {activeTab === 'flashcards' && (
          <div>
            <p className="text-slate-400 text-sm mb-6">Click each card to reveal the definition.</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FLASHCARDS.map((card, i) => (
                <motion.div key={card.front} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <FlashCard card={card} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Quiz Tab */}
        {activeTab === 'quiz' && (
          <div className="max-w-2xl mx-auto">
            <div className="glass-card p-8 rounded-3xl border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary-600/20 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <h2 className="text-white font-bold">Knowledge Quiz</h2>
                  <p className="text-slate-500 text-xs">100+ questions · Randomised every attempt · Tracks your history</p>
                </div>
              </div>
              <QuizSection />
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="max-w-2xl mx-auto">
            <div className="glass-card p-8 rounded-3xl border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center">
                  <History className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-white font-bold">Quiz History</h2>
                  <p className="text-slate-500 text-xs">Your past attempts and performance over time</p>
                </div>
              </div>
              <QuizHistory />
            </div>
          </div>
        )}
      </div>

      {/* Fallacy Detail Modal */}
      <AnimatePresence>
        {selectedFallacy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedFallacy(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg glass-dark rounded-3xl p-8 border shadow-glass"
              style={{ borderColor: `${selectedFallacy.color}40` }}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ background: `${selectedFallacy.color}20` }}>
                    {selectedFallacy.icon}
                  </div>
                  <div>
                    <h2 className="text-white font-black text-xl">{selectedFallacy.name}</h2>
                    <span className="text-xs px-2 py-0.5 rounded-full capitalize"
                      style={{ background: `${selectedFallacy.color}20`, color: selectedFallacy.color }}>
                      {selectedFallacy.category}
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelectedFallacy(null)} className="text-slate-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-slate-300 leading-relaxed mb-6">{selectedFallacy.description}</p>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-error font-semibold mb-2">
                    <AlertTriangle className="w-3 h-3" /> Fallacious Example
                  </div>
                  <p className="text-slate-300 text-sm italic bg-error/10 border border-error/20 rounded-xl p-4">
                    {selectedFallacy.example}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs text-success font-semibold mb-2">
                    <CheckCircle className="w-3 h-3" /> Corrected Version
                  </div>
                  <p className="text-slate-300 text-sm italic bg-success/10 border border-success/20 rounded-xl p-4">
                    {selectedFallacy.correctedExample}
                  </p>
                </div>
                {selectedFallacy.tips && (
                  <div>
                    <div className="flex items-center gap-2 text-xs text-primary-400 font-semibold mb-2">
                      <Zap className="w-3 h-3" /> Tips to Avoid
                    </div>
                    <ul className="space-y-1">
                      {selectedFallacy.tips.map((tip, i) => (
                        <li key={i} className="text-slate-400 text-xs flex items-start gap-2">
                          <span className="text-primary-400 mt-0.5">•</span>{tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
