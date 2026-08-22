<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getClients } from '@/api/clients'
import {
  createWorkOrder,
  deleteWorkOrder,
  getTeamMembers,
  getWorkOrder,
  getWorkOrders,
  updateWorkOrder,
} from '@/api/workOrders'

const route = useRoute()
const router = useRouter()

const statuses = [
  ['draft', 'Draft'],
  ['queued', 'Queued'],
  ['in_progress', 'In progress'],
  ['blocked', 'Blocked'],
  ['completed', 'Completed'],
  ['cancelled', 'Cancelled'],
]
const priorities = [
  ['low', 'Low'],
  ['normal', 'Normal'],
  ['high', 'High'],
  ['urgent', 'Urgent'],
]

const orders = ref([])
const clients = ref([])
const teamMembers = ref([])
const meta = ref({ current_page: 1, last_page: 1, total: 0 })
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const formError = ref('')
const showForm = ref(false)
const showDetail = ref(false)
const editingId = ref(null)
const selectedOrder = ref(null)

const filters = reactive({
  search: route.query.search || '',
  status: route.query.status || '',
  priority: route.query.priority || '',
  client_id: route.query.client_id || '',
  assignee_id: route.query.assignee_id || '',
  overdue: route.query.overdue === '1' ? '1' : '',
  sort: route.query.sort || 'created_at',
  direction: route.query.direction === 'asc' ? 'asc' : 'desc',
  page: Number(route.query.page || 1),
  per_page: Number(route.query.per_page || 15),
})

const form = reactive({
  client_id: '',
  assignee_id: '',
  title: '',
  description: '',
  internal_notes: '',
  status: 'draft',
  priority: 'normal',
  due_date: '',
})

const isEditing = computed(() => editingId.value !== null)
const today = () => new Date().toISOString().slice(0, 10)
const isOverdue = (order) => order.due_date && order.due_date < today() && !['completed', 'cancelled'].includes(order.status)
const labelFor = (options, value) => options.find(([key]) => key === value)?.[1] || value

const statusVariant = (status) => ({
  completed: 'default',
  blocked: 'destructive',
  cancelled: 'secondary',
}[status] || 'secondary')

const priorityVariant = (priority) => priority === 'urgent' ? 'destructive' : priority === 'high' ? 'default' : 'outline'

const syncQuery = () => {
  const query = {}
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) query[key] = String(value)
  })
  if (query.sort === 'created_at') delete query.sort
  if (query.direction === 'desc') delete query.direction
  if (query.page === '1') delete query.page
  if (query.per_page === '15') delete query.per_page
  router.replace({ query })
}

const loadOrders = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await getWorkOrders(filters)
    orders.value = response.data
    meta.value = response.meta
  } catch (err) {
    error.value = err.response?.data?.message || 'Unable to load work orders.'
  } finally {
    loading.value = false
  }
}

const loadLookups = async () => {
  try {
    const [clientResponse, teamResponse] = await Promise.all([
      getClients({ per_page: 100, sort: 'name', direction: 'asc' }),
      getTeamMembers(),
    ])
    clients.value = clientResponse.data
    teamMembers.value = teamResponse
  } catch {
    error.value = 'Unable to load work order lookups.'
  }
}

const resetForm = () => {
  editingId.value = null
  Object.assign(form, {
    client_id: '', assignee_id: '', title: '', description: '', internal_notes: '',
    status: 'draft', priority: 'normal', due_date: '',
  })
  formError.value = ''
}

const openCreate = () => {
  resetForm()
  showForm.value = true
}

const openEdit = (order) => {
  editingId.value = order.id
  Object.assign(form, {
    client_id: String(order.client?.id || ''),
    assignee_id: order.assignee?.id ? String(order.assignee.id) : '',
    title: order.title || '',
    description: order.description || '',
    internal_notes: order.internal_notes || '',
    status: order.status || 'draft',
    priority: order.priority || 'normal',
    due_date: order.due_date || '',
  })
  formError.value = ''
  showForm.value = true
}

const payload = () => ({
  ...form,
  client_id: Number(form.client_id),
  assignee_id: form.assignee_id ? Number(form.assignee_id) : null,
  due_date: form.due_date || null,
})

