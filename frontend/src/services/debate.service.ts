import api from '../api/axios'

export const debateService = {
  startDebate: async (data: {
    topic: string
    topicCategory?: string
    difficulty?: string
    aiPersonality?: string
    userPosition?: string
    debateMode?: 'classic' | 'cross_examination' | 'rapid_fire'
    adaptiveDifficulty?: boolean
  }) => {
    const res = await api.post('/debates/start', data)
    return res.data
  },

  sendMessage: async (debateId: string, content: string) => {
    const res = await api.post('/debates/message', { debateId, content })
    return res.data
  },

  endDebate: async (debateId: string) => {
    const res = await api.post('/debates/end', { debateId })
    return res.data
  },

  getHistory: async (page = 1, limit = 10) => {
    const res = await api.get(`/debates/history?page=${page}&limit=${limit}`)
    return res.data
  },

  getDebate: async (id: string) => {
    const res = await api.get(`/debates/${id}`)
    return res.data
  },

  // Real-time argument strength scoring
  scoreArgument: async (content: string, topic: string) => {
    const res = await api.post('/debates/score-argument', { content, topic })
    return res.data
  },

  // AI-generated debate topic
  generateTopic: async (category: string, difficulty: string) => {
    const res = await api.post('/debates/generate-topic', { category, difficulty })
    return res.data
  },

  // AI vs AI debate
  aiVsAiDebate: async (topic: string) => {
    const res = await api.post('/debates/ai-vs-ai', { topic })
    return res.data
  },

  // Compare original vs rewritten argument (fallacy try-again)
  tryAgain: async (original: string, rewritten: string, fallacyName?: string) => {
    const res = await api.post('/debates/try-again', { original, rewritten, fallacyName })
    return res.data
  },
}
