<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getClients } from '@/api/clients'
import { createWorkOrder, getTeamMembers, parseWorkOrderIntake } from '@/api/workOrders'

const router = useRouter()
const clients = ref([])
const teamMembers = ref([])
const intakeText = ref('')
const parsing = ref(false)
const saving = ref(false)
const error = ref('')
const suggestion = ref(null)

const today = () => {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  return new Date(now.getTime() - offset * 60 * 1000).toISOString().slice(0, 10)
}

const form = reactive({
  client_id: '',
  assignee_id: '',
  title: '',
  description: '',
  internal_notes: '',
  status: 'draft',
  priority: 'normal',
  due_date: today(),
})

const confidenceLabel = computed(() => {
  if (!suggestion.value) return ''
  return `${Math.round((suggestion.value.confidence || 0) * 100)}% confidence`
})

const loadLookups = async () => {
  try {
    const [clientResponse, members] = await Promise.all([
      getClients({ per_page: 100, sort: 'name', direction: 'asc' }),
      getTeamMembers(),
    ])
    clients.value = clientResponse.data
    teamMembers.value = members
  } catch (err) {
    error.value = err.response?.data?.message || 'Unable to load clients and team members.'
  }
}

const parseRequest = async () => {
  if (intakeText.value.trim().length < 10) {
    error.value = 'Add a little more detail before parsing.'
    return
  }

  parsing.value = true
  error.value = ''
  suggestion.value = null

  try {
    const parsed = await parseWorkOrderIntake(intakeText.value.trim())
    suggestion.value = parsed
    Object.assign(form, {
      client_id: parsed.client_id ? String(parsed.client_id) : '',
      assignee_id: parsed.assignee_id ? String(parsed.assignee_id) : '',
      title: parsed.title || '',
      description: parsed.description || '',
      internal_notes: '',
      status: parsed.status || 'draft',
      priority: parsed.priority || 'normal',
      due_date: parsed.due_date || today(),
    })
  } catch (err) {
    error.value = err.response?.data?.message || 'Unable to parse this request right now.'
  } finally {
    parsing.value = false
  }
}

const createReviewedOrder = async () => {
  saving.value = true
  error.value = ''

  try {
    await createWorkOrder({
      ...form,
      client_id: Number(form.client_id),
      assignee_id: form.assignee_id ? Number(form.assignee_id) : null,
      due_date: form.due_date || null,
    })
    await router.push('/work-orders')
  } catch (err) {
    const errors = err.response?.data?.errors
    error.value = errors ? Object.values(errors).flat()[0] : err.response?.data?.message || 'Unable to create work order.'
  } finally {
    saving.value = false
  }
}

onMounted(loadLookups)
</script>

<template>
  <section class="mx-auto max-w-5xl space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-sm font-medium text-slate-500">AI-assisted intake</p>
        <h1 class="mt-1 text-3xl font-semibold tracking-tight text-slate-950">Turn a request into a work-order draft</h1>
        <p class="mt-2 max-w-2xl text-sm text-slate-600">Paste a call note, email summary, or messy request. OpsFlow will structure it, but nothing is created until you review and submit the form.</p>
      </div>
      <Button variant="outline" @click="router.push('/work-orders')">Back to work orders</Button>
    </div>

    <div v-if="error" class="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{{ error }}</div>

    <Card>
      <CardHeader>
        <CardTitle>1. Paste the request</CardTitle>
        <CardDescription>Include the client, what happened, timing, urgency, and assignee when you know them.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <textarea
          v-model="intakeText"
          rows="7"
          class="w-full rounded-md border border-input bg-background px-3 py-3 text-sm"
          placeholder="Example: Northstar called about the broken display in reception. Needs fixing by Friday, pretty urgent. Assign to Alex."
        />
        <div class="flex justify-end">
          <Button :disabled="parsing" @click="parseRequest">{{ parsing ? 'Analyzing request…' : 'Parse with AI' }}</Button>
        </div>
      </CardContent>
    </Card>

    <Card v-if="suggestion">
      <CardHeader>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>2. Review the draft</CardTitle>
            <CardDescription>Every field is editable. The normal Work Order API validates the final submission.</CardDescription>
          </div>
          <Badge variant="secondary">{{ confidenceLabel }}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div v-if="suggestion.warnings?.length" class="mb-5 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p class="font-semibold">Needs review</p>
          <ul class="mt-2 list-disc space-y-1 pl-5">
            <li v-for="warning in suggestion.warnings" :key="warning">{{ warning }}</li>
          </ul>
        </div>

        <form class="grid gap-4 sm:grid-cols-2" @submit.prevent="createReviewedOrder">
          <label class="space-y-1 text-sm font-medium sm:col-span-2">
            <span>Title *</span>
            <input v-model="form.title" required class="h-10 w-full rounded-md border border-input px-3 font-normal" />
          </label>

          <label class="space-y-1 text-sm font-medium">
            <span>Client *</span>
            <select v-model="form.client_id" required class="h-10 w-full rounded-md border border-input px-3 font-normal">
              <option value="">Select client</option>
              <option v-for="client in clients" :key="client.id" :value="client.id">{{ client.name }}</option>
            </select>
            <span v-if="!form.client_id && suggestion.client_name" class="text-xs font-normal text-amber-700">AI mentioned “{{ suggestion.client_name }}” but no tenant client was safely matched.</span>
          </label>

          <label class="space-y-1 text-sm font-medium">
            <span>Assignee</span>
            <select v-model="form.assignee_id" class="h-10 w-full rounded-md border border-input px-3 font-normal">
              <option value="">Unassigned</option>
              <option v-for="member in teamMembers" :key="member.id" :value="member.id">{{ member.name }}</option>
            </select>
          </label>

          <label class="space-y-1 text-sm font-medium">
            <span>Status</span>
            <select v-model="form.status" class="h-10 w-full rounded-md border border-input px-3 font-normal">
              <option value="draft">Draft</option><option value="queued">Queued</option><option value="in_progress">In progress</option><option value="blocked">Blocked</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
            </select>
          </label>

          <label class="space-y-1 text-sm font-medium">
            <span>Priority</span>
            <select v-model="form.priority" class="h-10 w-full rounded-md border border-input px-3 font-normal">
              <option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option>
            </select>
          </label>

          <label class="space-y-1 text-sm font-medium">
            <span>Due date</span>
            <input v-model="form.due_date" type="date" class="h-10 w-full rounded-md border border-input px-3 font-normal" />
          </label>

          <label class="space-y-1 text-sm font-medium sm:col-span-2">
            <span>Description</span>
            <textarea v-model="form.description" rows="4" class="w-full rounded-md border border-input px-3 py-2 font-normal" />
          </label>

          <label class="space-y-1 text-sm font-medium sm:col-span-2">
            <span>Internal notes</span>
            <textarea v-model="form.internal_notes" rows="3" class="w-full rounded-md border border-input px-3 py-2 font-normal" />
          </label>

          <div class="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="outline" @click="suggestion=null">Start over</Button>
            <Button type="submit" :disabled="saving">{{ saving ? 'Creating…' : 'Create reviewed work order' }}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </section>
</template>
