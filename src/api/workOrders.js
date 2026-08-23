import api from './client'

export const getWorkOrders = async (params = {}) => {
  const { data } = await api.get('/api/work-orders', { params })
  return data
}

export const getWorkOrder = async (id) => {
  const { data } = await api.get(`/api/work-orders/${id}`)
  return data.data
}

export const createWorkOrder = async (payload) => {
  const { data } = await api.post('/api/work-orders', payload)
  return data.data
}

export const updateWorkOrder = async (id, payload) => {
  const { data } = await api.put(`/api/work-orders/${id}`, payload)
  return data.data
}

export const deleteWorkOrder = async (id) => {
  await api.delete(`/api/work-orders/${id}`)
}

export const getTeamMembers = async () => {
  const { data } = await api.get('/api/team-members')
  return data.data ?? data
}

export const parseWorkOrderIntake = async (text) => {
  const { data } = await api.post('/api/work-order-intake/parse', { text })
  return data.data
}
