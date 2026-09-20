# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Product

This repo is becoming **Packly**, a personal travel companion app focused on **daily trip
readiness** rather than logistics. Most travel apps answer "how do I get there and where do I
stay"; Packly answers "what am I doing today, what am I wearing, what am I eating, and what do
I need to bring."

Core value proposition: a single daily view that tells the user everything they need to know
and prepare for *today* of their trip. When a design or scoping call is ambiguous, favor the
reading that keeps that one daily view simple and glanceable.

## Where requirements come from

**The user's prompts are the source of truth.** A feature-spec draft exists outside the repo
(in the user's Downloads); it is actively being revised and is *not* authoritative. Do not copy
it into the repo, cite it as settled, or build from details found in it unless the user points
at that part directly. Treat anything from it as background only.

## Keeping this file current

Treat this file as part of the deliverable. After any change to the repo — yours or the
user's — update the sections below so they still describe reality, in the same pass as the
change, not as a follow-up. Also reconcile it when you notice the working tree has drifted
from what's written here.

Update when a change touches: scripts in `package.json` (Commands), dependency or framework
versions (Stack specifics), the addition of a test runner, new top-level directories or an
architectural layer worth knowing before reading code (State of the repo), path aliases, or
any convention a future session would otherwise get wrong. Do not log routine feature work,
bug fixes, or file-by-file inventory — this file is orientation, not a changelog.

## Commands

```bash
npm run dev     # Turbopack dev server on :3000
npm run build   # production build (does NOT lint)
npm run start   # serve the production build
npm run lint    # eslint (flat config); `next lint` was removed in Next 16
npx next typegen  # regenerate route-typed globals (PageProps/LayoutProps/RouteContext)
```

No test runner is configured yet.

`next dev` writes its PID/port/URL to `.next/dev/lock`; a second `next dev` prints the
already-running server's URL instead of starting a duplicate. It also forwards browser
console errors/warnings to the terminal, so client-side failures are visible without a browser.

## Architecture

**Next.js full-stack with Supabase.** There is no separate API server — data access and auth
run through Server Components, Server Actions and Route Handlers.

```
proxy.ts                     Session refresh + redirect gating (Next 16's middleware)
app/actions/auth.ts          "use server" — signIn / signUp / signOut
app/(auth)/                  Route group: sign-in, sign-up, shared centered layout
app/auth/callback/route.ts   Exchanges the emailed one-time code for a session
app/dashboard/               Protected; re-verifies the user itself
components/auth/             AuthField (one labelled input), AuthForm (useActionState shell)
lib/supabase/{client,server,proxy}.ts   One Supabase client factory per runtime context
lib/auth/form-state.ts       AuthFormState shared by the actions and the form
lib/safe-redirect.ts         Rejects off-origin redirect targets
```

Environment: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, optional
`NEXT_PUBLIC_SITE_URL`. See `.env.example`; `.gitignore` ignores `.env*` but un-ignores it.

### Auth rules that are easy to get wrong

- **`"use server"` files may only export async functions.** Exporting a const or object from
  one fails at build time, not at typecheck — that's why `AuthFormState` and
  `initialAuthFormState` live in `lib/auth/form-state.ts` rather than beside the actions.
- **Proxy is a convenience redirect, not a security boundary.** Server Actions are POSTs to
  whatever route renders them, so a matcher change can silently drop coverage. Every action
  and every protected page calls `supabase.auth.getUser()` for itself.
- **Use `getUser()`, never `getSession()`, on the server.** `getSession()` trusts the cookie;
  `getUser()` validates the token with Supabase.
- **`setAll` takes `(cookies, headers)` in `@supabase/ssr` 0.12.** The second argument carries
  no-store cache headers that must be applied to any response writing auth cookies. Tutorials
  written for 0.5/0.6 omit it.
- **Never hoist a Supabase server client to module scope** — one per request, or sessions leak
  between users.
- **`process.env.NEXT_PUBLIC_*` must be read as a static property.** Dynamic indexing isn't
  inlined into the client bundle and reads as `undefined` there (see `lib/supabase/env.ts`).
- Redirect targets from query strings always go through `safeRedirect()`.

## State of the repo

Email/password auth is built and the production build passes. There is no database schema, no
Packly domain model, and no tests. `app/page.tsx` is still the untouched `create-next-app`
landing page and is publicly reachable.

## Open decisions

Unsettled choices that shape code yet to be written. Resolve with the user rather than
assuming, and move the outcome into the relevant section once decided.

- **Persistence and offline behavior** — a travel app gets used with unreliable connectivity,
  so whether the client is local-first (and therefore needs a sync layer) or server-backed is
  a structural decision, not a later optimization.
- **Row Level Security** — no tables exist yet. Every Packly table needs RLS enabled with
  owner-scoped policies from the moment it is created; the publishable key is in the browser,
  so RLS is the only thing standing between users' data.
- **OAuth providers** — only email/password is wired up so far.

## Stack specifics that differ from older Next.js/Tailwind

Next.js **16.3.5**, React 19.2, Tailwind **v4**, TypeScript strict, `@supabase/ssr` **0.12**.
Read the version-matched
docs under `node_modules/next/dist/docs/` before writing framework code — in particular
`01-app/02-guides/upgrading/version-16.md`, which covers every item below.

- **Request APIs are async-only.** `cookies()`, `headers()`, `draftMode()`, and `params` /
  `searchParams` in `page`/`layout`/`route`/`default` and metadata image files must be awaited.
  Synchronous access was removed (not just deprecated).
- **Route-typed prop globals.** Typed helpers `PageProps<'/blog/[slug]'>`, `LayoutProps<'/'>`,
  and `RouteContext<...>` are generated globals — no import. `app/layout.tsx` already uses
  `LayoutProps<"/">`. Run `next typegen` if they go stale.
- **`middleware.ts` → `proxy.ts`**, exporting `proxy()`. Node.js runtime only; `edge` is not
  supported there. Config flags renamed accordingly (`skipMiddlewareUrlNormalize` →
  `skipProxyUrlNormalize`).
- **Turbopack is the default** for dev and build; bundler config belongs at top-level
  `turbopack` in `next.config.ts`, not `experimental.turbo`.
- **Caching:** `experimental.dynamicIO` / `experimental.useCache` are gone — the top-level
  `cacheComponents` flag replaces them. `revalidateTag` semantics changed, and `updateTag` /
  `refresh` are new.
- **`next/image`:** local images with query strings, `minimumCacheTTL`, `imageSizes`,
  `qualities`, and redirect limits all changed defaults or behavior; `images.domains` and
  `next/legacy/image` are deprecated.
- **Tailwind v4 is CSS-first.** There is no `tailwind.config.*`; theme tokens live in the
  `@theme inline` block of `app/globals.css` and PostCSS is wired via `@tailwindcss/postcss`.
  Add design tokens there (the CSS vars `--background`/`--foreground` feed `bg-background` etc.).
- **ESLint uses flat config** (`eslint.config.mjs`, `eslint-config-next/core-web-vitals` +
  `/typescript`). `next build` no longer runs it, so run `npm run lint` explicitly.

`@/*` maps to the repo root, so imports look like `@/app/...`.
