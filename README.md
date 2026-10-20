# IDC Creative CRM

A custom CRM built specifically for a Creative Agency — tracking Accounts, Contacts, Deals through an agency pipeline, with activity logs, task management, and a revenue dashboard.

## Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** — dark/light mode, brand indigo palette
- **Supabase** — PostgreSQL + realtime
- **@dnd-kit** — drag-and-drop Kanban
- **Recharts** — revenue forecast & pipeline charts
- **Lucide React** — icons

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Open the SQL editor and run the full schema in [`supabase/schema.sql`](./supabase/schema.sql)
3. Copy your project URL and anon key from **Settings → API**

### 2. Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

| Area | What you get |
|---|---|
| **Dashboard** | Pipeline value, win rate, active deals, revenue forecast chart, pipeline donut |
| **Pipeline** | Drag-and-drop Kanban board across 6 agency stages |
| **Deals** | Table view with search & stage filter, slide-over detail panel |
| **Accounts** | Card grid of client companies |
| **Contacts** | Table with email/phone, linked accounts |
| **Tasks** | To-do list, linked to deals, overdue highlighting |
| **Activity log** | Per-deal timeline of Emails, Calls, Meetings, Notes |

## Pipeline Stages

1. Lead Captured
2. Discovery & Scoping
3. Proposal Sent
4. Negotiation
5. Closed Won
6. Closed Lost

## GitHub + Deploy

```bash
git init
git add .
git commit -m "Initial CRM build"
gh repo create SmatCreative/idc-creative-crm --public --source=. --push
```

Deploy to Vercel:

```bash
npx vercel
```

Add your Supabase env vars in the Vercel dashboard.
