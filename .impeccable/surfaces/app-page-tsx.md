---
version: 1
slug: "app-page-tsx"
primary_target: "app/page.tsx"
related_targets: ["proxy.ts","components/app/today-view.tsx"]
---

# Root landing page

Mode: Persuade, mobile-first. Inherits Mint Companion unchanged; no DESIGN.md system change.

Audience: a signed-out traveller arriving from a shared link, usually on a phone. Job: understand
what Packly answers in one glance, then Sign up (or Log in if returning). Signed-in visitors never
see this page — proxy sends `/` to `/dashboard`.

Proof: the real Today composition rendered from the authored Lisbon sample trip, non-interactive,
labelled as a sample directly under it. No invented users, reviews, pricing or capabilities.

## Direction contract

THESIS: The page is the product's own Today screen, held up for inspection. It refuses the
category-default landing of icon-feature cards and a screenshot; the preview is live markup from
the same component the app renders, so the promise and the product cannot drift apart.

OWN-WORLD: Mint wash ground, one emerald primary pill, a white secondary pill on Card shadow,
Figtree extrabold with tight tracking, a large soft mint disc behind a white-bezelled screen.
No eyebrows, no feature grid, no second colour.

STORY: The visitor reads "Your trip, one day at a time", learns the four daily questions Packly
answers, sees a real-looking day answering them, and taps Sign up; a returning visitor taps Log in.

FIRST VIEWPORT: Phone: logo top-left; headline at ~42px spanning the column; one supporting
paragraph; Sign up (emerald) and Log in (white) as full-width stacked pills within the first
screen; the preview's top edge peeks below. Desktop (lg): two columns, copy and buttons left and
vertically centred, the bezelled Today preview right on the mint disc.

FORM: Canon product-led front door, position 1 on the ordered list, no seed key (user-pinned
structure: front door + labelled Today preview + redirect for signed-in visitors).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
