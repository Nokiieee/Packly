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
app/(app)/                   Signed-in shell: header, tab bar, and the four tabs
app/(app)/{dashboard,packing,outfits,food}/   One page per tab
components/nav/              BottomNav (tab bar) + nav-icons (filled signage pictograms)
components/signage/          The visual world's primitives: roundel, platform-row, arrow
components/app/screen.tsx    Screen nameplate + EmptyBoard
components/app/today-view.tsx   The Today composition, rendered from data alone
components/app/sample-trip.tsx  Authored demonstration trip — delete when trips are real
components/auth/             AuthField (one labelled input), AuthForm (useActionState shell)
lib/supabase/{client,server,proxy}.ts   One Supabase client factory per runtime context
lib/auth/require-user.ts     Per-page auth gate
lib/auth/form-state.ts       AuthFormState shared by the actions and the form
lib/safe-redirect.ts         Rejects off-origin redirect targets
```

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
- **Gate every page, not the layout.** `app/(app)/layout.tsx` does not check auth, because a
  layout does not re-run when the user moves between its own child routes. Each page awaits
  `requireUser()` instead.

## Design

The visual world is **Enamel Wayfinding** — vitreous enamel station signage. It was chosen by
the user from a direction round on 2026-09-22. The full contract — THESIS, OWN-WORLD, STORY,
FIRST VIEWPORT, FORM, FINISH — lives in `.impeccable/surfaces/app-app-layout-tsx.md`; read it
before changing anything visual. It names **no** signature interaction, so don't go looking for
one: the touch surface has no authored motion yet, which is a known gap rather than a missing
block. Product truth lives in `PRODUCT.md`.

`DESIGN.md` is the system of record for the shipped world — every token, radius, tracking value
and measured contrast pair, derived from the built code rather than from intentions, with
`.impeccable/design.json` as its machine-readable sidecar. The rules below are the short version;
`DESIGN.md` is what you check a value against, and its "Open questions" section lists the honest
gaps so nothing inherits them as if they were rules.

Mode is Operate, mobile-first. Base styles target a phone; `sm:` only steps type up.

- **The plate is the primitive**, not the card. A plate is a rectangular saturated sign with a
  hard edge (`rounded-[3px]` at most) and a white rule. Never a soft-cornered, shadowed card —
  that is the category default this world exists to refuse.
- **How a plate carries its rule depends on whether it bleeds.** A plate bounded on four sides
  (the auth head plate, the 48px pictogram tiles) takes the full inset rule,
  `shadow-[inset_0_0_0_Npx_var(--plate-rule)]`. A plate that runs off the viewport (the header,
  the day plate, the tab bar) has no side edges to set a rule inside, so its rule reads as the
  seam where it meets the next plate (`border-t-[3px] border-plate-rule`). Both are the same
  device; do not put a four-sided rule on a bleeding plate, where it would read as a border.
- **Palette law: signal red means "something is not yet done" and nothing else.** That covers a
  row that isn't finished and a form that can't submit. It ships as a red plate with white type,
  or as red text on the ground. It may never be red type on navy, where it falls to 2.7:1.
  Nothing else in the app is permitted to use it — it is not for emphasis, branding or delete.
- **Tokens only.** Colours come from the CSS variables in `globals.css`
  (`--ground`, `--ink`, `--muted`, `--plate`, `--plate-ink`, `--plate-rule`, `--plate-muted`,
  `--signal`, `--chalk`, `--hair`) via `@theme inline`. Never hardcode a hex in a component.
  The dark register is the same signage after dark and swaps the same variables — do not add a
  parallel set of `dark:` utilities.
- **Type is Barlow**, one family. `font-condensed` (Barlow Condensed) is the platform-indicator
  register: nameplates, day numerals, tab labels, buttons — always uppercase with tracking.
  Body copy is Barlow regular. `.tabular` for any number that changes.
- **Pictograms are filled silhouettes** in the AIGA/DOT register on a 24px grid, `fill="currentColor"`,
  no strokes (`components/nav/nav-icons.tsx`). A thin-stroke icon among these reads as a mistake.
  Never substitute emoji or a Unicode glyph.
- **Rows are platform rows** (`components/signage/platform-row.tsx`): pictogram bullet, name,
  status, solid arrow. Every navigable list is built from these.
- Transitions are 150–250ms and convey state only. `prefers-reduced-motion` is honoured globally
  in `globals.css`. The phone is the primary device and has no hover, so any motion that matters
  must fire on state change, not on hover.
- **Contrast is functional here, not compliance** — half the use is a daylight glance. Body and
  placeholder text clear 4.5:1; a UI boundary or a non-text mark (field borders, day ticks)
  clears 3:1. Check any new token pair against `--ground` *and* `--plate` in both registers.
- `app/layout.tsx` must keep `export const viewport = { viewportFit: "cover" }`, or
  `env(safe-area-inset-bottom)` resolves to 0 on notched iPhones and the tab labels land under
  the home indicator.
- Browser-owned surfaces are themed in `globals.css`: selection, caret, `accent-color`, and the
  iOS tap-highlight. Do not add custom scrollbars — product UI keeps native ones.
- `main` in `app/(app)/layout.tsx` deliberately carries **no** max-width or padding, so a screen
  can open with a full-bleed plate. Each screen owns its own reading column
  (`mx-auto max-w-2xl px-5`); `Screen` does this for you.

## State of the repo

Email/password auth works end to end against a live Supabase project, and the four tab routes
render behind it in the Enamel Wayfinding world. There is no database schema, no Packly domain
model and no tests. The Today screen renders **authored sample data** (a Lisbon trip, day 3 of
7) labelled as such on the screen — replace it wholesale when trips become real; the other
three screens are empty boards. `app/page.tsx` is still the untouched `create-next-app` landing
page, is publicly reachable, and does not carry the design system.

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
