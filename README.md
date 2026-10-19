# Packly

A personal travel companion focused on **daily trip readiness**. Most travel apps answer
"how do I get there and where do I stay". Packly answers "what am I doing today, what am I
wearing, what am I eating, and what do I need to bring" in one glanceable daily view.

Packly is mobile-first: it's designed for a phone and steps up gracefully on larger screens.

## What it does

Everything in Packly belongs to a trip: a name, a start and end date, and the trip's time
zone. The app always shows your **active trip**, which is the one happening today or, if none
is, the next one to start.

- **Today** — the home screen. During a trip it reads "Day 3 in Lisbon"; before one, "Lisbon
  in 5 days" with a "Before you go" section. It summarises the other tabs: packing progress,
  today's planned outfits, and today's planned places to eat.
- **Packing** — a checklist for the trip, grouped by optional categories. Items can have a
  quantity (e.g. 3 of 5 socks packed).
- **Outfits** — pick a day of the trip and plan what to wear. Every day starts with a "Day
  outfit" and a "Night outfit", which can be renamed, deleted or added to, each with its own
  list of items.
- **Food** — save places to eat, then plan each one onto a day of the trip whenever you're
  ready.
- **Past trips** — once a trip is over, it moves to a read-only history (from the account
  menu) showing the packing list as you left it and every day's outfits and places.

Signed-out visitors see a landing page with a sample Today preview, and can sign up with
email and password.

## Tech stack

- [Next.js](https://nextjs.org) 16 (App Router, Server Components, Server Actions, Turbopack)
- React 19
- [Supabase](https://supabase.com) for the Postgres database and authentication
  (`@supabase/ssr` 0.12), with Row Level Security on every table
- Tailwind CSS v4
- TypeScript (strict)

There's no separate API server: data is read in Server Components and written through Server
Actions.

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

Create a project at [supabase.com](https://supabase.com), then run each file in
`supabase/migrations/` **in filename order** in the project's SQL editor. They create the
tables (`trips`, `packing_items`, `packing_categories`, `food_places`, `outfits`,
`outfit_items`), their security policies, and a trigger that gives every new trip day its
default outfits.

The app assumes email confirmation is turned off in Supabase Auth (sign-up signs you straight
in). If you turn it on, add `<your site>/auth/callback` to the project's allowed redirect URLs.

### 3. Add environment variables

Copy `.env.example` to `.env` and fill in the values from your Supabase project's API
settings:

| Variable | Required | What it is |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Your project's anon (public) key |
| `NEXT_PUBLIC_SITE_URL` | No | The site's public URL, used for email confirmation links. Falls back to the request's host. |

### 4. Run it

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server on port 3000 |
| `npm run build` | Build for production (doesn't run the linter) |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

There's no test suite yet.

## Project structure

```
app/
  (auth)/            Sign in and sign up
  (app)/             The signed-in app: dashboard (Today), packing, outfits, food, trips
  actions/           Server Actions that write to the database
  auth/callback/     Finishes email confirmation
components/          UI, grouped by feature (packing, outfits, food, trips, nav, …)
lib/                 Supabase clients, auth helpers, shared types and trip date logic
supabase/migrations/ SQL to set up the database, run by hand in order
proxy.ts             Refreshes the login session and redirects between public and signed-in pages
```

## Roadmap

- Copy a past trip's packing list into a new trip, with the ticks reset
- Deleting trips
- Offline support
- More sign-in options than email and password
