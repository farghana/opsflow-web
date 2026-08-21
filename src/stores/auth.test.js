import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import api from '@/api/client'
import { useAuthStore } from './auth'

vi.mock('@/api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('restores the authenticated user', async () => {
    api.get.mockResolvedValueOnce({ data: { id: 1, name: 'Farghana', email: 'farghana@example.com' } })

    const store = useAuthStore()
    await store.fetchUser()

    expect(store.user?.email).toBe('farghana@example.com')
    expect(store.isAuthenticated).toBe(true)
    expect(store.initialized).toBe(true)
  })

  it('performs the Sanctum CSRF handshake before login', async () => {
    api.get
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ data: { id: 1, name: 'Farghana', email: 'farghana@example.com' } })
    api.post.mockResolvedValueOnce({})

    const store = useAuthStore()
    await store.login({ email: 'farghana@example.com', password: 'secret' })

    expect(api.get).toHaveBeenNthCalledWith(1, '/sanctum/csrf-cookie')
    expect(api.post).toHaveBeenCalledWith('/login', {
      email: 'farghana@example.com',
      password: 'secret',
    })
    expect(store.isAuthenticated).toBe(true)
  })

  it('clears the user on logout', async () => {
    api.post.mockResolvedValueOnce({})

    const store = useAuthStore()
    store.user = { id: 1, name: 'Farghana' }

    await store.logout()

    expect(api.post).toHaveBeenCalledWith('/logout')
    expect(store.user).toBeNull()
  })
})
