import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Cell, PieChart, Pie, Legend,
} from 'recharts'
import { BarChart3, TrendingUp, Target, Brain, Trophy, Flame, Zap, Play, BookOpen, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { analyticsService } from '../services/analytics.service'
import { useAuthStore } from '../store/authStore'
import { TIER_COLORS, TIER_ICONS } from '../constants'
import GradientOrbs from '../components/animations/GradientOrbs'
import SectionReveal from '../components/common/SectionReveal'

const FALLACY_COLOR_MAP: Record<string, string> = {
  ad_hominem: '#EF4444', strawman: '#F59E0B', slippery_slope: '#8B5CF6',
  appeal_to_emotion: '#EC4899', false_dilemma: '#06B6D4', bandwagon: '#10B981',
  hasty_generalization: '#F97316', appeal_to_authority: '#6366F1',
  circular_reasoning: '#DC2626', red_herring: '#7C3AED',
}

const CUSTOM_TOOLTIP = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-dark px-3 py-2 rounded-xl border border-white/10 text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const { user } = useAuthStore()
  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn:  analyticsService.getUserAnalytics,
    staleTime: 30000,
  })

  const analytics  = data?.analytics
  const overview   = analytics?.overview
  const skills     = analytics?.skills
  const tierColor  = TIER_COLORS[user?.tier as keyof typeof TIER_COLORS] || '#CD7F32'
  const tierIcon   = TIER_ICONS[user?.tier  as keyof typeof TIER_ICONS]  || '🥉'

  // ── Chart data ──────────────────────────────────────────────
  const radarData = skills ? [
    { subject: 'Logic',      value: skills.logic,      fullMark: 100 },
    { subject: 'Persuasion', value: skills.persuasion, fullMark: 100 },
    { subject: 'Evidence',   value: skills.evidence,   fullMark: 100 },
    { subject: 'Clarity',    value: skills.clarity,    fullMark: 100 },
    { subject: 'Rebuttal',   value: skills.rebuttal,   fullMark: 100 },
    { subject: 'Structure',  value: skills.structure,  fullMark: 100 },
  ] : []

  const logicHistory = (analytics?.logicScoreHistory || [])
    .slice(-15)
    .map((h: any, i: number) => ({ day: `D${i + 1}`, score: h.score }))

  const confidenceHistory = (analytics?.confidenceScoreHistory || [])
    .slice(-15)
    .map((h: any, i: number) => ({ day: `D${i + 1}`, score: h.score }))

  // Combined logic + confidence trend
  const combinedTrend = logicHistory.map((lh: any, i: number) => ({
    day: lh.day,
    logic: lh.score,
    overall: confidenceHistory[i]?.score || lh.score,
  }))

  const fallacyData = (analytics?.fallacyBreakdown || [])
    .map((f: any) => ({
      name:  f.type.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
      count: f.count,
      color: FALLACY_COLOR_MAP[f.type] || '#6366F1',
    }))
    .sort((a: any, b: any) => b.count - a.count)

  // Win / Loss / Draw pie
  const won   = overview?.debatesWon || 0
  const total = overview?.totalDebates || 0
  const lost  = Math.max(0, total - won - Math.round(total * 0.15))
  const drawn = Math.max(0, total - won - lost)
  const wlPie = total > 0 ? [
    { name: 'Won',  value: won,   fill: '#10B981' },
    { name: 'Draw', value: drawn, fill: '#F59E0B' },
    { name: 'Lost', value: lost,  fill: '#EF4444' },
  ] : []

  // Category performance bar
  const catData = (analytics?.categoryPerformance || []).map((c: any) => ({
    name:     c._id?.replace(/_/g, ' ') || 'Other',
    debates:  c.count,
    avgScore: Math.round(c.avgScore || 0),
  }))

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark relative overflow-hidden">
      <GradientOrbs />
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">

        <SectionReveal className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-indigo-500 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-display font-black text-white">Analytics</h1>
          </div>
          <p className="text-slate-400">Track your critical thinking growth and debate performance.</p>
        </SectionReveal>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Trophy,  label: 'Win Rate',   value: `${overview?.winRate || 0}%`,                       color: '#F59E0B', sub: `${overview?.debatesWon || 0}W / ${overview?.totalDebates || 0}T` },
            { icon: Target,  label: 'Logic Score', value: `${overview?.logicScore || 50}`,                    color: '#10B981', sub: 'Running avg' },
            { icon: Flame,   label: 'Streak',      value: `${overview?.streak || user?.streak || 0}d`,        color: '#EF4444', sub: `Best: ${overview?.longestStreak || 0}d` },
            { icon: Zap,     label: 'Total XP',    value: (overview?.totalXp || user?.xp || 0).toLocaleString(), color: '#F59E0B', sub: `Level ${user?.level}` },
          ].map(({ icon: Icon, label, value, color, sub }, i) => (
            <motion.div key={label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-5 card-hover"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <span className="text-xs text-slate-500">{sub}</span>
              </div>
              <div className="text-2xl font-black text-white mb-1">{value}</div>
              <div className="text-slate-400 text-xs">{label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tier Badge */}
        <SectionReveal delay={0.15} className="mb-8">
          <div className="glass-card p-5 rounded-2xl border border-white/10 flex items-center gap-6">
            <div className="text-5xl">{tierIcon}</div>
            <div className="flex-1">
              <div className="text-white font-black text-xl mb-1" style={{ color: tierColor }}>{user?.tier} Tier</div>
              <p className="text-slate-400 text-sm mb-2">Keep debating to advance to the next tier.</p>
              <div className="score-bar">
                <div className="score-fill" style={{ width: `${Math.min(100, ((user?.xp || 0) % 500) / 5)}%`, background: `linear-gradient(90deg, ${tierColor}80, ${tierColor})` }} />
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-bold">{(user?.xp || 0).toLocaleString()} XP</div>
              <div className="text-slate-500 text-xs">Total earned</div>
              {analytics?.quizStats && (
                <div className="mt-2 text-slate-400 text-xs">
                  Quizzes: <span className="text-primary-400 font-semibold">{analytics.quizStats.quizCount}</span>
                  {analytics.quizStats.quizAvgScore > 0 && ` · Avg ${analytics.quizStats.quizAvgScore}%`}
                </div>
              )}
            </div>
          </div>
        </SectionReveal>

        {/* Row 1: Radar + Score Trend */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">

          {/* Skill Radar */}
          <SectionReveal delay={0.2}>
            <div className="glass-card p-6 rounded-2xl border border-white/10 h-full">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary-400" /> Skill Assessment
              </h3>
              {radarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.08)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                    <Radar name="Skills" dataKey="value" stroke="#2563EB" fill="#2563EB" fillOpacity={0.25} strokeWidth={2} dot={{ fill: '#2563EB', r: 4 }} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[280px] flex flex-col items-center justify-center text-slate-500 gap-3">
                  <Brain className="w-10 h-10 opacity-30" />
                  <p className="text-sm">Complete debates to see your skills</p>
                  <Link to="/debate" className="text-xs text-primary-400 flex items-center gap-1 hover:text-primary-300 transition-colors">
                    Start a debate <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          </SectionReveal>

          {/* Score Trend (Logic + Overall) */}
          <SectionReveal delay={0.25}>
            <div className="glass-card p-6 rounded-2xl border border-white/10 h-full">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-success" /> Score Trends
              </h3>
              {combinedTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={combinedTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="day" tick={{ fill: '#64748B', fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 11 }} />
                    <Tooltip content={<CUSTOM_TOOLTIP />} />
                    <Legend wrapperStyle={{ fontSize: '11px', color: '#94A3B8' }} />
                    <Line type="monotone" dataKey="logic"   name="Logic"   stroke="#2563EB" strokeWidth={2.5} dot={{ fill: '#2563EB', r: 3 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="overall" name="Overall" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981', r: 3 }} strokeDasharray="4 2" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-slate-500 text-sm">
                  Complete debates to see your trend
                </div>
              )}
            </div>
          </SectionReveal>
        </div>

        {/* Row 2: Win/Loss Pie + Category Performance */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">

          {/* Win / Draw / Loss Pie */}
          <SectionReveal delay={0.3}>
            <div className="glass-card p-6 rounded-2xl border border-white/10">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-warning" /> Win / Draw / Loss
              </h3>
              {wlPie.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={wlPie} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" label={({ name, percent }: { name: string; percent?: number }) => `${name} ${Math.round((percent ?? 0) * 100)}%`} labelLine={false}>
                      {wlPie.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-slate-500 text-sm">No debate results yet</div>
              )}
            </div>
          </SectionReveal>

          {/* Category Performance */}
          <SectionReveal delay={0.35}>
            <div className="glass-card p-6 rounded-2xl border border-white/10">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-400" /> Category Performance
              </h3>
              {catData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={catData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" tick={{ fill: '#94A3B8', fontSize: 10 }} width={90} />
                    <Tooltip content={<CUSTOM_TOOLTIP />} />
                    <Bar dataKey="avgScore" name="Avg Score" radius={[0, 4, 4, 0]} fill="#2563EB" fillOpacity={0.8} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-slate-500 text-sm">No category data yet</div>
              )}
            </div>
          </SectionReveal>
        </div>

        {/* Row 3: Fallacy Breakdown */}
        {fallacyData.length > 0 && (
          <SectionReveal delay={0.4} className="mb-6">
            <div className="glass-card p-6 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <Target className="w-4 h-4 text-warning" /> Fallacy Breakdown
                </h3>
                {analytics?.mostCommonFallacy && (
                  <div className="text-xs text-slate-400">
                    Most common: <span className="text-warning font-semibold capitalize">
                      {analytics.mostCommonFallacy.type?.replace(/_/g, ' ')}
                    </span>
                  </div>
                )}
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={fallacyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 9 }} interval={0} angle={-15} textAnchor="end" height={40} />
                  <YAxis tick={{ fill: '#64748B', fontSize: 11 }} />
                  <Tooltip content={<CUSTOM_TOOLTIP />} />
                  <Bar dataKey="count" name="Count" radius={[4, 4, 0, 0]}>
                    {fallacyData.map((entry: any, i: number) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Fallacy improvement tip */}
              {analytics?.mostCommonFallacy && (
                <div className="mt-4 p-3 rounded-xl border border-primary-500/20 bg-primary-600/5 flex items-start gap-3">
                  <BookOpen className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-300 text-xs">
                      You frequently use <span className="text-warning font-semibold capitalize">{analytics.mostCommonFallacy.type?.replace(/_/g, ' ')}</span>.
                      Practising the relevant quiz module can help reduce this.
                    </p>
                    <Link to="/learn" className="text-xs text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1 mt-1">
                      Go to Learning Hub <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </SectionReveal>
        )}

        {/* AI Coaching tip */}
        {analytics?.coachingTip && (
          <SectionReveal delay={0.42} className="mb-6">
            <div className="glass-card p-5 rounded-2xl border border-primary-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-primary-400" />
                <span className="text-primary-300 font-semibold text-sm">Aria's Coaching Tip</span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">{analytics.coachingTip}</p>
            </div>
          </SectionReveal>
        )}

        {/* Recent Debates with replay */}
        {analytics?.recentDebates?.length > 0 && (
          <SectionReveal delay={0.45}>
            <div className="glass-card p-6 rounded-2xl border border-white/10">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                Recent Debates
              </h3>
              <div className="space-y-2">
                {analytics.recentDebates.map((debate: any) => (
                  <div key={debate._id} className="flex items-center gap-4 p-3 glass rounded-xl border border-white/5 hover:border-white/10 transition-all">
                    <div className="text-lg">{debate.winner === 'user' ? '🏆' : debate.winner === 'draw' ? '🤝' : '📚'}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate">{debate.topic}</div>
                      <div className="text-slate-500 text-xs">{new Date(debate.createdAt).toLocaleDateString()} · {debate.totalTurns} turns</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-white font-bold">{debate.finalScore || 0}%</div>
                        <div className="text-xs text-success">+{debate.xpEarned || 0} XP</div>
                      </div>
                      <Link to={`/replay/${debate._id}`}
                        className="w-7 h-7 rounded-lg glass border border-white/10 flex items-center justify-center text-slate-500 hover:text-primary-400 hover:border-primary-500/30 transition-all"
                        title="Replay">
                        <Play className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionReveal>
        )}
      </div>
    </div>
  )
}
