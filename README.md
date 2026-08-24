# OpsFlow

OpsFlow is an operations management app I built to explore how AI can be useful in a real workflow instead of just adding a chatbot to an app.

Teams can manage clients and work orders, assign work, track deadlines and statuses, and get a quick view of what needs attention from the dashboard.

One feature I wanted to experiment with was AI-assisted intake. Instead of filling out a work order manually, you can paste a request such as:

> Northstar called about the broken display in reception. It needs to be fixed by Friday and it's urgent. Assign it to Alex.

OpsFlow uses Claude to turn that into a draft work order. The user can review and change everything before saving it.

## Features

- Client management
- Work orders and assignments
- Status and priority tracking
- Due dates and overdue work
- Activity history
- Operations dashboard
- AI-assisted work order intake
- Multi-tenant organizations
- Authentication

## Built with

**Frontend:** Vue 3, Vite, Pinia, Vue Router, Tailwind CSS, shadcn-vue  
**Backend:** Laravel 12, PostgreSQL, Sanctum  
**AI:** Anthropic Claude  
**Testing:** Vitest and Pest

## AI intake

This was the most interesting part of the project to build.

Claude doesn't create a work order directly. It turns the original request into a suggested draft and tries to match the client and assignee against the organization's existing data.

The user reviews the result before anything is saved:

```text
Request → AI draft → Review/edit → Create work order
```

This makes the AI useful while keeping the final decision with the user.

## Running locally

Install the frontend dependencies:

```bash
npm install
```

Create `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Start the app:

```bash
npm run dev
```

The Laravel API should be running on `http://localhost:8000`.

## Tests

```bash
npm test
```

## Backend

The Laravel API is in the `farghana/opsflow-api` repository.

## Screenshots

Coming soon.
