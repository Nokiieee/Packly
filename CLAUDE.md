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
app/actions/packing.ts       "use server" — addPackingItem / setPackedCount
app/(auth)/                  Route group: sign-in, sign-up, shared centered layout
app/auth/callback/route.ts   Exchanges the emailed one-time code for a session
app/(app)/                   Signed-in shell: header, tab bar, and the four tabs
app/(app)/{dashboard,packing,outfits,food}/   One page per tab
components/nav/              BottomNav (floating dock) + nav-icons (duotone outline set)
components/brand/logo.tsx    Packly mark + wordmark
components/app/screen.tsx    Screen title + EmptyState
components/app/account-menu.tsx  Avatar <details> menu holding sign-out
components/app/today-view.tsx   The Today composition, rendered from data alone
components/app/sample-trip.tsx  Authored demonstration trip — delete when trips are real
components/packing/packing-list.tsx  Client checklist; useOptimistic over the server-rendered list
components/auth/             AuthField (one labelled input), AuthForm (useActionState shell)
lib/supabase/{client,server,proxy}.ts   One Supabase client factory per runtime context
lib/auth/require-user.ts     Per-page auth gate
lib/auth/form-state.ts       AuthFormState shared by the actions and the form
lib/packing/types.ts         PackingItem + action result, shared across the "use server" line
lib/safe-redirect.ts         Rejects off-origin redirect targets
supabase/migrations/         Hand-written SQL, run by the user in the Supabase SQL editor
```

**Data pattern (packing is the reference).** The page (Server Component) reads the rows
with the per-request server client and passes them to a client list. Mutations are Server
Actions taking plain arguments that re-check `getUser()`, write, then `revalidatePath()` the
page; the client applies them through `useOptimistic` so taps feel instant. There is no
Supabase CLI or generated DB types — schema changes are new timestamped files in
`supabase/migrations/` that the user runs by hand, so tell them to whenever you add one.

Adding a tab means four edits: a page under `app/(app)/`, an entry in `TABS`
(`components/nav/bottom-nav.tsx`), an icon in `nav-icons.tsx`, and the route prefix in
`PROTECTED_PREFIXES` (`proxy.ts`). Miss the last one and the page is publicly reachable
until its own `requireUser()` catches it.

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
- **Every table ships with RLS** enabled and owner-scoped policies in the same migration that
  creates it (see `packing_items`). The anon key is in the browser, so RLS is the only thing
  between users' data.
- **Gate every page, not the layout.** `app/(app)/layout.tsx` does not check auth, because a
  layout does not re-run when the user moves between its own child routes. Each page awaits
  `requireUser()` instead.

## Design

The visual world is **Mint Companion** — the modern category-standard phone app, played
straight, chosen by the user on 2026-09-23 (replacing the earlier Enamel Wayfinding signage
world; don't reintroduce plates, condensed caps or signal red). Quality bar: Airbnb and Apple
Health / Fitness. Contract: `.impeccable/surfaces/app-app-layout-tsx.md`. System of record:
`DESIGN.md` (+ `.impeccable/design.json`). Product truth: `PRODUCT.md`.

Mode is Operate, mobile-first. Base styles target a phone; `sm:` only steps type up.

- **Tokens only.** Colours, shadows and the dock background are CSS variables in `globals.css`
  exposed via `@theme inline` (`bg-surface`, `text-muted`, `bg-brand`, `text-brand-text`,
  `bg-brand-soft`, `shadow-card`, …). Never hardcode a hex in a component (the suitcase
  illustration is an asset and exempt). Dark mode swaps the same variables — no `dark:` utilities.
- **One brand colour** (emerald): primary buttons, active tab, hero card, links. Text on it uses
  `text-brand-ink` (white by day, near-black at night — white fails on the night brand).
- **Amber (`todo`) means "still to do"** and nothing else. Errors use `danger`.
- **Shape:** cards `rounded-3xl` + `shadow-card` on the mint ground; icon tiles `bg-brand-soft`
  squircles; buttons and chips are pills; inputs `rounded-2xl`. No nested cards.
- **Type is Figtree** (variable), sentence case, bold/extrabold headings with slight negative
  tracking. `.tabular` for changing numbers.
- **Icons** (`nav-icons.tsx`): 24px, 1.75 stroke, round caps, plus a duotone `Body` that fills
  solid when an ancestor has `data-active`. New icons follow the same recipe; no emoji.
- **Motion** is state-only, 200ms `ease-out-quint`: press `active:scale-*` on tappables (the
  phone has no hover). `prefers-reduced-motion` is honoured globally.
- **Contrast:** text ≥4.5:1 on both `--ground` and `--surface` in both registers; UI
  boundaries ≥3:1.
- `app/layout.tsx` must keep `viewportFit: "cover"`, or `env(safe-area-inset-bottom)` is 0 on
  notched iPhones and the dock sits on the home indicator.
- `main` carries no max-width; each screen owns its column (`mx-auto max-w-2xl px-5`),
  `Screen` does this for you, and `pb-36` clears the dock.

## State of the repo

Email/password auth works end to end against a live Supabase project, and the four tab routes
render behind it in the Mint Companion world. The only table is `packing_items` (owned by a
user, not yet by a trip — there is no trips table); the Packing tab adds items and ticks
them packed against it. Packed state is `packed_count` out of `quantity` (1 for a plain
item); there is no `packed` column — derive it with `isPacked()` from `lib/packing/types.ts`. There are no tests. The Today screen renders **authored sample
data** (a Lisbon trip, day 3 of 7) labelled as such on the screen — including its packing
count, which does not read `packing_items` yet — replace it wholesale when trips become real.
Outfits and Food are empty states. `app/page.tsx` is still the untouched `create-next-app` landing
page, is publicly reachable, and does not carry the design system.

## Open decisions

Unsettled choices that shape code yet to be written. Resolve with the user rather than
assuming, and move the outcome into the relevant section once decided.

- **Persistence and offline behavior** — a travel app gets used with unreliable connectivity,
  so whether the client is local-first (and therefore needs a sync layer) or server-backed is
  a structural decision, not a later optimization. Packing is server-backed for now (no
  offline support); revisit before more data features pile onto that pattern.
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
