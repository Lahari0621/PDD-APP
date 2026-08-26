import api from '../api/axios'

export const analyticsService = {
  getUserAnalytics: async () => {
    const res = await api.get('/analytics/user')
    return res.data
  },
}
