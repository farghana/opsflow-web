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

## Screenshots

### Dashboard

The dashboard gives a quick view of open work, overdue items, priorities, recently completed work, and anything that needs attention.

![OpsFlow dashboard](https://github.com/user-attachments/assets/0643519b-af68-40c1-a7f6-2e29e1b8d034)

### Work orders

The main work queue includes search, filters, sorting, assignments, priorities, due dates, and overdue highlighting.

![OpsFlow work orders](https://github.com/user-attachments/assets/861760e1-75aa-4474-ab32-af7f0860c9a4)

### AI intake

A free-text request is turned into an editable draft. The user can review the client, assignee, status, priority, due date, and description before creating the work order.

![OpsFlow AI intake](https://github.com/user-attachments/assets/f140c8e1-e2f2-4c96-8b2d-0627d320885d)

### Clients

Clients are kept in a simple searchable directory and can be used throughout the work-order workflow.

![OpsFlow clients](https://github.com/user-attachments/assets/c46e0925-a32e-458c-8cc9-4ca39d66cf82)

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
