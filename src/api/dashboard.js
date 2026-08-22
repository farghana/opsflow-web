import api from './client'

export const getDashboardSummary = async () => {
  const { data } = await api.get('/api/dashboard/summary')
  return data
}
