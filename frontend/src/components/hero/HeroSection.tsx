import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Zap, Play, ArrowRight, AlertTriangle, CheckCircle, Brain } from 'lucide-react'

const DEMO_MESSAGES = [
  {
    sender: 'user',
    text: "You're too inexperienced to understand economics.",
    fallacy: { name: 'Ad Hominem', confidence: 84, color: '#EF4444' },
    delay: 0,
  },
  {
    sender: 'ai',
    text: "That's an ad hominem attack — you're targeting me personally rather than addressing the economic argument. Let's focus on the substance: what specific economic principle do you believe I'm misunderstanding?",
    delay: 2000,
  },
  {
    sender: 'user',
    text: "If we allow any gun control, next they'll ban all weapons and we'll be defenseless.",
    fallacy: { name: 'Slippery Slope', confidence: 91, color: '#8B5CF6' },
    delay: 4500,
  },
  {
    sender: 'ai',
    text: "That's a slippery slope fallacy — you're assuming one policy inevitably leads to extreme outcomes without evidence. Can you provide data showing that moderate gun regulations lead to complete disarmament?",
    delay: 6500,
  },
]

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />
      ))}
    </div>
  )
}

function FallacyBadge({ fallacy }: { fallacy: { name: string; confidence: number; color: string } }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
      className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold"
      style={{ background: `${fallacy.color}20`, border: `1px solid ${fallacy.color}40`, color: fallacy.color }}
    >
      <AlertTriangle className="w-3 h-3" />
      {fallacy.name} detected
      <span className="ml-1 opacity-80">{fallacy.confidence}% confidence</span>
    </motion.div>
  )
}

