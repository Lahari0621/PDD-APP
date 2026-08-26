import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { User, Mail, Edit3, Save, X, Trophy, Flame, Zap, MessageSquare, Target, Star, Play, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authService } from '../services/auth.service'
import { analyticsService } from '../services/analytics.service'
import { TIER_COLORS, TIER_ICONS } from '../constants'
import toast from 'react-hot-toast'
import GradientOrbs from '../components/animations/GradientOrbs'
import SectionReveal from '../components/common/SectionReveal'

// All possible achievements — unlocked state comes from user.achievements[]
const ALL_ACHIEVEMENTS = [
  { id: 'first_debate',     name: 'First Debate',     description: 'Completed your first debate',    icon: '🎯' },
  { id: 'ten_debates',      name: '10 Debates',        description: 'Completed 10 debates',           icon: '💪' },
  { id: 'debate_champion',  name: 'Debate Champion',   description: 'Won 10 debates',                 icon: '🏆' },
  { id: 'fallacy_hunter',   name: 'Fallacy Hunter',    description: 'Detected 10+ fallacies',         icon: '🔍' },
  { id: 'logic_master',     name: 'Logic Master',      description: 'Achieved 90%+ logic score',      icon: '🧠' },
  { id: 'streak_7',         name: '7-Day Streak',      description: 'Debated 7 days in a row',        icon: '🔥' },
  { id: 'streak_30',        name: '30-Day Streak',     description: 'Debated 30 days in a row',       icon: '🔥🔥' },
  { id: 'evidence_master',  name: 'Evidence Master',   description: 'Achieved 80%+ evidence score',   icon: '📊' },
  { id: 'strong_rebuttal',  name: 'Strong Rebuttal',   description: 'Achieved 90%+ rebuttal score',   icon: '⚔️' },
]

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [form, setForm]       = useState({ username: user?.username || '', bio: user?.bio || '' })
  const [saving, setSaving]   = useState(false)

  const { data: analyticsData } = useQuery({
    queryKey: ['analytics'],
    queryFn:  analyticsService.getUserAnalytics,
    staleTime: 60000,
  })

  const { data: historyData } = useQuery({
    queryKey: ['debate-history'],
    queryFn:  () => import('../services/debate.service').then(m => m.debateService.getHistory(1, 5)),
  })

  const analytics  = analyticsData?.analytics
  const recentDebates = historyData?.debates || []

  const tierColor = TIER_COLORS[user?.tier as keyof typeof TIER_COLORS] || '#CD7F32'
  const tierIcon  = TIER_ICONS[user?.tier  as keyof typeof TIER_ICONS]  || '🥉'

  // Merge all achievements with unlocked state from user
  const unlockedIds = new Set((user?.achievements || []).map((a: any) => a.id))
  const achievements = ALL_ACHIEVEMENTS.map(a => ({
    ...a,
    unlocked:   unlockedIds.has(a.id),
    unlockedAt: (user?.achievements || []).find((ua: any) => ua.id === a.id)?.unlockedAt,
  }))
  const unlockedCount = achievements.filter(a => a.unlocked).length

  const handleSave = async () => {
    setSaving(true)
    try {
      const data = await authService.updateProfile(form)
      updateUser(data.user)
      setEditing(false)
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark relative overflow-hidden">
      <GradientOrbs />
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">

        {/* Profile Header */}
        <SectionReveal className="mb-6">
          <div className="glass-card p-8 rounded-3xl border border-white/10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-600 to-indigo-500 flex items-center justify-center text-4xl font-black text-white shadow-glow-blue">
                  {user?.username?.[0]?.toUpperCase()}
                </div>
                <div className="absolute -bottom-2 -right-2 text-2xl">{tierIcon}</div>
              </div>

              <div className="flex-1">
                {editing ? (
                  <div className="space-y-3">
                    <input
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-lg font-bold outline-none focus:border-primary-500/50 w-full max-w-xs"
                    />
                    <textarea
                      value={form.bio}
                      onChange={(e) => setForm({ ...form, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm outline-none focus:border-primary-500/50 w-full resize-none h-16"
                    />
                    <div className="flex gap-2">
                      <button onClick={handleSave} disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold rounded-lg transition-all">
                        <Save className="w-3 h-3" /> Save
                      </button>
                      <button onClick={() => setEditing(false)}
                        className="flex items-center gap-2 px-4 py-2 glass text-slate-300 text-sm rounded-lg border border-white/10">
                        <X className="w-3 h-3" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-1">
                      <h1 className="text-2xl font-display font-black text-white">{user?.username}</h1>
                      <button onClick={() => setEditing(true)} className="text-slate-500 hover:text-white transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                      <Mail className="w-3 h-3" />
                      {user?.email}
                    </div>
                    <p className="text-slate-400 text-sm">{user?.bio || 'No bio yet — click the edit icon to add one.'}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-sm font-semibold" style={{ color: tierColor }}>{tierIcon} {user?.tier}</span>
                      <span className="text-slate-500 text-sm">Level {user?.level}</span>
                      <span className="text-slate-500 text-sm capitalize">{user?.plan} plan</span>
                      <span className="text-slate-500 text-sm">{unlockedCount}/{achievements.length} achievements</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </SectionReveal>

        {/* Stats */}
        <SectionReveal delay={0.1} className="mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: MessageSquare, label: 'Debates',    value: user?.totalDebates || 0,            color: '#2563EB' },
              { icon: Trophy,        label: 'Wins',        value: user?.debatesWon || 0,              color: '#F59E0B' },
              { icon: Target,        label: 'Logic Score', value: `${user?.logicScore || 50}`,        color: '#10B981' },
              { icon: Flame,         label: 'Streak',      value: `${user?.streak || 0}d`,            color: '#EF4444' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="glass-card p-5 text-center card-hover">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-2"
                  style={{ background: `${color}20` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div className="text-xl font-black text-white">{value}</div>
                <div className="text-slate-500 text-xs">{label}</div>
              </div>
            ))}
          </div>
        </SectionReveal>

        {/* Skill breakdown from analytics */}
        {analytics?.skills && (
          <SectionReveal delay={0.15} className="mb-6">
            <div className="glass-card p-6 rounded-2xl border border-white/10">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm">
                <Target className="w-4 h-4 text-primary-400" /> Debate Skills
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Logic',       value: analytics.skills.logic,      color: '#2563EB' },
                  { label: 'Persuasion',  value: analytics.skills.persuasion, color: '#8B5CF6' },
                  { label: 'Evidence',    value: analytics.skills.evidence,   color: '#10B981' },
                  { label: 'Clarity',     value: analytics.skills.clarity,    color: '#06B6D4' },
                  { label: 'Rebuttal',    value: analytics.skills.rebuttal,   color: '#F59E0B' },
                  { label: 'Structure',   value: analytics.skills.structure,  color: '#EC4899' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="glass rounded-xl p-3 border border-white/10">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-slate-400 text-xs">{label}</span>
                      <span className="text-xs font-bold" style={{ color }}>{value}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ duration: 0.8 }}
                        className="h-full rounded-full"
                        style={{ background: color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionReveal>
        )}

        {/* XP Progress */}
        <SectionReveal delay={0.18} className="mb-6">
          <div className="glass-card p-6 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-warning" />
                <span className="text-white font-semibold">Level {user?.level} Progress</span>
              </div>
              <span className="text-warning font-bold">{user?.xp?.toLocaleString()} XP</span>
            </div>
            <div className="score-bar">
              <motion.div
                className="score-fill"
                initial={{ width: 0 }}
                animate={{ width: `${((user?.xp || 0) % 100)}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Level {user?.level}</span>
              <span>{100 - ((user?.xp || 0) % 100)} XP to Level {(user?.level || 1) + 1}</span>
            </div>
          </div>
        </SectionReveal>

        {/* Recent Debates */}
        {recentDebates.length > 0 && (
          <SectionReveal delay={0.22} className="mb-6">
            <div className="glass-card p-6 rounded-2xl border border-white/10">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm">
                <MessageSquare className="w-4 h-4 text-primary-400" /> Recent Debates
              </h3>
              <div className="space-y-2">
                {recentDebates.map((debate: any) => (
                  <div key={debate._id} className="flex items-center gap-3 p-3 glass rounded-xl border border-white/5 hover:border-white/10 transition-all">
                    <div className="text-lg">{debate.winner === 'user' ? '🏆' : debate.winner === 'draw' ? '🤝' : '📚'}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-xs font-medium truncate">{debate.topic}</div>
                      <div className="text-slate-500 text-xs">{new Date(debate.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-white font-bold text-sm">{debate.finalScore || 0}%</div>
                        <div className="text-xs text-warning">+{debate.xpEarned || 0} XP</div>
                      </div>
                      <Link to={`/replay/${debate._id}`} className="text-slate-500 hover:text-primary-400 transition-colors" title="Replay">
                        <Play className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/analytics" className="flex items-center justify-center gap-1 mt-3 text-xs text-primary-400 hover:text-primary-300 transition-colors">
                View full analytics <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </SectionReveal>
        )}

        {/* Achievements */}
        <SectionReveal delay={0.25}>
          <div className="glass-card p-6 rounded-2xl border border-white/10">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-warning" />
              Achievements
              <span className="text-slate-500 text-sm font-normal ml-1">({unlockedCount}/{achievements.length})</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {achievements.map((achievement, i) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    achievement.unlocked
                      ? 'border-warning/30 bg-warning/5'
                      : 'border-white/5 opacity-40 grayscale'
                  }`}
                >
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <div className="text-white text-xs font-bold mb-1">{achievement.name}</div>
                  <div className="text-slate-500 text-xs">{achievement.description}</div>
                  {achievement.unlocked && (
                    <div className="mt-2 text-xs text-warning font-semibold">
                      ✓ Unlocked
                      {achievement.unlockedAt && (
                        <div className="text-slate-500 font-normal">
                          {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </SectionReveal>
      </div>
    </div>
  )
}
