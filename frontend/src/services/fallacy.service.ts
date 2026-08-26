import api from '../api/axios'

export const fallacyService = {
  analyze: async (text: string) => {
    const res = await api.post('/fallacies/analyze', { text })
    return res.data
  },

  getLibrary: async () => {
    const res = await api.get('/fallacies/library')
    return res.data
  },
}
