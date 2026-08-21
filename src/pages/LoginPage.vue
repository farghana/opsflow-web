<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const form = reactive({
  email: '',
  password: '',
})

const errorMessage = ref('')

const submit = async () => {
  errorMessage.value = ''

  try {
    await authStore.login(form)
    await router.push(route.query.redirect || '/')
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Unable to sign in. Check your credentials and try again.'
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
    <Card class="w-full max-w-md border-slate-800 bg-white shadow-2xl">
      <CardHeader class="space-y-3">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">OpsFlow</p>
          <CardTitle class="mt-2 text-2xl">Sign in to your workspace</CardTitle>
        </div>
        <CardDescription>
          Use your OpsFlow account to access work orders, clients, and operations reporting.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form class="space-y-4" @submit.prevent="submit">
          <div class="space-y-2">
            <label for="email" class="text-sm font-medium text-slate-700">Email</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              autocomplete="email"
              required
              class="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <div class="space-y-2">
            <label for="password" class="text-sm font-medium text-slate-700">Password</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              autocomplete="current-password"
              required
              class="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <p v-if="errorMessage" class="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {{ errorMessage }}
          </p>

          <Button class="w-full" type="submit" :disabled="authStore.loading">
            {{ authStore.loading ? 'Signing in…' : 'Sign in' }}
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
