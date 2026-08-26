import api from '../api/axios'

export const authService = {
  register: async (data: { username: string; email: string; password: string; difficultyLevel?: string }) => {
    const res = await api.post('/auth/register', data)
    return res.data
  },

  login: async (data: { email: string; password: string }) => {
    const res = await api.post('/auth/login', data)
    return res.data
  },

  logout: async () => {
    const res = await api.post('/auth/logout')
    return res.data
  },

  getMe: async () => {
    const res = await api.get('/auth/me')
    return res.data
  },

  updateProfile: async (data: Partial<{ username: string; bio: string; difficultyLevel: string; preferredTopics: string[] }>) => {
    const res = await api.put('/auth/profile', data)
    return res.data
  },

  forgotPassword: async (email: string) => {
    const res = await api.post('/auth/forgot-password', { email })
    return res.data
  },

  resetPassword: async (token: string, password: string) => {
    const res = await api.post('/auth/reset-password', { token, password })
    return res.data
  },
}
