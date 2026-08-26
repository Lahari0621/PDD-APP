import api from '../api/axios'

export interface QuizQuestion {
  _id: string
  question: string
  options: string[]
  hint?: string
  category: string
  module: string
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
}

export interface QuizAnswer {
  questionId: string
  selectedAnswer: number
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

export interface WeakArea {
  category: string
  errorRate: number
  total: number
}

export type QuizMode = 'random' | 'module' | 'practice' | 'weakness'

export const quizService = {
  /**
   * Fetch questions for a new quiz.
   * All answers remain server-side — no correct answer sent to client.
   */
  getQuestions: async (params: {
    difficulty?: string
    category?: string
    module?: string
    count?: number
    mode?: QuizMode
  } = {}) => {
    const query = new URLSearchParams()
    if (params.difficulty) query.set('difficulty', params.difficulty)
    if (params.category)   query.set('category',   params.category)
    if (params.module)     query.set('module',      params.module)
    if (params.count)      query.set('count',       String(params.count))
    if (params.mode)       query.set('mode',        params.mode)

    const res = await api.get(`/quiz/questions?${query.toString()}`)
    return res.data as { success: boolean; questions: QuizQuestion[]; total: number }
  },

  /**
   * Fetch weakness-based questions.
   */
  getWeaknessQuiz: async (params: { count?: number; difficulty?: string } = {}) => {
    const query = new URLSearchParams()
    if (params.count)      query.set('count',      String(params.count))
    if (params.difficulty) query.set('difficulty', params.difficulty)

    const res = await api.get(`/quiz/weakness-based?${query.toString()}`)
    return res.data as {
      success: boolean
      questions: QuizQuestion[]
      total: number
      focusArea: string
      weakAreas: WeakArea[]
    }
  },

  /**
   * Submit quiz answers. Returns score and per-question feedback.
   */
  submitResult: async (payload: {
    answers: QuizAnswer[]
    timeSpent?: number
    quizType?: string
    difficulty?: string
    category?: string
  }) => {
    const res = await api.post('/quiz/result', payload)
    return res.data as { success: boolean; result: QuizResult }
  },

  /**
   * Get user's quiz history.
   */
  getHistory: async () => {
    const res = await api.get('/quiz/history')
    return res.data
  },

  /**
   * Get overall stats (question pool size, weak areas, quizzes taken).
   */
  getStats: async () => {
    const res = await api.get('/quiz/stats')
    return res.data as {
      success: boolean
      stats: {
        totalQuestionsAvailable: number
        quizzesTaken: number
        weakAreas: WeakArea[]
      }
    }
  },

  /**
   * Trigger AI question generation (expands the pool).
   * Rate-limited: max 10 per call. Only call this rarely.
   */
  generateQuestions: async (params: {
    category?: string
    difficulty?: string
    count?: number
  } = {}) => {
    const res = await api.post('/quiz/generate', params)
    return res.data
  },
}
