export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  bio?: string
  xp: number
  level: number
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond'
  streak: number
  longestStreak: number
  plan: 'free' | 'pro' | 'education'
  role: 'user' | 'admin' | 'educator'
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  totalDebates: number
  debatesWon?: number
  logicScore: number
  totalFallaciesDetected?: number
  achievements?: Achievement[]
  preferredTopics?: string[]
}

export interface Debate {
  id: string
  topic: string
  topicCategory: string
  difficulty: string
  aiPersonality: string
  debateMode?: 'classic' | 'cross_examination' | 'rapid_fire'
  adaptiveDifficulty?: boolean
  status: 'active' | 'paused' | 'completed' | 'abandoned'
  totalTurns: number
  finalScore?: number
  winner?: 'user' | 'ai' | 'draw' | null
  summary?: string
  xpEarned?: number
  startedAt: string
  endedAt?: string
  duration?: number
  createdAt: string
}

export interface ArgumentScores {
  logic: number
  relevance: number
  evidence: number
  persuasion: number
  consistency: number
  clarity: number
  overall: number
}

export interface DebateMessage {
  id: string
  sender: 'user' | 'ai'
  content: string
  fallacies?: Fallacy[]
  hasFallacy?: boolean
  confidenceScore?: number
  logicScore?: number
  argumentScores?: ArgumentScores
  timestamp: string
  processingTime?: number
}

export interface DebateSummary {
  topic: string
  duration: number
  totalTurns: number
  winner: 'user' | 'ai' | 'draw'
  finalScore: number
  xpEarned: number
  summary: string
  keyInsights: string[]
  improvementAreas: string[]
  strengths: string[]
  logicScore: number
  persuasionScore: number
  evidenceScore: number
  rebuttalScore: number
  clarityScore: number
  consistencyScore: number
  strongestArgument: string
  weakestArgument: string
  mostCommonFallacy: string | null
  fallacyCount: number
  bestRebuttal: string
  missedOpportunities: string[]
  recommendations: string[]
  nextChallenge: string
  newAchievements?: { id: string; name: string; description: string; icon: string }[]
}

export interface ReplayEntry {
  index: number
  id: string
  sender: 'user' | 'ai'
  content: string
  timestamp: string
  timestampMs: number
  hasFallacy: boolean
  fallacies: Fallacy[]
  logicScore: number | null
  confidenceScore: number | null
  turnNumber: number
}

export interface Fallacy {
  type: string
  name: string
  description: string
  why?: string
  correction?: string
  highlightedText?: string
  startIndex?: number
  endIndex?: number
  confidence: number
  severity?: 'low' | 'medium' | 'high'
  color?: string
  explanation?: string
  detectionMethod?: string
}

export interface FallacyLibraryItem {
  type: string
  name: string
  category: string
  description: string
  shortDescription: string
  example: string
  correctedExample: string
  severity: 'low' | 'medium' | 'high'
  color: string
  icon: string
  tips?: string[]
}

export interface Topic {
  id: string
  title: string
  category: string
  difficulty: string
  icon: string
  tags: string[]
  debateCount: number
  description?: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt: string
}

export interface QuizQuestion {
  _id: string
  question: string
  options: string[]
  hint?: string
  category: string
  module: string
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
}

export interface QuizResultAnswer {
  questionId: string
  userAnswer: string
  correctAnswer: string
  isCorrect: boolean
  explanation: string
  correctText: string
  questionText: string
  category: string
}

export interface QuizResult {
  id: string
  score: number
  totalQuestions: number
  correctAnswers: number
  incorrectAnswers: number
  accuracy: number
  xpEarned: number
  timeSpent: number
  answers: QuizResultAnswer[]
  weakCategories: string[]
  recommendedNext: string | null
}

export type QuizMode = 'random' | 'module' | 'practice' | 'weakness'

export interface Analytics {
  overview: {
    totalDebates: number
    debatesWon: number
    winRate: number
    totalXp: number
    level: number
    tier: string
    streak: number
    longestStreak: number
    logicScore: number
    totalFallaciesDetected: number
  }
  skills: {
    logic: number
    persuasion: number
    evidence: number
    clarity: number
    rebuttal: number
    structure: number
  }
  recentDebates: Debate[]
  categoryPerformance: Array<{ _id: string; count: number; avgScore: number; wins: number }>
  logicScoreHistory: Array<{ date: string; score: number }>
  weeklyActivity: Array<{ date: string; count: number; xp: number }>
  fallacyBreakdown: Array<{ type: string; count: number }>
  coachingTip: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface DebateState {
  currentDebate: Debate | null
  messages: DebateMessage[]
  isTyping: boolean
  isLoading: boolean
  activeFallacy: Fallacy | null
}
