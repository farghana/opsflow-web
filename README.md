# OpsFlow Web

Frontend for **OpsFlow**, an AI-assisted operations workspace that turns unstructured requests into trackable work.

This Vue application is the user-facing half of a full-stack portfolio project. It combines an operational dashboard, client management, work-order workflow, activity history, and a human-reviewed AI intake experience.

> This repository contains the Vue SPA. The Laravel API lives in `farghana/opsflow-api`.

## Product overview

OpsFlow is designed around a common operations problem: work arrives through calls, messages, emails, and notes, while teams still need consistent structured records.

A user can manage clients and work orders normally or paste a messy request into **AI Intake**. The backend uses Anthropic Claude to create a structured draft. OpsFlow then presents that draft for review and correction before the existing Work Order API is allowed to save anything.

## What the app demonstrates

- Vue 3 Composition API with `<script setup>`
- Vite-based frontend architecture
- Pinia state management
- Vue Router authentication guards
- Axios + Laravel Sanctum session authentication
- Responsive application shell and navigation
- Real server-side filtering, sorting, and pagination
- Accessible sortable table headers and operational status/priority badges
- Work Order create/edit/delete workflow
- Client and team-member selectors
- Overdue work visualization
- Work Order detail drawer and activity timeline
- Live tenant-scoped dashboard metrics
- AI Intake with confidence, warnings, editable review, and explicit human confirmation
- Vitest component/store coverage

## Main screens

### Dashboard

Shows live operational metrics from the authenticated organization, including open work, overdue work, high/urgent priorities, recently completed work, and recent Work Orders.

### Clients

Searchable, sortable, paginated client management with create/edit/delete workflows.

### Work Orders

The main operations screen provides:

- search and server-side filters
- client, status, priority, assignee, and overdue filtering
- sortable columns with visible direction indicators
- priority and workflow badges
- due-date and overdue indicators
- create/edit/delete actions
- detail view with activity history

### AI Intake

Users paste an unstructured request and receive a structured draft containing suggested client, assignee, title, description, priority, status, and due date.

The UI deliberately keeps a human in control:

```text
unstructured request
        ↓
   AI parse
        ↓
confidence + warnings
        ↓
 editable review form
        ↓
 human confirmation
        ↓
normal validated Work Order API
```

The browser never receives the Anthropic API key and never calls Anthropic directly.

## Tech stack

| Area | Technology |
| --- | --- |
| Framework | Vue 3 |
| Build tooling | Vite |
| State | Pinia |
| Routing | Vue Router |
| HTTP | Axios |
| UI components | shadcn-vue / Tailwind CSS |
| Testing | Vitest |
| Backend | Laravel 12 + PostgreSQL |
| Authentication | Laravel Sanctum |
| AI provider | Anthropic Claude through the backend |

## Local setup

```bash
npm install
```

Create a local `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Run the Laravel API on port 8000, then start the frontend:

```bash
npm run dev
```

The local SPA normally runs at `http://localhost:5173`.

## Tests

```bash
npm test
```

## Authentication flow

OpsFlow uses Laravel Sanctum's stateful SPA authentication. Axios sends credentials to the Laravel origin, obtains the Sanctum CSRF cookie, and restores the authenticated user when the application reloads. Protected routes redirect unauthenticated users to login.

For local development, keep the frontend/backend hostnames consistent (for example, use `localhost` for both) so browser cookies behave predictably.

## Backend architecture

The Laravel API owns authentication, tenancy, validation, PostgreSQL persistence, operational metrics, and all Anthropic communication. AI output is never trusted as a direct database command; the frontend only receives a reviewable draft.

Repository: `farghana/opsflow-api`

## Portfolio focus

OpsFlow is intentionally more than a collection of CRUD pages. The project is meant to demonstrate end-to-end product engineering: relational domain modelling, tenant isolation, secure SPA authentication, API design, automated tests, operational UX, and practical AI integration with a human-in-the-loop safety boundary.

## Next presentation milestones

- deterministic demo seed data
- polished product screenshots
- architecture graphic
- hosted demo
- GitHub profile showcase
