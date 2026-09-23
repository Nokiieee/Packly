# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Travellers, during and around a trip — aimed at a real audience from the start, not a personal
tool.

The same person meets Packly in two distinct scenes, confirmed as roughly equal in weight:

- **Out and about, mid-trip.** Phone in hand, often one hand free, often bright daylight,
  usually rushed and checking one thing.
- **Sitting down in the evening, planning tomorrow.** Lower light, more patience, willing to
  work through a longer screen.

Design that only serves one of those scenes fails the other half of the use.

## Product Purpose

Packly answers daily trip readiness: *what am I doing today, what am I wearing, what am I
eating, and what do I need to bring?*

Success is a single daily view that tells a traveller everything they need to know and prepare
for today of their trip, readable at a glance.

## Positioning

Most travel apps solve logistics — how do I get there, where do I stay. Packly deliberately
does not. It owns the day itself.

The mechanism a logistics app could not truthfully copy: outfits, food and packing are all
bound to specific days of a trip and to each other, so "today" resolves into one answer rather
than four separate lists. A packing item and an outfit are the same object seen from two
angles.

## Operating Context

Used across a trip's lifecycle — before departure while packing, and daily while travelling.
Travel means connectivity is unreliable, and ambient light varies from direct sun to a dim
room within the same day.

## Capabilities and Constraints

Four product areas, confirmed:

- **Today (dashboard)** — a snapshot of the current trip day.
- **Packing Notes** — a checklist for everything to bring, with optional categories and a lazy
  per-item photo/instance model.
- **Outfit Planner** — assign one or more outfits to each day of the trip.
- **Food Planner** — a running list of meals, restaurants or dishes for the trip.

Built and working: email/password authentication on Supabase, the four routes, and the tab
navigation between them. Every feature screen is currently a placeholder.

Explicitly undecided, and not to be invented:

- Data model and database schema — none exists yet.
- Whether the client is local-first with a sync layer, or server-backed. Unresolved despite
  the connectivity constraint above.
- Trip scope: whether a user holds one active trip or many.
- Whether Packly ships as an installable PWA.

## Brand Commitments

The name **Packly**.

A modern, soft, rounded phone-app look. On 2026-09-23 the user rejected the earlier signage
direction and chose the category standard on purpose ("Mint Companion"): soft mint ground,
white rounded cards, one emerald brand colour, a floating iOS-style dock tab bar. Quality bar:
Airbnb and Apple Health / Fitness. Treat this as a standing preference — don't steer toward
unconventional worlds without being asked. The draft feature spec's palette remains non-binding.

## Evidence on Hand

No real trip data, user research, testimonials, press or imagery exists. Any traveller,
itinerary, packing list or photograph shown in the product is authored demonstration material
and must be labelled as such. Do not fabricate user counts, reviews or endorsements.

## Product Principles

1. **The day is the unit.** Every feature resolves to "what about today", not "what about the
   trip". Ambiguity is settled in favour of whatever keeps the daily view glanceable.
2. **Readiness, never logistics.** Flights, hotels and bookings are out of scope by choice;
   adding them would dissolve the product's reason to exist.
3. **One object, many views.** A packing item seen in an outfit is the same item, not a copy.
   Features that break that link break the mechanism.
4. **Survive both scenes.** Anything that only works in calm evening light, or only works in a
   three-second daylight glance, is half-built.
5. **Requirements come from the user's prompts**, not from the draft spec.

## Accessibility & Inclusion

No product-specific standard has been established. The daylight-glance scene makes contrast a
functional requirement rather than a compliance checkbox.