export default function HeroSection() {
  const [visibleMessages, setVisibleMessages] = useState<number[]>([])
  const [showTyping, setShowTyping] = useState(false)
  const [currentTypingFor, setCurrentTypingFor] = useState(-1)

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    DEMO_MESSAGES.forEach((msg, i) => {
      if (msg.sender === 'ai') {
        // Show typing before AI message
        timers.push(setTimeout(() => {
          setShowTyping(true)
          setCurrentTypingFor(i)
        }, msg.delay - 1200))
      }
      timers.push(setTimeout(() => {
        setShowTyping(false)
        setCurrentTypingFor(-1)
        setVisibleMessages((prev) => [...prev, i])
      }, msg.delay + 800))
    })

    // Reset and loop
    const totalDuration = DEMO_MESSAGES[DEMO_MESSAGES.length - 1].delay + 4000
    timers.push(setTimeout(() => {
      setVisibleMessages([])
      setShowTyping(false)
    }, totalDuration))

    return () => timers.forEach(clearTimeout)
  }, [visibleMessages.length === 0 ? 0 : -1])

  // Restart loop
  useEffect(() => {
    if (visibleMessages.length === 0) {
      const timer = setTimeout(() => {
        DEMO_MESSAGES.forEach((msg, i) => {
          if (msg.sender === 'ai') {
            setTimeout(() => { setShowTyping(true); setCurrentTypingFor(i) }, msg.delay - 1200)
          }
          setTimeout(() => {
            setShowTyping(false)
            setCurrentTypingFor(-1)
            setVisibleMessages((prev) => [...prev, i])
          }, msg.delay + 800)
        })
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [visibleMessages])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid opacity-40" />

      {/* Animated beam lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px w-full"
            style={{ top: `${25 + i * 25}%`, background: 'linear-gradient(90deg, transparent, rgba(37,99,235,0.3), transparent)' }}
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'linear', delay: i * 2 }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm font-medium text-primary-300 border border-primary-500/30 mb-8"
            >
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <Brain className="w-4 h-4" />
              Powered by Gemini AI + Hugging Face
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-display font-black leading-[1.05] tracking-tight mb-6"
            >
              <span className="text-white">Think</span>{' '}
              <span className="gradient-text">Sharper.</span>
              <br />
              <span className="text-white">Argue</span>{' '}
              <span className="gradient-text">Better.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg sm:text-xl text-slate-400 leading-relaxed mb-10 max-w-lg"
            >
              Practice real-time debates with AI while detecting logical fallacies instantly.
              Train your critical thinking like athletes train their bodies.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-wrap gap-4 mb-12"
            >
              <Link to="/register"
                className="group flex items-center gap-3 px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-2xl transition-all duration-300 text-lg shadow-glow-blue hover:shadow-glow-indigo"
              >
                <Zap className="w-5 h-5 group-hover:animate-pulse" />
                Start Debating
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#demo"
                className="group flex items-center gap-3 px-8 py-4 glass hover:bg-white/10 text-white font-bold rounded-2xl transition-all duration-300 text-lg border border-white/10"
              >
                <Play className="w-5 h-5 text-primary-400" />
                Watch Demo
              </a>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-wrap items-center gap-6"
            >
              {[
                { icon: CheckCircle, text: '100K+ debates analyzed', color: 'text-success' },
                { icon: CheckCircle, text: '94% detection accuracy', color: 'text-success' },
                { icon: CheckCircle, text: 'Free to start', color: 'text-success' },
              ].map(({ icon: Icon, text, color }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-slate-400">
                  <Icon className={`w-4 h-4 ${color}`} />
                  {text}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Live Demo Chat */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="relative"
          >
            {/* Glow behind card */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-indigo-500/20 rounded-3xl blur-3xl" />

            {/* Chat window */}
            <div className="relative glass-card p-6 rounded-3xl border border-white/10 shadow-glass">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-indigo-500 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">Aria — AI Debate Coach</div>
                    <div className="flex items-center gap-1.5 text-xs text-success">
                      <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                      Live debate session
                    </div>
                  </div>
                </div>
                <div className="glass px-3 py-1 rounded-full text-xs text-slate-400 border border-white/10">
                  Topic: Economics
                </div>
              </div>

              {/* Messages */}
              <div className="space-y-4 min-h-[280px]">
                <AnimatePresence>
                  {DEMO_MESSAGES.map((msg, i) => (
                    visibleMessages.includes(i) && (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 15, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[85%] ${msg.sender === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                          {msg.sender === 'ai' && (
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary-600 to-indigo-500 flex items-center justify-center">
                                <Brain className="w-3 h-3 text-white" />
                              </div>
                              <span className="text-xs text-slate-500">Aria</span>
                            </div>
                          )}
                          <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                            msg.sender === 'user'
                              ? 'bg-primary-600/30 text-white border border-primary-500/30'
                              : 'glass text-slate-200 border border-white/10'
                          } ${msg.fallacy ? 'border-b-2' : ''}`}
                            style={msg.fallacy ? { borderBottomColor: msg.fallacy.color } : {}}
                          >
                            {msg.fallacy ? (
                              <span>
                                <span className="fallacy-highlight">{msg.text}</span>
                              </span>
                            ) : msg.text}
                          </div>
                          {msg.fallacy && <FallacyBadge fallacy={msg.fallacy} />}
                        </div>
                      </motion.div>
                    )
                  ))}
                </AnimatePresence>

                {/* Typing indicator */}
                <AnimatePresence>
                  {showTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="flex justify-start"
                    >
                      <div className="glass rounded-2xl border border-white/10">
                        <TypingIndicator />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Input bar */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-3 glass rounded-xl px-4 py-3 border border-white/10">
                  <input
                    type="text"
                    placeholder="Type your argument..."
                    className="flex-1 bg-transparent text-sm text-slate-300 placeholder-slate-600 outline-none"
                    readOnly
                  />
                  <button className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Floating stats */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-4 -right-4 glass px-4 py-2 rounded-xl border border-white/10 shadow-glass"
            >
              <div className="text-xs text-slate-400">Logic Score</div>
              <div className="text-xl font-bold gradient-text">84%</div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -bottom-4 -left-4 glass px-4 py-2 rounded-xl border border-white/10 shadow-glass"
            >
              <div className="text-xs text-slate-400">Fallacies Detected</div>
              <div className="text-xl font-bold text-warning">2 found</div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600"
      >
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-slate-600 to-transparent" />
      </motion.div>
    </section>
  )
}