const submitForm = async () => {
  saving.value = true
  formError.value = ''
  try {
    if (isEditing.value) await updateWorkOrder(editingId.value, payload())
    else await createWorkOrder(payload())
    showForm.value = false
    resetForm()
    await loadOrders()
  } catch (err) {
    const errors = err.response?.data?.errors
    formError.value = errors ? Object.values(errors).flat()[0] : err.response?.data?.message || 'Unable to save work order.'
  } finally {
    saving.value = false
  }
}

const openDetail = async (order) => {
  try {
    selectedOrder.value = await getWorkOrder(order.id)
    showDetail.value = true
  } catch (err) {
    error.value = err.response?.data?.message || 'Unable to load work order details.'
  }
}

const removeOrder = async (order) => {
  if (!window.confirm(`Delete ${order.order_number}? This action cannot be undone.`)) return
  try {
    await deleteWorkOrder(order.id)
    await loadOrders()
  } catch (err) {
    error.value = err.response?.data?.message || 'Unable to delete work order.'
  }
}

const toggleSort = (field) => {
  if (filters.sort === field) filters.direction = filters.direction === 'asc' ? 'desc' : 'asc'
  else { filters.sort = field; filters.direction = 'asc' }
  filters.page = 1
}
const sortArrow = (field) => filters.sort !== field ? '↕' : filters.direction === 'asc' ? '↑' : '↓'

const clearFilters = () => {
  Object.assign(filters, { search: '', status: '', priority: '', client_id: '', assignee_id: '', overdue: '', page: 1 })
}

let searchTimer
watch(() => filters.search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { filters.page = 1; syncQuery(); loadOrders() }, 300)
})
watch(() => [filters.status, filters.priority, filters.client_id, filters.assignee_id, filters.overdue, filters.sort, filters.direction, filters.page, filters.per_page], () => {
  syncQuery(); loadOrders()
})

onMounted(async () => { await Promise.all([loadLookups(), loadOrders()]) })
</script>

