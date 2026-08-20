<script setup>
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const metrics = [
  { label: 'Open work orders', value: '—', hint: 'Active across the team' },
  { label: 'Due this week', value: '—', hint: 'Needs attention soon' },
  { label: 'Overdue', value: '—', hint: 'Past the due date' },
  { label: 'Revenue this month', value: '—', hint: 'Completed work orders' },
]

const upcoming = [
  { number: 'WO-2026-00021', client: 'Northstar Studio', status: 'Scheduled' },
  { number: 'WO-2026-00020', client: 'Harbour Dental', status: 'In progress' },
  { number: 'WO-2026-00019', client: 'Maple & Co.', status: 'New' },
]
</script>

<template>
  <section class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-sm font-medium text-muted-foreground">Overview</p>
        <h1 class="mt-1 text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p class="mt-2 max-w-2xl text-sm text-muted-foreground">
          Track work orders, workload, revenue, and operational alerts from one place.
        </p>
      </div>
      <Button disabled>Create work order</Button>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card v-for="metric in metrics" :key="metric.label">
        <CardHeader class="pb-2">
          <CardDescription>{{ metric.label }}</CardDescription>
          <CardTitle class="text-2xl">{{ metric.value }}</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-xs text-muted-foreground">{{ metric.hint }}</p>
        </CardContent>
      </Card>
    </div>

    <div class="grid gap-4 lg:grid-cols-[2fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Recent work orders</CardTitle>
          <CardDescription>Sample data until the Laravel API is connected.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div
            v-for="item in upcoming"
            :key="item.number"
            class="flex items-center justify-between gap-4 border-b pb-4 last:border-b-0 last:pb-0"
          >
            <div class="min-w-0">
              <p class="font-medium">{{ item.number }}</p>
              <p class="truncate text-sm text-muted-foreground">{{ item.client }}</p>
            </div>
            <Badge variant="secondary">{{ item.status }}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Operational alerts</CardTitle>
          <CardDescription>Items that will need attention.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-3 text-sm text-muted-foreground">
          <p>No live alerts yet.</p>
          <p>Once the API is connected, overdue and blocked work orders will surface here.</p>
        </CardContent>
      </Card>
    </div>
  </section>
</template>
