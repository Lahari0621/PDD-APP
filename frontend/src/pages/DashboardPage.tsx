import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Brain, Zap, TrendingUp, MessageSquare, Trophy, Flame, Target, ArrowRight, Plus, BookOpen, BarChart3, Star, Swords, Shuffle, Play } from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { useAuthStore } from '../store/authStore'
import { analyticsService } from '../services/analytics.service'
import { TIER_COLORS, TIER_ICONS, DIFFICULTY_COLORS } from '../constants'
import SectionReveal from '../components/common/SectionReveal'
import GradientOrbs from '../components/animations/GradientOrbs'

function StatCard({ icon: Icon, label, value, sub, color, delay = 0 }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glass-card p-6 card-hover"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {sub && <span className="text-xs text-success bg-success/10 px-2 py-1 rounded-full">{sub}</span>}
      </div>
      <div className="text-2xl font-black text-white mb-1">{value}</div>
      <div className="text-slate-400 text-sm">{label}</div>
    </motion.div>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: analyticsService.getUserAnalytics,
  })

  const analytics = analyticsData?.analytics
  const overview = analytics?.overview
  const skills = analytics?.skills

  const radarData = skills ? [
    { subject: 'Logic', value: skills.logic },
    { subject: 'Persuasion', value: skills.persuasion },
    { subject: 'Evidence', value: skills.evidence },
    { subject: 'Clarity', value: skills.clarity },
    { subject: 'Rebuttal', value: skills.rebuttal },
    { subject: 'Structure', value: skills.structure },
  ] : []

  const logicHistory = analytics?.logicScoreHistory?.slice(-10).map((h: any, i: number) => ({
    day: `Day ${i + 1}`,
    score: h.score,
  })) || []

  const tierColor = TIER_COLORS[user?.tier as keyof typeof TIER_COLORS] || '#CD7F32'
  const tierIcon = TIER_ICONS[user?.tier as keyof typeof TIER_ICONS] || '🥉'

  const SUGGESTED_TOPICS = [
    { title: 'Social media does more harm than good', category: 'social', difficulty: 'beginner' },
    { title: 'AI will replace most jobs by 2040', category: 'technology', difficulty: 'intermediate' },
    { title: 'Universal Basic Income should be implemented', category: 'economics', difficulty: 'advanced' },
  ]

  return (
    <div className="min-h-screen bg-dark relative overflow-hidden">
      <GradientOrbs />
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <SectionReveal className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-500 flex items-center justify-center text-xl font-black text-white shadow-glow-blue">
                  {user?.username?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-display font-black text-white">
                    Welcome back, <span className="gradient-text">{user?.username}</span>
                  </h1>
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <span style={{ color: tierColor }}>{tierIcon} {user?.tier}</span>
                    <span>·</span>
                    <span>Level {user?.level}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-warning" />{user?.streak} day streak</span>
                  </div>
                </div>
              </div>
            </div>
            <Link to="/debate"
              className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl transition-all shadow-glow-blue hover:shadow-glow-indigo">
              <Plus className="w-4 h-4" />
              New Debate
            </Link>
          </div>
        </SectionReveal>

        {/* XP Progress */}
        <SectionReveal delay={0.1} className="mb-8">
          <div className="glass-card p-5 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-warning" />
                <span className="text-white font-semibold text-sm">Experience Points</span>
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
              <span>{100 - ((user?.xp || 0) % 100)} XP to next level</span>
            </div>
          </div>
        </SectionReveal>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={MessageSquare} label="Total Debates" value={overview?.totalDebates || user?.totalDebates || 0} color="#2563EB" delay={0.1} />
          <StatCard icon={Trophy} label="Win Rate" value={`${overview?.winRate || 0}%`} color="#F59E0B" delay={0.15} />
          <StatCard icon={Target} label="Logic Score" value={`${overview?.logicScore || user?.logicScore || 50}`} color="#10B981" delay={0.2} />
          <StatCard icon={Brain} label="Fallacies Detected" value={overview?.totalFallaciesDetected || 0} color="#8B5CF6" delay={0.25} />
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Radar Chart */}
          <SectionReveal delay={0.2}>
            <div className="glass-card p-6 rounded-2xl border border-white/10 h-full">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary-400" />
                Skill Radar
              </h3>
              {radarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                    <Radar name="Skills" dataKey="value" stroke="#2563EB" fill="#2563EB" fillOpacity={0.2} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-slate-500 text-sm">
                  Complete debates to see your skill radar
                </div>
              )}
            </div>
          </SectionReveal>

          {/* Logic Score History */}
          <SectionReveal delay={0.25}>
            <div className="glass-card p-6 rounded-2xl border border-white/10 h-full">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-success" />
                Logic Score Trend
              </h3>
              {logicHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={logicHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="day" tick={{ fill: '#64748B', fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                    <Line type="monotone" dataKey="score" stroke="#2563EB" strokeWidth={2} dot={{ fill: '#2563EB', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-slate-500 text-sm">
                  Complete debates to see your progress
                </div>
              )}
            </div>
          </SectionReveal>
        </div>

        {/* Bottom Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Debates */}
          <SectionReveal delay={0.3} className="lg:col-span-2">
            <div className="glass-card p-6 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary-400" />
                  Recent Debates
                </h3>
                <Link to="/history" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              {analytics?.recentDebates?.length > 0 ? (
                <div className="space-y-3">
                  {analytics.recentDebates.slice(0, 4).map((debate: any) => (
                    <div key={debate._id} className="flex items-center gap-4 p-3 glass rounded-xl border border-white/5 hover:border-white/10 transition-all">
                      <div className="w-8 h-8 rounded-lg bg-primary-600/20 flex items-center justify-center text-sm">
                        {debate.winner === 'user' ? '🏆' : debate.winner === 'draw' ? '🤝' : '📚'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-medium truncate">{debate.topic}</div>
                        <div className="text-slate-500 text-xs">{new Date(debate.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-white font-bold text-sm">{debate.finalScore || 0}%</div>
                          <div className="text-xs" style={{ color: DIFFICULTY_COLORS[debate.difficulty as keyof typeof DIFFICULTY_COLORS] || '#94A3B8' }}>
                            {debate.difficulty}
                          </div>
                        </div>
                        <Link to={`/replay/${debate._id}`} className="text-slate-500 hover:text-primary-400 transition-colors" title="Replay">
                          <Play className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm mb-4">No debates yet. Start your first one!</p>
                  <Link to="/debate" className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm rounded-lg font-semibold">
                    <Plus className="w-4 h-4" /> Start Debate
                  </Link>
                </div>
              )}
            </div>
          </SectionReveal>

          {/* AI Coaching + Suggestions */}
          <SectionReveal delay={0.35}>
            <div className="space-y-4">
              {/* AI Tip */}
              {analytics?.coachingTip && (
                <div className="glass-card p-5 rounded-2xl border border-primary-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-4 h-4 text-primary-400" />
                    <span className="text-primary-300 font-semibold text-sm">AI Coach Tip</span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{analytics.coachingTip}</p>
                </div>
              )}

              {/* Suggested Topics */}
              <div className="glass-card p-5 rounded-2xl border border-white/10">
                <h3 className="text-white font-bold mb-3 flex items-center gap-2 text-sm">
                  <Star className="w-4 h-4 text-warning" />
                  Suggested Topics
                </h3>
                <div className="space-y-2">
                  {SUGGESTED_TOPICS.map((topic) => (
                    <Link key={topic.title} to={`/debate?topic=${encodeURIComponent(topic.title)}`}
                      className="flex items-center gap-3 p-3 glass rounded-xl border border-white/5 hover:border-primary-500/30 transition-all group">
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-xs font-medium truncate group-hover:text-primary-300 transition-colors">{topic.title}</div>
                        <div className="text-xs mt-0.5" style={{ color: DIFFICULTY_COLORS[topic.difficulty as keyof typeof DIFFICULTY_COLORS] }}>
                          {topic.difficulty}
                        </div>
                      </div>
                      <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-primary-400 transition-colors flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div className="grid grid-cols-2 gap-2">
                <Link to="/learn" className="glass-card p-4 rounded-xl border border-white/10 hover:border-primary-500/30 transition-all text-center group">
                  <BookOpen className="w-5 h-5 text-primary-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <div className="text-white text-xs font-semibold">Learn</div>
                </Link>
                <Link to="/analytics" className="glass-card p-4 rounded-xl border border-white/10 hover:border-primary-500/30 transition-all text-center group">
                  <BarChart3 className="w-5 h-5 text-success mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <div className="text-white text-xs font-semibold">Analytics</div>
                </Link>
                <Link to="/ai-vs-ai" className="glass-card p-4 rounded-xl border border-white/10 hover:border-primary-500/30 transition-all text-center group">
                  <Swords className="w-5 h-5 text-warning mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <div className="text-white text-xs font-semibold">AI vs AI</div>
                </Link>
                <Link to="/topics" className="glass-card p-4 rounded-xl border border-white/10 hover:border-primary-500/30 transition-all text-center group">
                  <Shuffle className="w-5 h-5 text-indigo-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <div className="text-white text-xs font-semibold">Topics</div>
                </Link>
              </div>
            </div>
          </SectionReveal>
        </div>
      </div>
    </div>
  )
}
