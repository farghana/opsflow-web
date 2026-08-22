<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getDashboardSummary } from '@/api/dashboard'

const router = useRouter()
const loading = ref(true)
const error = ref('')
const summary = ref({
  metrics: {
    open: 0,
    overdue: 0,
    high_priority: 0,
    completed_last_7_days: 0,
  },
  recent_work_orders: [],
})

const statuses = {
  draft: 'Draft',
  queued: 'Queued',
  in_progress: 'In progress',
  blocked: 'Blocked',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const metrics = computed(() => [
  { label: 'Open work orders', value: summary.value.metrics.open, hint: 'Active across the team' },
  { label: 'Overdue', value: summary.value.metrics.overdue, hint: 'Past the due date and still open' },
  { label: 'High priority', value: summary.value.metrics.high_priority, hint: 'High or urgent open work' },
  { label: 'Completed in 7 days', value: summary.value.metrics.completed_last_7_days, hint: 'Recently completed work' },
])

const alerts = computed(() => {
  const items = []

  if (summary.value.metrics.overdue > 0) {
    items.push({
      label: `${summary.value.metrics.overdue} overdue work order${summary.value.metrics.overdue === 1 ? '' : 's'}`,
      detail: 'Review due dates and ownership.',
      variant: 'destructive',
    })
  }

  if (summary.value.metrics.high_priority > 0) {
    items.push({
      label: `${summary.value.metrics.high_priority} high-priority work order${summary.value.metrics.high_priority === 1 ? '' : 's'}`,
      detail: 'High and urgent work needs attention.',
      variant: 'default',
    })
  }

  return items
})

const priorityVariant = (priority) => priority === 'urgent' ? 'destructive' : priority === 'high' ? 'default' : 'outline'
const statusVariant = (status) => status === 'blocked' ? 'destructive' : status === 'completed' ? 'default' : 'secondary'

const loadSummary = async () => {
  loading.value = true
  error.value = ''

  try {
    summary.value = await getDashboardSummary()
  } catch (err) {
    error.value = err.response?.data?.message || 'Unable to load dashboard data.'
  } finally {
    loading.value = false
  }
}

onMounted(loadSummary)
</script>

<template>
  <section class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-sm font-medium text-muted-foreground">Overview</p>
        <h1 class="mt-1 text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p class="mt-2 max-w-2xl text-sm text-muted-foreground">
          Monitor workload, deadlines, priorities, and recent operational activity.
        </p>
      </div>
      <Button @click="router.push('/work-orders')">Create work order</Button>
    </div>

    <div v-if="error" class="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      {{ error }}
    </div>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card v-for="metric in metrics" :key="metric.label">
        <CardHeader class="pb-2">
          <CardDescription>{{ metric.label }}</CardDescription>
          <CardTitle class="text-2xl">{{ loading ? '—' : metric.value }}</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-xs text-muted-foreground">{{ metric.hint }}</p>
        </CardContent>
      </Card>
    </div>

    <div class="grid gap-4 lg:grid-cols-[2fr_1fr]">
      <Card>
        <CardHeader class="sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Recent work orders</CardTitle>
            <CardDescription>The latest work created for your organization.</CardDescription>
          </div>
          <Button variant="outline" size="sm" @click="router.push('/work-orders')">View all</Button>
        </CardHeader>
        <CardContent>
          <div v-if="loading" class="py-8 text-center text-sm text-muted-foreground">Loading recent work…</div>
          <div v-else-if="summary.recent_work_orders.length === 0" class="py-8 text-center text-sm text-muted-foreground">
            No work orders yet.
          </div>
          <div v-else class="space-y-4">
            <button
              v-for="item in summary.recent_work_orders"
              :key="item.id"
              type="button"
              class="flex w-full items-center justify-between gap-4 border-b pb-4 text-left last:border-b-0 last:pb-0"
              @click="router.push('/work-orders')"
            >
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <p class="font-mono text-xs font-semibold text-slate-500">{{ item.order_number }}</p>
                  <Badge :variant="priorityVariant(item.priority)">{{ item.priority }}</Badge>
                </div>
                <p class="mt-1 truncate font-medium text-slate-950">{{ item.title }}</p>
                <p class="truncate text-sm text-muted-foreground">{{ item.client?.name }}</p>
              </div>
              <div class="shrink-0 text-right">
                <Badge :variant="statusVariant(item.status)">{{ statuses[item.status] || item.status }}</Badge>
                <p class="mt-2 text-xs text-muted-foreground">Due {{ item.due_date || 'not set' }}</p>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Operational alerts</CardTitle>
          <CardDescription>Work that deserves attention now.</CardDescription>
        </CardHeader>
        <CardContent>
          <div v-if="loading" class="py-6 text-sm text-muted-foreground">Checking alerts…</div>
          <div v-else-if="alerts.length === 0" class="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            No urgent operational alerts right now.
          </div>
          <div v-else class="space-y-3">
            <button
              v-for="alert in alerts"
              :key="alert.label"
              type="button"
              class="w-full rounded-lg border p-4 text-left transition hover:bg-slate-50"
              @click="router.push('/work-orders')"
            >
              <div class="flex items-center gap-2">
                <Badge :variant="alert.variant">Attention</Badge>
                <p class="font-medium text-slate-950">{{ alert.label }}</p>
              </div>
              <p class="mt-2 text-sm text-muted-foreground">{{ alert.detail }}</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  </section>
</template>
