# Workspace App

A full-stack project management workspace imported from Lovable, running on Replit.

## Architecture

- **Frontend**: React + Vite (port 5000) with TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Express.js (port 3000) with TypeScript via `tsx`
- **Database**: Replit PostgreSQL via Drizzle ORM
- **Auth**: Supabase Auth (email/password, Google OAuth, password reset)

## How It Works

- Vite dev server runs on port 5000 (the webview port)
- Vite proxies `/api/*` requests to the Express backend on port 3000
- The Express backend authenticates each request by validating the Supabase JWT token
- Database operations (projects, tasks, notes, links) use Replit's Postgres via Drizzle ORM
- Auth flows (signup, login, password reset) still use Supabase Auth directly from the frontend

## Key Files

- `server/index.ts` — Express server entry point
- `server/routes.ts` — API route handlers
- `server/storage.ts` — Database storage interface
- `server/db.ts` — Drizzle database connection
- `shared/schema.ts` — Drizzle schema (projects, tasks, notes, links)
- `src/lib/api.ts` — Frontend API client helper
- `src/hooks/useAuth.tsx` — Supabase auth context
- `src/pages/` — All app pages
- `vite.config.ts` — Vite config with `/api` proxy to backend

## Running

The workflow `Start application` runs: `npm run server & npm run dev`

## Environment Variables

- `DATABASE_URL` — Replit PostgreSQL connection string (auto-set)
- `VITE_SUPABASE_URL` — Supabase project URL (in `.env`)
- `VITE_SUPABASE_PUBLISHABLE_KEY` — Supabase anon key (in `.env`)

## Database Schema

Tables: `projects`, `tasks`, `notes`, `links` — all with `userId` (Supabase user ID), timestamps.

To push schema changes: `npm run db:push`

## Features

- Dashboard with overview stats
- Projects with color labels
- Tasks with due dates, status (todo/completed), project filtering
- Calendar view of tasks by due date
- Notes with search and project grouping
- Link bookmarks with project grouping
- Dark/light mode toggle
- Supabase authentication (email + Google OAuth)
