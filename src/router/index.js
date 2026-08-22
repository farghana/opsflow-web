import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import DashboardPage from '@/pages/DashboardPage.vue'
import ClientsPage from '@/pages/ClientsPage.vue'
import WorkOrdersPage from '@/pages/WorkOrdersPage.vue'
import LoginPage from '@/pages/LoginPage.vue'
import pinia from '@/stores'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: { guestOnly: true },
  },
  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: DashboardPage,
      },
      {
        path: 'clients',
        name: 'clients',
        component: ClientsPage,
      },
      {
        path: 'work-orders',
        name: 'work-orders',
        component: WorkOrdersPage,
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore(pinia)

  if (!authStore.initialized) {
    await authStore.fetchUser()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    }
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { name: 'dashboard' }
  }
})

export default router