<template>
  <section class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-sm font-medium text-slate-500">Operations</p>
        <h1 class="mt-1 text-3xl font-semibold tracking-tight text-slate-950">Work Orders</h1>
        <p class="mt-2 text-sm text-slate-600">Track work from intake through completion.</p>
      </div>
      <Button @click="openCreate">Create work order</Button>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Operations queue</CardTitle>
        <CardDescription>{{ meta.total }} total work orders</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          <input v-model="filters.search" type="search" placeholder="Search orders" class="h-10 rounded-md border border-input bg-background px-3 text-sm xl:col-span-2" />
          <select v-model="filters.status" class="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="">All statuses</option><option v-for="[value,label] in statuses" :key="value" :value="value">{{ label }}</option></select>
          <select v-model="filters.priority" class="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="">All priorities</option><option v-for="[value,label] in priorities" :key="value" :value="value">{{ label }}</option></select>
          <select v-model="filters.client_id" class="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="">All clients</option><option v-for="client in clients" :key="client.id" :value="client.id">{{ client.name }}</option></select>
          <select v-model="filters.assignee_id" class="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="">All assignees</option><option v-for="member in teamMembers" :key="member.id" :value="member.id">{{ member.name }}</option></select>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <label class="flex items-center gap-2 text-sm"><input v-model="filters.overdue" type="checkbox" true-value="1" false-value="" /> Overdue only</label>
          <Button variant="ghost" size="sm" @click="clearFilters">Clear filters</Button>
        </div>

        <div v-if="error" class="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{{ error }}</div>
        <div v-if="loading" class="py-12 text-center text-sm text-slate-500">Loading work orders…</div>
        <div v-else-if="orders.length === 0" class="py-12 text-center"><p class="font-medium">No work orders found</p><p class="mt-1 text-sm text-slate-500">Create one or adjust the filters.</p></div>

        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[1050px] text-left text-sm">
            <thead class="border-b text-xs uppercase tracking-wide text-slate-500"><tr>
              <th class="px-3 py-3"><button class="font-semibold" @click="toggleSort('order_number')">Order <span>{{ sortArrow('order_number') }}</span></button></th>
              <th class="px-3 py-3"><button class="font-semibold" @click="toggleSort('title')">Work <span>{{ sortArrow('title') }}</span></button></th>
              <th class="px-3 py-3">Client</th>
              <th class="px-3 py-3"><button class="font-semibold" @click="toggleSort('status')">Status <span>{{ sortArrow('status') }}</span></button></th>
              <th class="px-3 py-3"><button class="font-semibold" @click="toggleSort('priority')">Priority <span>{{ sortArrow('priority') }}</span></button></th>
              <th class="px-3 py-3">Assignee</th>
              <th class="px-3 py-3"><button class="font-semibold" @click="toggleSort('due_date')">Due <span>{{ sortArrow('due_date') }}</span></button></th>
              <th class="px-3 py-3 text-right">Actions</th>
            </tr></thead>
            <tbody class="divide-y">
              <tr v-for="order in orders" :key="order.id" :class="['hover:bg-slate-50', isOverdue(order) ? 'bg-red-50/60' : '']">
                <td class="px-3 py-4 font-mono text-xs font-semibold text-slate-700">{{ order.order_number }}</td>
                <td class="px-3 py-4"><button class="text-left font-medium text-slate-950 hover:underline" @click="openDetail(order)">{{ order.title }}</button></td>
                <td class="px-3 py-4 text-slate-600">{{ order.client?.name }}</td>
                <td class="px-3 py-4"><Badge :variant="statusVariant(order.status)">{{ labelFor(statuses, order.status) }}</Badge></td>
                <td class="px-3 py-4"><Badge :variant="priorityVariant(order.priority)">{{ labelFor(priorities, order.priority) }}</Badge></td>
                <td class="px-3 py-4 text-slate-600">{{ order.assignee?.name || 'Unassigned' }}</td>
                <td class="px-3 py-4" :class="isOverdue(order) ? 'font-semibold text-red-700' : 'text-slate-600'">{{ order.due_date || '—' }}<span v-if="isOverdue(order)" class="ml-2 text-xs">Overdue</span></td>
                <td class="px-3 py-4 text-right"><div class="flex justify-end gap-2"><Button variant="outline" size="sm" @click="openEdit(order)">Edit</Button><Button variant="ghost" size="sm" @click="removeOrder(order)">Delete</Button></div></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex items-center justify-between border-t pt-4">
          <p class="text-sm text-slate-500">Page {{ meta.current_page || 1 }} of {{ meta.last_page || 1 }}</p>
          <div class="flex gap-2"><Button variant="outline" size="sm" :disabled="filters.page <= 1" @click="filters.page -= 1">Previous</Button><Button variant="outline" size="sm" :disabled="filters.page >= (meta.last_page || 1)" @click="filters.page += 1">Next</Button></div>
        </div>
      </CardContent>
    </Card>

    <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click.self="showForm=false">
      <Card class="max-h-[92vh] w-full max-w-3xl overflow-y-auto"><CardHeader><CardTitle>{{ isEditing ? 'Edit work order' : 'Create work order' }}</CardTitle><CardDescription>Assign ownership, priority and a due date for the work.</CardDescription></CardHeader><CardContent>
        <form class="grid gap-4 sm:grid-cols-2" @submit.prevent="submitForm">
          <label class="space-y-1 text-sm font-medium sm:col-span-2"><span>Title *</span><input v-model="form.title" required class="h-10 w-full rounded-md border border-input px-3 font-normal" /></label>
          <label class="space-y-1 text-sm font-medium"><span>Client *</span><select v-model="form.client_id" required class="h-10 w-full rounded-md border border-input px-3 font-normal"><option value="">Select client</option><option v-for="client in clients" :key="client.id" :value="client.id">{{ client.name }}</option></select></label>
          <label class="space-y-1 text-sm font-medium"><span>Assignee</span><select v-model="form.assignee_id" class="h-10 w-full rounded-md border border-input px-3 font-normal"><option value="">Unassigned</option><option v-for="member in teamMembers" :key="member.id" :value="member.id">{{ member.name }}</option></select></label>
          <label class="space-y-1 text-sm font-medium"><span>Status</span><select v-model="form.status" class="h-10 w-full rounded-md border border-input px-3 font-normal"><option v-for="[value,label] in statuses" :key="value" :value="value">{{ label }}</option></select></label>
          <label class="space-y-1 text-sm font-medium"><span>Priority</span><select v-model="form.priority" class="h-10 w-full rounded-md border border-input px-3 font-normal"><option v-for="[value,label] in priorities" :key="value" :value="value">{{ label }}</option></select></label>
          <label class="space-y-1 text-sm font-medium"><span>Due date</span><input v-model="form.due_date" type="date" class="h-10 w-full rounded-md border border-input px-3 font-normal" /></label>
          <label class="space-y-1 text-sm font-medium sm:col-span-2"><span>Description</span><textarea v-model="form.description" rows="4" class="w-full rounded-md border border-input px-3 py-2 font-normal" /></label>
          <label class="space-y-1 text-sm font-medium sm:col-span-2"><span>Internal notes</span><textarea v-model="form.internal_notes" rows="3" class="w-full rounded-md border border-input px-3 py-2 font-normal" /></label>
          <p v-if="formError" class="text-sm text-red-600 sm:col-span-2">{{ formError }}</p>
          <div class="flex justify-end gap-2 sm:col-span-2"><Button type="button" variant="outline" @click="showForm=false">Cancel</Button><Button type="submit" :disabled="saving">{{ saving ? 'Saving…' : isEditing ? 'Save changes' : 'Create work order' }}</Button></div>
        </form>
      </CardContent></Card>
    </div>

    <div v-if="showDetail && selectedOrder" class="fixed inset-0 z-50 flex justify-end bg-black/35" @click.self="showDetail=false">
      <aside class="h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-2xl">
        <div class="flex items-start justify-between gap-4"><div><p class="font-mono text-xs font-semibold text-slate-500">{{ selectedOrder.order_number }}</p><h2 class="mt-1 text-2xl font-semibold">{{ selectedOrder.title }}</h2><p class="mt-2 text-sm text-slate-500">{{ selectedOrder.client?.name }}</p></div><Button variant="outline" size="sm" @click="showDetail=false">Close</Button></div>
        <div class="mt-5 flex flex-wrap gap-2"><Badge :variant="statusVariant(selectedOrder.status)">{{ labelFor(statuses, selectedOrder.status) }}</Badge><Badge :variant="priorityVariant(selectedOrder.priority)">{{ labelFor(priorities, selectedOrder.priority) }}</Badge><Badge v-if="isOverdue(selectedOrder)" variant="destructive">Overdue</Badge></div>
        <div class="mt-6 grid gap-4 rounded-lg border p-4 text-sm sm:grid-cols-2"><div><p class="text-slate-500">Assignee</p><p class="font-medium">{{ selectedOrder.assignee?.name || 'Unassigned' }}</p></div><div><p class="text-slate-500">Due date</p><p class="font-medium">{{ selectedOrder.due_date || 'No due date' }}</p></div></div>
        <div v-if="selectedOrder.description" class="mt-6"><h3 class="font-semibold">Description</h3><p class="mt-2 whitespace-pre-wrap text-sm text-slate-600">{{ selectedOrder.description }}</p></div>
        <div v-if="selectedOrder.internal_notes" class="mt-6 rounded-lg bg-amber-50 p-4"><h3 class="font-semibold text-amber-950">Internal notes</h3><p class="mt-2 whitespace-pre-wrap text-sm text-amber-900">{{ selectedOrder.internal_notes }}</p></div>
        <div class="mt-8"><h3 class="font-semibold">Activity</h3><div v-if="!selectedOrder.activities?.length" class="mt-3 text-sm text-slate-500">No activity recorded yet.</div><ol v-else class="mt-4 space-y-4 border-l pl-5"><li v-for="activity in selectedOrder.activities" :key="activity.id" class="relative"><span class="absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full bg-slate-900"></span><p class="text-sm font-medium">{{ activity.description || activity.type || 'Work order updated' }}</p><p class="mt-1 text-xs text-slate-500">{{ activity.created_at }}</p></li></ol></div>
      </aside>
    </div>
  </section>
</template>
