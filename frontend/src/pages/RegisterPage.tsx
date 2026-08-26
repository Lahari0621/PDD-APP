import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brain, Mail, Lock, User, Eye, EyeOff, Zap, ArrowRight, Loader2, Check } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { authService } from '../services/auth.service'
import toast from 'react-hot-toast'
import GradientOrbs from '../components/animations/GradientOrbs'

const DIFFICULTY_OPTIONS = [
  { value: 'beginner', label: 'Beginner', desc: 'New to debate', color: '#10B981' },
  { value: 'intermediate', label: 'Intermediate', desc: 'Some experience', color: '#F59E0B' },
  { value: 'advanced', label: 'Advanced', desc: 'Experienced debater', color: '#EF4444' },
  { value: 'expert', label: 'Expert', desc: 'Professional level', color: '#8B5CF6' },
]

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', difficultyLevel: 'beginner' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const passwordStrength = (pwd: string) => {
    let score = 0
    if (pwd.length >= 8) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    return score
  }

  const strength = passwordStrength(form.password)
  const strengthColors = ['#EF4444', '#F59E0B', '#F59E0B', '#10B981', '#10B981']
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters')
    setLoading(true)
    try {
      const data = await authService.register(form)
      login(data.user, data.token)
      toast.success('Welcome to AI Debate Partner!')
      navigate('/dashboard')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center relative overflow-hidden px-4 py-12">
      <GradientOrbs />
      <div className="absolute inset-0 bg-grid opacity-20" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-500 flex items-center justify-center shadow-glow-blue">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-2xl text-white">AI Debate Partner</span>
          </Link>
          <h1 className="text-3xl font-display font-black text-white mb-2">Create your account</h1>
          <p className="text-slate-400">Start your critical thinking journey today</p>
        </div>

        <div className="glass-card p-8 rounded-3xl border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="debatemaster" minLength={3} maxLength={30}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-600 text-sm outline-none focus:border-primary-500/50 transition-all"
                  required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-600 text-sm outline-none focus:border-primary-500/50 transition-all"
                  required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type={showPassword ? 'text' : 'password'} value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min. 8 characters"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-12 py-3 text-white placeholder-slate-600 text-sm outline-none focus:border-primary-500/50 transition-all"
                  required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{ background: i <= strength ? strengthColors[strength] : 'rgba(255,255,255,0.1)' }} />
                    ))}
                  </div>
                  <span className="text-xs" style={{ color: strengthColors[strength] }}>{strengthLabels[strength]}</span>
                </div>
              )}
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Your debate level</label>
              <div className="grid grid-cols-2 gap-2">
                {DIFFICULTY_OPTIONS.map((opt) => (
                  <button key={opt.value} type="button"
                    onClick={() => setForm({ ...form, difficultyLevel: opt.value })}
                    className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                      form.difficultyLevel === opt.value
                        ? 'border-primary-500/50 bg-primary-600/20'
                        : 'border-white/10 bg-white/5 hover:bg-white/8'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white text-sm font-semibold">{opt.label}</span>
                      {form.difficultyLevel === opt.value && <Check className="w-3 h-3 text-primary-400" />}
                    </div>
                    <span className="text-slate-500 text-xs">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-4 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all duration-300 shadow-glow-blue hover:shadow-glow-indigo">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Zap className="w-5 h-5" />Create Account<ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>

          <p className="mt-6 text-center text-slate-400 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">Sign in</Link>
          </p>
          <p className="mt-3 text-center text-slate-600 text-xs">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
