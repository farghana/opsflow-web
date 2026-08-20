# OpsFlow Web

OpsFlow is a multi-tenant SaaS operations platform for service businesses. This repository contains the Vue frontend for managing clients, work orders, assignments, reporting, billing workflows, and AI-assisted intake.

## Frontend stack

- Vue 3
- JavaScript
- Vite
- Pinia
- Vue Router
- Tailwind CSS
- shadcn-vue
- Axios
- Vitest

## Product goals

OpsFlow is designed to demonstrate production-style SaaS patterns rather than simple CRUD screens. The frontend will include:

- authenticated application shell
- role- and permission-aware navigation
- advanced server-side tables with search, filters, sorting, and pagination
- URL-persisted filtering
- dashboard metrics and charts
- work-order timelines, comments, and attachments
- AI-assisted intake with human review before persistence
- responsive and accessible UI

## Architecture

The frontend is a standalone Vue SPA that communicates with the Laravel API in [`opsflow-api`](https://github.com/farghana/opsflow-api) over REST.

```text
Vue 3 SPA
   |
   | REST / JSON
   v
Laravel API
   |
   v
PostgreSQL
```

## Engineering conventions

- Vue Composition API with `<script setup>`
- feature-oriented components and composables
- Pinia for application-level state
- API access isolated in `src/api`
- no business logic embedded in presentation components
- reusable table/filter patterns where appropriate
- tests added alongside important behavior

## Planned application areas

- Authentication
- Dashboard
- Clients
- Work Orders
- Team / Assignments
- Activity Timeline
- Attachments
- Reporting
- Invoices
- AI Intake
- Organization Settings

## Status

Early development. The initial milestone is authentication, organization tenancy, client management, and the core work-order workflow.
