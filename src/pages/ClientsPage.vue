<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient, deleteClient, getClients, updateClient } from '@/api/clients'

const route = useRoute()
const router = useRouter()

const clients = ref([])
const meta = ref({ current_page: 1, last_page: 1, per_page: 10, total: 0 })
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const formError = ref('')
const editingId = ref(null)
const showForm = ref(false)

const filters = reactive({
  search: route.query.search || '',
  sort: route.query.sort || 'name',
  direction: route.query.direction === 'desc' ? 'desc' : 'asc',
  page: Number(route.query.page || 1),
  per_page: Number(route.query.per_page || 10),
})

const form = reactive({
  name: '',
  company_name: '',
  email: '',
  phone: '',
  address_line_1: '',
  city: '',
  province: '',
  postal_code: '',
  notes: '',
})

const isEditing = computed(() => editingId.value !== null)

const sortIndicator = (field) => {
  if (filters.sort !== field) return '↕'
  return filters.direction === 'asc' ? '↑' : '↓'
}

const sortLabel = (field, label) => {
  if (filters.sort !== field) return `Sort by ${label}`
  return filters.direction === 'asc'
    ? `${label}, sorted ascending. Sort descending`
    : `${label}, sorted descending. Sort ascending`
}

const syncQuery = () => {
  router.replace({
    query: {
      ...(filters.search ? { search: filters.search } : {}),
      ...(filters.sort !== 'name' ? { sort: filters.sort } : {}),
      ...(filters.direction !== 'asc' ? { direction: filters.direction } : {}),
      ...(filters.page > 1 ? { page: filters.page } : {}),
      ...(filters.per_page !== 10 ? { per_page: filters.per_page } : {}),
    },
  })
}

const loadClients = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await getClients(filters)
    clients.value = response.data
    meta.value = response.meta
  } catch (err) {
    error.value = err.response?.data?.message || 'Unable to load clients.'
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  editingId.value = null
  Object.assign(form, {
    name: '',
    company_name: '',
    email: '',
    phone: '',
    address_line_1: '',
    city: '',
    province: '',
    postal_code: '',
    notes: '',
  })
  formError.value = ''
}

const openCreate = () => {
  resetForm()
  showForm.value = true
}

const openEdit = (client) => {
  editingId.value = client.id
  Object.keys(form).forEach((key) => {
    form[key] = client[key] || ''
  })
  formError.value = ''
  showForm.value = true
}

const submitForm = async () => {
  saving.value = true
  formError.value = ''

  try {
    if (isEditing.value) {
      await updateClient(editingId.value, form)
    } else {
      await createClient(form)
    }

    showForm.value = false
    resetForm()
    await loadClients()
  } catch (err) {
    const errors = err.response?.data?.errors
    formError.value = errors ? Object.values(errors).flat()[0] : err.response?.data?.message || 'Unable to save client.'
  } finally {
    saving.value = false
  }
}

const removeClient = async (client) => {
  if (!window.confirm(`Delete ${client.name}? This action cannot be undone.`)) return

  try {
    await deleteClient(client.id)
    if (clients.value.length === 1 && filters.page > 1) filters.page -= 1
    await loadClients()
  } catch (err) {
    error.value = err.response?.data?.message || 'Unable to delete client.'
  }
}

const toggleSort = (field) => {
  if (filters.sort === field) {
    filters.direction = filters.direction === 'asc' ? 'desc' : 'asc'
  } else {
    filters.sort = field
    filters.direction = 'asc'
  }
  filters.page = 1
}

let searchTimer
watch(
  () => filters.search,
  () => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
      filters.page = 1
      syncQuery()
      loadClients()
    }, 300)
  },
)

watch(
  () => [filters.sort, filters.direction, filters.page, filters.per_page],
  () => {
    syncQuery()
    loadClients()
  },
)

onMounted(loadClients)
</script>

