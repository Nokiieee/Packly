---
version: 1
slug: "app-app-layout-tsx"
primary_target: "app/(app)/layout.tsx"
related_targets: ["components/nav/bottom-nav.tsx","components/app/screen.tsx","app/(auth)/layout.tsx","app/globals.css"]
---

Scope: the signed-in Packly app surface (shell, dock tab bar, the four tab screens) and the auth
screens that precede it. Visitor mode: Operate, mobile-first.

Audience: travellers, in two equally weighted scenes — a rushed one-handed glance in bright
daylight mid-trip, and an unhurried evening planning session in low light. Task: answer "what
about today" without reading.

## Direction contract

THESIS: Packly is a calm, friendly companion app that feels native on a phone — the category
standard, played straight at Airbnb / Apple Health craft. It refuses the previous Enamel
Wayfinding signage world outright; the user asked for a modern look and chose this on purpose.

OWN-WORLD: Soft mint wash ground (#EEF6F2), white cards with 24px corners and soft offset
shadows, deep emerald (#1F7A63) as the one brand colour on buttons, active tabs and the hero
card, mint tint (#D5EDE3) behind icon tiles. Figtree, one family, sentence case, bold headings.
Icons are rounded 1.75px outlines with a soft duotone body that fills solid when active. Amber
is reserved for "still to do". An authored soft suitcase illustration is the one picture.

STORY: The traveller opens Packly, reads "Day 3 in Lisbon" and the hero card's progress, scans
three plan rows (outfit, meals, packing), and taps the one with an amber chip.

FIRST VIEWPORT: Slim bar with the Packly mark and an avatar menu. Date line, then "Day 3 in
Lisbon" large. An emerald hero card: trip dates, day 3 of 7 dots, "8 left to pack", white pill
button to Packing, suitcase art at right. "Today's plan" heading, three white row cards. A white
floating dock (iOS style) hovers above the home bar.

FORM: Mint Companion — the category standard (canon), chosen by the user from direction round
e69d2b48 over the roll's Sky Glass. Quality bar: Airbnb, Apple Health / Fitness. Tab bar: dock
(reference #11). Code-led; no image generation this session.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the
verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

- Persistence and offline behaviour (local-first vs server-backed) is still undecided and will
  shape loading and empty states.
- No trip data model exists, so every screen below Today is an empty state.
