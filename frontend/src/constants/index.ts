export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

export const TIER_COLORS = {
  Bronze: '#CD7F32',
  Silver: '#C0C0C0',
  Gold: '#FFD700',
  Platinum: '#E5E4E2',
  Diamond: '#B9F2FF',
}

export const TIER_ICONS = {
  Bronze: '🥉',
  Silver: '🥈',
  Gold: '🥇',
  Platinum: '💎',
  Diamond: '💠',
}

export const DIFFICULTY_COLORS = {
  beginner: '#10B981',
  intermediate: '#F59E0B',
  advanced: '#EF4444',
  expert: '#8B5CF6',
}

export const AI_PERSONALITIES = [
  { id: 'logical', name: 'The Logician', description: 'Pure logic and structured arguments', icon: '🧠' },
  { id: 'socratic', name: 'The Socratic', description: 'Questions your every assumption', icon: '🤔' },
  { id: 'aggressive', name: 'The Challenger', description: 'Forcefully challenges weak points', icon: '⚡' },
  { id: 'empathetic', name: 'The Empath', description: 'Understanding but still rigorous', icon: '💙' },
  { id: 'devil_advocate', name: "Devil's Advocate", description: 'Always takes the opposing view', icon: '😈' },
]

export const FALLACY_COLORS: Record<string, string> = {
  ad_hominem: '#EF4444',
  strawman: '#F59E0B',
  slippery_slope: '#8B5CF6',
  appeal_to_emotion: '#EC4899',
  false_dilemma: '#06B6D4',
  bandwagon: '#10B981',
  hasty_generalization: '#F97316',
  appeal_to_authority: '#6366F1',
  circular_reasoning: '#DC2626',
  red_herring: '#7C3AED',
}

export const STATS_COUNTERS = [
  { value: 100000, label: 'Debates Analyzed', suffix: '+', icon: '💬' },
  { value: 94, label: 'AI Detection Accuracy', suffix: '%', icon: '🎯' },
  { value: 20000, label: 'Active Learners', suffix: '+', icon: '🧑‍🎓' },
  { value: 50, label: 'Reasoning Modules', suffix: '+', icon: '📚' },
]

export const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Demo', href: '#demo' },
  { label: 'Fallacies', href: '#fallacies' },
  { label: 'Analytics', href: '#analytics' },
  { label: 'Pricing', href: '#pricing' },
]

export const PRICING_PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Perfect for getting started',
    features: [
      '5 debates per month',
      'Basic fallacy detection',
      'Limited analytics',
      'Community access',
      '10 learning modules',
    ],
    cta: 'Get Started Free',
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19,
    period: 'month',
    description: 'For serious debate practitioners',
    features: [
      'Unlimited debates',
      'Advanced AI fallacy detection',
      'Full analytics dashboard',
      'All AI personalities',
      'Voice debate mode',
      'Priority AI responses',
      'Export debate transcripts',
      'All 50+ learning modules',
    ],
    cta: 'Start Pro Trial',
    highlighted: true,
  },
  {
    id: 'education',
    name: 'Education',
    price: 49,
    period: 'month',
    description: 'For classrooms and institutions',
    features: [
      'Everything in Pro',
      'Up to 30 student accounts',
      'Teacher dashboard',
      'Assignment creation',
      'Progress tracking',
      'Custom debate topics',
      'API access',
      'Dedicated support',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
]
