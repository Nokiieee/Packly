---
version: 1
slug: "app-app-layout-tsx"
primary_target: "app/(app)/layout.tsx"
related_targets: ["components/nav/bottom-nav.tsx","components/app/screen.tsx","app/(auth)/layout.tsx","app/globals.css"]
---

Scope: the signed-in Packly app surface (shell, tab bar, the four tab screens) and the auth
screens that precede it. Visitor mode: Operate.

Audience: travellers, in two equally weighted scenes — a rushed one-handed glance in bright
daylight mid-trip, and an unhurried evening planning session in low light. Task: answer "what
about today" without reading. Constraint: contrast and glanceability are functional
requirements, not compliance. No binding brand commitments beyond the name.

## Direction contract

THESIS: Packly tells you today the way a station tells you where to stand — an enamel plate
read at arm's length, at a glance, by someone in a hurry. It refuses the travel-app default:
soft-cornered cards on a warm ground with a friendly geometric sans and a pastel accent.

OWN-WORLD: Vitreous enamel signage. Signage-white ground (#F5F6F3), enamel navy (#0F2E57) as
ink and chrome, one legislated accent — signal red (#D8232A), meaning "not done" and nothing
else, always a red plate with white type or red text on white, never red on navy. Chalk
(#D9DCD6) for ghosted/unreached. Barlow throughout, condensed cuts for platform indicators and
day numerals. The primitive is the plate — a rectangular sign with a thick white inner rule,
never a soft card. Rows are platform rows: roundel bullet, name, solid geometric arrow.
Pictograms are filled silhouettes in the AIGA/DOT register, not thin strokes.

STORY: The traveller opens Packly mid-street and reads the day number before reading anything
else, then sees three platform rows telling them what today needs. They believe the app is a
fixture, not an app. They tap the row that is still red.

FIRST VIEWPORT: A full-bleed navy enamel plate spans the top, thick white inner rule inside its
edge. On it: the bar-and-circle roundel with the trip name in small white caps, and beneath it
DAY 03 in condensed numerals at display scale with OF 07 set small alongside, unreached days as
chalk ticks. Below the plate, on signage white, three platform rows — Outfit, Meals, Packing —
each a band with a navy roundel bullet, its current state, and a solid arrow at the right edge.
Any row not yet done carries the red plate. The tab bar is a navy enamel plate fixed to the
bottom; the active tab is the white plate.

FORM: Enamel Wayfinding — vitreous enamel station signs and transit type programs. Candidate 1
of my ordered grounded list, taken as IMPECCABLE'S PICK over the roll's assignment (Care Label,
candidate 4), chosen by the user. Seed key 07eb5acb. Code-led: this harness has no image
generation, so there is no comp and the ambition rides in this contract.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the
verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

- Persistence and offline behaviour (local-first vs server-backed) is still undecided and will
  shape loading and empty states.
- No trip data model exists, so every screen below Today is a placeholder carrying the world
  rather than real content.
