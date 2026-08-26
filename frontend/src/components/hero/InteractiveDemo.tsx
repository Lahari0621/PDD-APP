import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, AlertTriangle, CheckCircle, Loader2, Brain, ArrowRight } from 'lucide-react'
import { fallacyService } from '../../services/fallacy.service'
import SectionReveal from '../common/SectionReveal'

const EXAMPLE_ARGUMENTS = [
  "You're too inexperienced to understand economics.",
  "Everyone knows vaccines cause autism.",
  "If we allow gay marriage, next people will marry animals.",
  "You're either with us or against us on this issue.",
  "Think of the children! We must ban this immediately!",
]

export default function InteractiveDemo() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const analyze = async (text?: string) => {
    const textToAnalyze = text || input
    if (!textToAnalyze.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const data = await fallacyService.analyze(textToAnalyze)
      setResult(data.analysis)
      if (text) setInput(text)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981'
    if (score >= 60) return '#F59E0B'
    return '#EF4444'
  }

  return (
    <section id="demo" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-950/20 to-transparent" />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionReveal className="text-center mb-16">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-primary-300 border border-primary-500/30 mb-6">
            <Zap className="w-4 h-4" />
            Live AI Analysis
          </div>
          <h2 className="text-4xl sm:text-5xl font-display font-black text-white mb-4">
            Try it <span className="gradient-text">right now</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Type any argument and watch our AI instantly detect logical fallacies, score your reasoning, and provide educational feedback.
          </p>
        </SectionReveal>

        <SectionReveal delay={0.2}>
          <div className="glass-card p-8 rounded-3xl border border-white/10">
            {/* Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                Enter your argument
              </label>
              <div className="relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type an argument to analyze... e.g., 'You're too young to understand this topic.'"
                  className="w-full h-28 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm resize-none outline-none focus:border-primary-500/50 focus:bg-white/8 transition-all"
                  onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) analyze() }}
                />
                <div className="absolute bottom-3 right-3 text-xs text-slate-600">{input.length}/500</div>
              </div>
            </div>

            {/* Example buttons */}
            <div className="mb-6">
              <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider">Try an example:</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_ARGUMENTS.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => analyze(ex)}
                    className="text-xs px-3 py-1.5 glass rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/5 text-left"
                  >
                    "{ex.substring(0, 40)}..."
                  </button>
                ))}
              </div>
            </div>

            {/* Analyze button */}
            <button
              onClick={() => analyze()}
              disabled={loading || !input.trim()}
              className="w-full flex items-center justify-center gap-3 py-4 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-300 text-lg shadow-glow-blue hover:shadow-glow-indigo"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />
                  Analyze Argument
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-error/10 border border-error/30 rounded-xl text-error text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Results */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="mt-8 space-y-6"
                >
                  {/* Score cards */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Confidence Score', value: result.confidenceScore, icon: '🎯' },
                      { label: 'Fallacies Found', value: result.fallacies?.length || 0, icon: '⚠️', isCount: true },
                      { label: 'Logic Quality', value: result.hasFallacy ? 45 : 88, icon: '🧠' },
                    ].map(({ label, value, icon, isCount }) => (
                      <div key={label} className="glass rounded-xl p-4 text-center border border-white/10">
                        <div className="text-2xl mb-1">{icon}</div>
                        <div className="text-2xl font-black mb-1"
                          style={{ color: isCount ? (value > 0 ? '#EF4444' : '#10B981') : getScoreColor(value as number) }}>
                          {isCount ? value : `${value}%`}
                        </div>
                        <div className="text-xs text-slate-500">{label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Fallacy results */}
                  {result.hasFallacy && result.fallacies?.length > 0 ? (
                    <div>
                      <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-warning" />
                        Detected Fallacies
                      </h4>
                      <div className="space-y-3">
                        {result.fallacies.map((f: any, i: number) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-4 rounded-xl border"
                            style={{ background: `${f.color || '#F59E0B'}10`, borderColor: `${f.color || '#F59E0B'}30` }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-sm" style={{ color: f.color || '#F59E0B' }}>
                                {f.name}
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded-full"
                                style={{ background: `${f.color || '#F59E0B'}20`, color: f.color || '#F59E0B' }}>
                                {Math.round((f.confidence || 0.8) * 100)}% confidence
                              </span>
                            </div>
                            <p className="text-slate-400 text-xs">{f.description}</p>
                            {f.highlightedText && (
                              <div className="mt-2 text-xs text-slate-500">
                                Detected in: <span className="text-warning italic">"{f.highlightedText}"</span>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-3 p-4 bg-success/10 border border-success/30 rounded-xl"
                    >
                      <CheckCircle className="w-5 h-5 text-success" />
                      <div>
                        <div className="text-success font-semibold text-sm">No fallacies detected!</div>
                        <div className="text-slate-400 text-xs">Your argument appears logically sound.</div>
                      </div>
                    </motion.div>
                  )}

                  {/* AI Explanation */}
                  {result.aiExplanation && (
                    <div className="p-4 glass rounded-xl border border-primary-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <Brain className="w-4 h-4 text-primary-400" />
                        <span className="text-primary-300 font-semibold text-sm">AI Coach Feedback</span>
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed">{result.aiExplanation}</p>
                    </div>
                  )}

                  {/* Recommendation */}
                  <div className="p-4 glass rounded-xl border border-white/10">
                    <p className="text-slate-300 text-sm">{result.recommendation}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </SectionReveal>
      </div>
    </section>
  )
}
