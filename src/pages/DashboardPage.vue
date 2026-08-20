<template>
  <section class="space-y-6">
    <div>
      <p class="text-sm font-medium text-slate-500">Overview</p>
      <h1 class="mt-1 text-3xl font-semibold tracking-tight text-slate-950">Dashboard</h1>
      <p class="mt-2 text-sm text-slate-600">
        OpsFlow will surface work orders, workload, revenue, and operational alerts here.
      </p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="metric in metrics"
        :key="metric.label"
        class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <p class="text-sm font-medium text-slate-500">{{ metric.label }}</p>
        <p class="mt-2 text-2xl font-semibold text-slate-950">{{ metric.value }}</p>
      </article>
    </div>
  </section>
</template>

<script setup>
const metrics = [
  { label: 'Open work orders', value: '—' },
  { label: 'Due this week', value: '—' },
  { label: 'Overdue', value: '—' },
  { label: 'Revenue this month', value: '—' },
]
</script>
