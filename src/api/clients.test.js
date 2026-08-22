import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from './client'
import { createClient, deleteClient, getClients, updateClient } from './clients'

vi.mock('./client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('clients API', () => {
  beforeEach(() => vi.clearAllMocks())

  it('passes list filters to the API', async () => {
    const payload = { data: [], meta: { total: 0 } }
    api.get.mockResolvedValueOnce({ data: payload })

    const result = await getClients({ search: 'Acme', page: 2 })

    expect(api.get).toHaveBeenCalledWith('/api/clients', {
      params: { search: 'Acme', page: 2 },
    })
    expect(result).toEqual(payload)
  })

  it('creates, updates, and deletes clients', async () => {
    api.post.mockResolvedValueOnce({ data: { data: { id: 1, name: 'Acme' } } })
    api.put.mockResolvedValueOnce({ data: { data: { id: 1, name: 'Acme Inc.' } } })
    api.delete.mockResolvedValueOnce({})

    await expect(createClient({ name: 'Acme' })).resolves.toEqual({ id: 1, name: 'Acme' })
    await expect(updateClient(1, { name: 'Acme Inc.' })).resolves.toEqual({ id: 1, name: 'Acme Inc.' })
    await deleteClient(1)

    expect(api.post).toHaveBeenCalledWith('/api/clients', { name: 'Acme' })
    expect(api.put).toHaveBeenCalledWith('/api/clients/1', { name: 'Acme Inc.' })
    expect(api.delete).toHaveBeenCalledWith('/api/clients/1')
  })
})