<template>
  <section class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-sm font-medium text-slate-500">Directory</p>
        <h1 class="mt-1 text-3xl font-semibold tracking-tight text-slate-950">Clients</h1>
        <p class="mt-2 text-sm text-slate-600">Manage customer records for your organization.</p>
      </div>
      <Button @click="openCreate">Add client</Button>
    </div>

    <Card>
      <CardHeader class="gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Client directory</CardTitle>
          <CardDescription>{{ meta.total }} total clients</CardDescription>
        </div>
        <input
          v-model="filters.search"
          type="search"
          placeholder="Search name, company, email or phone"
          class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring sm:max-w-sm"
        />
      </CardHeader>

      <CardContent>
        <div v-if="error" class="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{{ error }}</div>

        <div v-if="loading" class="py-12 text-center text-sm text-slate-500">Loading clients…</div>

        <div v-else-if="clients.length === 0" class="py-12 text-center">
          <p class="font-medium text-slate-900">No clients found</p>
          <p class="mt-1 text-sm text-slate-500">Add your first client or adjust your search.</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[760px] text-left text-sm">
            <thead class="border-b text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th class="px-3 py-3">
                  <button
                    class="inline-flex items-center gap-1.5 font-semibold transition hover:text-slate-900"
                    :aria-label="sortLabel('name', 'Name')"
                    @click="toggleSort('name')"
                  >
                    <span>Name</span>
                    <span
                      class="text-sm leading-none"
                      :class="filters.sort === 'name' ? 'text-slate-900' : 'text-slate-300'"
                      aria-hidden="true"
                    >{{ sortIndicator('name') }}</span>
                  </button>
                </th>
                <th class="px-3 py-3">
                  <button
                    class="inline-flex items-center gap-1.5 font-semibold transition hover:text-slate-900"
                    :aria-label="sortLabel('company_name', 'Company')"
                    @click="toggleSort('company_name')"
                  >
                    <span>Company</span>
                    <span
                      class="text-sm leading-none"
                      :class="filters.sort === 'company_name' ? 'text-slate-900' : 'text-slate-300'"
                      aria-hidden="true"
                    >{{ sortIndicator('company_name') }}</span>
                  </button>
                </th>
                <th class="px-3 py-3">Contact</th>
                <th class="px-3 py-3">Location</th>
                <th class="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <tr v-for="client in clients" :key="client.id" class="hover:bg-slate-50">
                <td class="px-3 py-4 font-medium text-slate-950">{{ client.name }}</td>
                <td class="px-3 py-4 text-slate-600">{{ client.company_name || '—' }}</td>
                <td class="px-3 py-4 text-slate-600">
                  <div>{{ client.email || '—' }}</div>
                  <div class="text-xs text-slate-400">{{ client.phone || '' }}</div>
                </td>
                <td class="px-3 py-4 text-slate-600">{{ [client.city, client.province].filter(Boolean).join(', ') || '—' }}</td>
                <td class="px-3 py-4 text-right">
                  <div class="flex justify-end gap-2">
                    <Button variant="outline" size="sm" @click="openEdit(client)">Edit</Button>
                    <Button variant="ghost" size="sm" @click="removeClient(client)">Delete</Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-5 flex items-center justify-between border-t pt-4">
          <p class="text-sm text-slate-500">Page {{ meta.current_page || 1 }} of {{ meta.last_page || 1 }}</p>
          <div class="flex gap-2">
            <Button variant="outline" size="sm" :disabled="filters.page <= 1" @click="filters.page -= 1">Previous</Button>
            <Button variant="outline" size="sm" :disabled="filters.page >= (meta.last_page || 1)" @click="filters.page += 1">Next</Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click.self="showForm = false">
      <Card class="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
        <CardHeader>
          <CardTitle>{{ isEditing ? 'Edit client' : 'Add client' }}</CardTitle>
          <CardDescription>Keep the directory accurate for work orders, billing and reporting.</CardDescription>
        </CardHeader>
        <CardContent>
          <form class="grid gap-4 sm:grid-cols-2" @submit.prevent="submitForm">
            <label class="space-y-1 text-sm font-medium">
              <span>Name *</span>
              <input v-model="form.name" required class="h-10 w-full rounded-md border border-input bg-background px-3 font-normal" />
            </label>
            <label class="space-y-1 text-sm font-medium">
              <span>Company</span>
              <input v-model="form.company_name" class="h-10 w-full rounded-md border border-input bg-background px-3 font-normal" />
            </label>
            <label class="space-y-1 text-sm font-medium">
              <span>Email</span>
              <input v-model="form.email" type="email" class="h-10 w-full rounded-md border border-input bg-background px-3 font-normal" />
            </label>
            <label class="space-y-1 text-sm font-medium">
              <span>Phone</span>
              <input v-model="form.phone" class="h-10 w-full rounded-md border border-input bg-background px-3 font-normal" />
            </label>
            <label class="space-y-1 text-sm font-medium sm:col-span-2">
              <span>Address</span>
              <input v-model="form.address_line_1" class="h-10 w-full rounded-md border border-input bg-background px-3 font-normal" />
            </label>
            <label class="space-y-1 text-sm font-medium">
              <span>City</span>
              <input v-model="form.city" class="h-10 w-full rounded-md border border-input bg-background px-3 font-normal" />
            </label>
            <label class="space-y-1 text-sm font-medium">
              <span>Province / State</span>
              <input v-model="form.province" class="h-10 w-full rounded-md border border-input bg-background px-3 font-normal" />
            </label>
            <label class="space-y-1 text-sm font-medium">
              <span>Postal / ZIP code</span>
              <input v-model="form.postal_code" class="h-10 w-full rounded-md border border-input bg-background px-3 font-normal" />
            </label>
            <label class="space-y-1 text-sm font-medium sm:col-span-2">
              <span>Notes</span>
              <textarea v-model="form.notes" rows="3" class="w-full rounded-md border border-input bg-background px-3 py-2 font-normal" />
            </label>

            <p v-if="formError" class="text-sm text-red-600 sm:col-span-2">{{ formError }}</p>

            <div class="flex justify-end gap-2 sm:col-span-2">
              <Button type="button" variant="outline" @click="showForm = false">Cancel</Button>
              <Button type="submit" :disabled="saving">{{ saving ? 'Saving…' : isEditing ? 'Save changes' : 'Create client' }}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  </section>
</template>
