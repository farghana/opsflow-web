<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'

const navigation = [
  { label: 'Dashboard', to: '/' },
  { label: 'Clients', to: '#' },
  { label: 'Work Orders', to: '#' },
  { label: 'Reports', to: '#' },
]

const authStore = useAuthStore()
const router = useRouter()

const initials = computed(() => {
  const name = authStore.user?.name || 'OpsFlow User'
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
})

const handleLogout = async () => {
  await authStore.logout()
  await router.push({ name: 'login' })
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <div class="flex min-h-screen">
      <aside class="hidden w-64 border-r border-slate-200 bg-slate-950 px-4 py-6 text-white lg:block">
        <div class="px-3">
          <p class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">OpsFlow</p>
          <h2 class="mt-2 text-lg font-semibold">Operations Console</h2>
        </div>

        <nav class="mt-8 space-y-1">
          <template v-for="item in navigation" :key="item.label">
            <RouterLink
              v-if="item.to !== '#'"
              :to="item.to"
              class="block rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white"
            >
              {{ item.label }}
            </RouterLink>
            <span
              v-else
              class="block cursor-not-allowed rounded-lg px-3 py-2 text-sm font-medium text-slate-400"
            >
              {{ item.label }}
            </span>
          </template>
        </nav>
      </aside>

      <div class="min-w-0 flex-1">
        <header class="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 lg:px-8">
          <p class="text-sm font-medium text-slate-500">OpsFlow</p>

          <div class="flex items-center gap-3">
            <div class="hidden text-right sm:block">
              <p class="text-sm font-medium text-slate-900">{{ authStore.user?.name }}</p>
              <p class="text-xs text-slate-500">{{ authStore.user?.email }}</p>
            </div>

            <div class="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
              {{ initials }}
            </div>

            <Button variant="outline" size="sm" :disabled="authStore.loading" @click="handleLogout">
              Sign out
            </Button>
          </div>
        </header>

        <main class="p-5 lg:p-8">
          <RouterView />
        </main>
      </div>
    </div>
  </div>
</template>
