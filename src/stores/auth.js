import { defineStore } from 'pinia'
import api from '@/api/client'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    initialized: false,
    loading: false,
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.user),
  },

  actions: {
    async fetchUser() {
      try {
        const { data } = await api.get('/api/user')
        this.user = data
      } catch (error) {
        if (error.response?.status === 401) {
          this.user = null
          return
        }

        throw error
      } finally {
        this.initialized = true
      }
    },

    async login(credentials) {
      this.loading = true

      try {
        await api.get('/sanctum/csrf-cookie')
        await api.post('/login', credentials)
        await this.fetchUser()
      } finally {
        this.loading = false
      }
    },

    async logout() {
      this.loading = true

      try {
        await api.post('/logout')
      } finally {
        this.user = null
        this.loading = false
        this.initialized = true
      }
    },
  },
})
