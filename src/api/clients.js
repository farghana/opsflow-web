import api from './client'

export const getClients = async (params = {}) => {
  const { data } = await api.get('/api/clients', { params })
  return data
}

export const createClient = async (payload) => {
  const { data } = await api.post('/api/clients', payload)
  return data.data
}

export const updateClient = async (id, payload) => {
  const { data } = await api.put(`/api/clients/${id}`, payload)
  return data.data
}

export const deleteClient = async (id) => {
  await api.delete(`/api/clients/${id}`)
}
