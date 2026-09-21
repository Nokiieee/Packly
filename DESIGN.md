---
name: Packly
description: Daily trip readiness read the way a station tells you where to stand.
colors:
  ground: "#f5f6f3"
  ink: "#0f2e57"
  muted: "#4a5d74"
  hair: "#dfe2dc"
  plate: "#0f2e57"
  plate-ink: "#ffffff"
  plate-rule: "#ffffff"
  plate-muted: "#a9c0da"
  signal: "#d8232a"
  signal-ink: "#ffffff"
  chalk: "#c3cbc0"
  tick-ahead: "#647e9f"
  night-ground: "#05101c"
  night-ink: "#f2f4f0"
  night-muted: "#9fb3c8"
  night-hair: "#33628f"
  night-plate: "#14406e"
  night-chalk: "#4e6e91"
  night-tick-ahead: "#7e9cbe"
typography:
  display:
    fontFamily: "Barlow Condensed, ui-sans-serif, system-ui, sans-serif"
    fontSize: "5.5rem"
    fontWeight: 700
    lineHeight: 0.78
    letterSpacing: "normal"
    fontFeature: "tabular-nums"
  headline:
    fontFamily: "Barlow Condensed, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.02em"
  title:
    fontFamily: "Barlow Condensed, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.04em"
  body:
    fontFamily: "Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Barlow Condensed, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.12em"
  badge:
    fontFamily: "Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.12em"
rounded:
  tick: "1px"
  plate-sm: "2px"
  plate-md: "3px"
spacing:
  xs: "6px"
  sm: "12px"
  md: "16px"
  gutter: "20px"
  lg: "24px"
  xl: "28px"
  tab-clearance: "144px"
components:
  button-primary:
    backgroundColor: "{colors.plate}"
    textColor: "{colors.plate-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.plate-sm}"
    padding: "12px 16px"
    width: "100%"
  button-primary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.plate-ink}"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.plate-muted}"
    typography: "{typography.label}"
    rounded: "{rounded.plate-sm}"
    padding: "6px 10px"
  button-quiet-hover:
    textColor: "{colors.plate-ink}"
  input-field:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.plate-sm}"
    padding: "10px 12px"
    width: "100%"
  badge-not-done:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.signal-ink}"
    typography: "{typography.badge}"
    rounded: "{rounded.plate-sm}"
    padding: "4px 8px"
  pictogram-tile:
    backgroundColor: "{colors.plate}"
    textColor: "{colors.plate-ink}"
    rounded: "{rounded.plate-md}"
    size: "48px"
  tab-active:
    backgroundColor: "{colors.plate-rule}"
    textColor: "{colors.plate}"
    typography: "{typography.label}"
    rounded: "{rounded.plate-md}"
    padding: "8px 4px"
    height: "56px"
  tab-inactive:
    backgroundColor: "transparent"
    textColor: "{colors.plate-muted}"
    typography: "{typography.label}"
    rounded: "{rounded.plate-md}"
    padding: "8px 4px"
    height: "56px"
---

# Design System: Packly

## Overview

**Creative North Star: "Enamel Wayfinding"**

Packly is drawn as vitreous enamel station signage. A saturated navy plate, a thick white
rule, one grotesque, and exactly one accent that means exactly one thing. The interface reads
as a fixture the traveller walks up to, not an app they operate: the day number is the largest
object on the screen and everything below it is a departure line. It refuses the travel-app
default it was defined against — soft-cornered cards floating on a warm ground, a friendly
geometric sans, a pastel accent.

The build carries two registers because the product is used in two scenes of equal weight: a
rushed one-handed glance in direct sun, and an unhurried evening in a dim room. The same
variable names carry both; the night register is the same signage after dark, not a second
theme. Contrast is treated as a functional requirement of reading a sign at arm's length, and
every pair in the palette was measured against both `--ground` and `--plate` in both registers.

Density is generous rather than packed. Rows are tall enough for a thumb (48px pictogram tile,
16px vertical padding), the shell reserves a single 20px gutter, and content columns cap at
`max-w-2xl`. Nothing is decorative: there is no shadow, no gradient, no soft corner, and no
motion beyond 200ms colour transitions.

**Key Characteristics:**
- The plate is the only container primitive — a rectangle with a white rule, never a card.
- One accent, legislated: signal red means "not yet done" and nothing else.
- Two type registers: Barlow reads, Barlow Condensed indicates.
- Corners are effectively square (1–3px); depth is flat, by plate against ground.
- Filled AIGA/DOT pictograms only; no thin-stroke icons, no emoji, no Unicode glyphs.

## Colors

A signage palette: one near-white ground, one enamel navy that serves as both ink and chrome,
and one legislated red.

### Primary
- **Enamel Navy** (`{colors.ink}` / `{colors.plate}`): the same value does double duty — body
  ink on the ground, and the fill of every chrome plate (header, day plate, tab bar, pictogram
  tiles, primary button). 12.5:1 on the day ground. In the night register the plate lightens to
  `{colors.night-plate}` while the ink inverts to `{colors.night-ink}`; they stop being the same
  value after dark, which is why they are separate tokens.

### Secondary
- **Signal Red** (`{colors.signal}`): the one accent. 4.64:1 as text on the day ground, 5.03:1
  as white type on the red plate. Deliberately identical in both registers.

### Neutral
- **Signage White** (`{colors.ground}`): the page. The wall the signs are bolted to.
- **Plate White** (`{colors.plate-rule}` / `{colors.plate-ink}`): the rule inside or along the
  edge of every plate, the type on it, and the active-tab fill.
- **Slate Muted** (`{colors.muted}`): prose subordinate to a nameplate — subtitles, row status,
  hints, placeholders. 6.27:1 as a placeholder on the day ground.
- **Plate Muted** (`{colors.plate-muted}`): the same subordinate role on navy — "OF 07 DAYS",
  inactive tab labels, past day ticks. 7.23:1 on the plate.
- **Hair** (`{colors.hair}`): the 2px divider under a platform row.
- **Chalk** (`{colors.chalk}`): unreached, unchecked, not yet yours — the pictogram on an empty
  board.
- **Tick Ahead** (`{colors.tick-ahead}` / `{colors.night-tick-ahead}`): days still to come on the
  day strip. Per-register rather than one opacity, because 3.26:1 on the day plate and 3.71:1 on
  the night plate could not be reached by one value.

### Named Rules

**The Palette Law.** Signal red means one thing: something is not yet done — a row that isn't
finished, a form that can't submit. Not emphasis, not brand, not delete, not danger in general.
It ships as a red plate with white type, or as red text on the ground. Never red type on navy,
where it falls to 2.7:1.

**The Register-Independent Signal Rule.** `--signal` is not brightened for the night register.
Brightening it to #e8434a drops white type on the NOT DONE plate to 3.94:1, under the floor for
11px uppercase — and that badge is the one element the Palette Law exists to protect. The
single value holds 5.03:1 against white in both registers.

**The Two-Ground Test.** Every new token pair is checked against both `--ground` and `--plate`,
in both registers, before it ships. Body and placeholder text clear 4.5:1; UI boundaries and
non-text marks clear 3:1.

## Typography

**Display Font:** Barlow Condensed (500/600/700), loaded via `next/font`
**Body Font:** Barlow (400/500/600/700)
**Label Font:** Barlow Condensed, uppercase, tracked

**Character:** Barlow is drawn from American public-signage letterforms — the same grotesque
lineage as the transit type programs this interface is built on. The condensed cut against the
roman gives the system its two voices: one that reads, one that indicates.

### Hierarchy
- **Display** (Condensed 700, 5.5rem, line-height 0.78, tabular): the day numeral only,
  zero-padded, on the day plate. The largest object in the product.
- **Headline** (Condensed 700, 2.25rem / 3rem at `sm`, tracking 0.02em, uppercase): the screen
  nameplate over a 3px rule. The only place type steps up on a wider viewport.
- **Title** (Condensed 600, 1.5rem, tracking 0.04em, uppercase): the destination name on a
  platform row.
- **Body** (Barlow 400, 0.875rem/1.5): subtitles, row status prose, footers, empty-board copy.
  Capped at `max-w-prose` under a nameplate and `max-w-xs` on an empty board.
- **Label** (Condensed 600, 0.8125rem, tracking 0.10–0.14em, uppercase): tab labels, field
  labels, buttons, the trip name on the roundel line (tracking 0.20–0.22em at the smallest
  sizes).
- **Badge** (Barlow 600, 0.6875rem, tracking 0.12em, uppercase): the NOT DONE plate. The one
  place the reading face goes uppercase, because it sits inside a coloured plate, not a
  nameplate.

### Named Rules

**The Two Registers Rule.** Barlow reads; Barlow Condensed indicates. Condensed uppercase with
tracking is the platform-indicator register, reserved for nameplates, day numerals, tab labels,
buttons, and any count. Prose never goes condensed. `PlatformRow` enforces this in its API: a
`tally` prop renders condensed and tabular, a `status` prop renders in the reading face.

**The Fixed-Column Numeral Rule.** Anything that counts — day numerals, tallies — carries
`.tabular` (`font-variant-numeric: tabular-nums`). Signage numerals do not wobble as they
change.

## Layout

Mobile-first; base styles target a phone and `sm:` only steps the nameplate up. Content columns
cap at `max-w-2xl` (auth at `max-w-sm`) and are centred with a 20px gutter (`px-5`), which is the
one horizontal measure in the system. Desktop is the phone layout centred with air around it —
there is no wider composition, and that is a known limit rather than a decision.

Vertical rhythm runs on a 4px base with a small set of reused steps: 6px between a pictogram
tile's neighbours and the day ticks, 12px for plate padding, 16px for row gaps, 24–28px between
sections and above the first row block. `main` carries 144px of bottom padding to clear the
tab plate, which is fixed and out of flow.

The shell is a stack of plates. The header plate, a screen's own full-bleed plate, and the tab
plate each run edge to edge; `main` carries no column of its own so that a screen opening with a
full-bleed plate gets the full width and pads itself. The tab plate's bottom padding is
`max(0.625rem, env(safe-area-inset-bottom))`, which requires `viewportFit: "cover"` in the
root viewport export — without it the inset resolves to 0 on notched iPhones and the labels
sit under the home indicator.

## Elevation & Depth

There are no shadows in this system. Depth is figure-on-wall: a saturated plate against a
near-white ground, separated by a white rule. The single `box-shadow` in the build is not a
shadow at all — `inset 0 0 0 Npx var(--plate-rule)` draws the enamel rule inside a plate's edge.

Because the night register has no near-white ground to work against, the plate-to-ground step
after dark is a luminance step, not a contrast ratio: night plate on night ground measures
**1.81:1**. That is below the 3:1 UI floor and is recorded as the real figure. It was accepted
on visual evidence in the night captures — two large adjacent fields separate at a luminance
step that a small UI part could not rely on, and the inset white rule does the remaining
separating. Do not generalise 1.81:1 to any UI part, boundary or mark; the floor for those is
still 3:1.

### Named Rules

**The Plate Rule, Conditional on Bleed.** The plate is the primitive, never a soft card. A plate
bounded on four sides — the auth head plate, the 48px pictogram tile — carries the full inset
white rule (`inset 0 0 0 2–3px var(--plate-rule)`). A plate that runs off the viewport — header,
day plate, tab bar — has no side edge for a rule to sit inside, so its rule reads as the seam
where it meets the next plate (`border-top: 3px solid var(--plate-rule)`). These are the same
device in two conditions, not a rule and an exception. Forcing a four-sided rule onto a bleeding
plate would produce an inset box reading as a border — the object this world refuses.

## Shapes

Corners are effectively square. The scale stops at 3px (`{rounded.plate-md}` on pictogram tiles
and tab plates), 2px (`{rounded.plate-sm}` on buttons, fields and badges) and 1px on the day
ticks — just enough to keep a rendered rectangle from looking chipped, never enough to read as
rounding. Nothing in the system is a pill, a circle, or a soft card.

Strokes are thick and hard: 3px for a rule or seam (nameplate underline, plate boundary, auth
board), 2px for a field border, a status box, and the divider under a platform row. The auth
board is a 3px navy border with its top edge removed so the head plate and the board read as one
assembly.

The recurring silhouette is the horizontal band: a plate, a row, a rule, a tick strip. The only
curved form in the product is the roundel — a filled annulus crossed by a bar — and it appears
only as the app's mark and the Today tab pictogram.

## Components

### Buttons
- **Shape:** effectively square (2px).
- **Primary:** navy plate, white condensed uppercase label tracked 0.14em, full width, 12px/16px
  padding. Disabled drops to 55% opacity while pending.
- **Hover / Focus:** background shifts to `{colors.ink}` over 200ms ease-out; focus shows a 2px
  ink ring offset 2px from the ground.
- **Quiet (on a plate):** no fill, `{colors.plate-muted}` label, hovering to a 10% white wash and
  white type. Used for Sign out in the header.

### Cards / Containers
There are no cards. The container is the plate (see The Plate Rule, Conditional on Bleed) and
the empty board — a rectangle outlined at 2px in 20%-opacity ink, 24px/56px padding, holding a
chalk pictogram at 64px over a centred line of muted prose. An empty board teaches the screen; it
does not announce that nothing is there.

### Inputs / Fields
- **Style:** transparent fill, hard 2px border at `border-ink/60` (3.84:1), 2px corners, 12px
  horizontal padding, 16px text. Label above in condensed uppercase tracked 0.14em.
- **Focus:** border goes full ink, plus a 2px ink ring offset 1px from the ground, 200ms.
- **Error:** border goes signal, the ring goes signal, and the message prints as signal text
  below the field at 0.75rem — red on the ground, per the Palette Law. Form-level failure prints
  as a red plate with white type instead.
- **Placeholder:** full-strength `{colors.muted}`, not a faded ink (6.27:1).

### Navigation
The tab bar is an enamel plate bolted to the bottom edge — a fixture, not a floating control.
Four tabs, each with a filled pictogram and a condensed uppercase label, because Packing and
Outfits are both clothes-adjacent and unlabelled icons made users guess. The plate runs off the
viewport, so its rule is a 3px white top seam. The active tab is the single accent of the chrome:
a white plate with navy pictogram and label, carrying `aria-current="page"`. Inactive tabs are
`{colors.plate-muted}` and hover to a 10% white wash. Minimum tab height 56px.

### Platform Row
The signature component. Every navigable list in Packly is built from these, the way a concourse
board is built from departure lines: a 48px navy pictogram tile with its inset white rule, the
destination in condensed uppercase, either a prose status or a tabular tally beneath it, an
optional NOT DONE red plate, and a solid geometric arrow at the right edge. Rows are separated by
a 2px hair rule. Hover washes the row at 4% plate and nudges the arrow 4px right over 200ms.

**The Square Tile Deviation (cited).** The direction contract specifies "a navy roundel bullet"
for this row; the build ships a 48px square navy plate carrying a filled pictogram instead. The
reason: a pictogram carries more information than a bar-and-circle can, and the plate is the
world's primitive, so the square tile inherits the inset white rule that every other bounded
plate carries. The roundel keeps its own job as the identity mark.

### Pictograms
Filled silhouettes in the AIGA/DOT register on a 24px grid — solid shapes, no strokes, high
contrast, legible small and in sun. A thin-stroke icon among these reads as a mistake. Arrows are
solid geometric wedges drawn the way signage draws one.

### Roundel
The bar-and-circle: a filled annulus crossed by a full-width bar, with the name set on the bar in
tracked uppercase at 0.78em of the mark. It is the identity device of the system, used as the
app's mark on the header and auth head plates and as the Today tab pictogram. In the shipped
build it never reaches sign scale.

## Do's and Don'ts

### Do:
- **Do** build every container as a plate, and pick its rule by whether it bleeds: inset white
  rule when bounded on four sides, 3px white top seam when it runs off the viewport.
- **Do** reserve signal red for "not yet done", as a red plate with white type or red text on the
  ground.
- **Do** keep `--signal` identical in both registers.
- **Do** split prose from counts: prose in Barlow, any count in Barlow Condensed with `.tabular`.
- **Do** check every new token pair against both `--ground` and `--plate` in both registers —
  4.5:1 for body and placeholder text, 3:1 for boundaries and non-text marks.
- **Do** draw new pictograms as filled silhouettes on the 24px grid.
- **Do** cite a deviation from the direction contract in this file, the way the square pictogram
  tile is cited. An uncited deviation is a defect.

### Don't:
- **Don't** set red type on navy — it falls to 2.7:1.
- **Don't** set prose in the condensed cut, or a nameplate, tab label, button or count in the
  reading face.
- **Don't** add a shadow, a gradient, or a radius above 3px. The only `box-shadow` in this system
  is the inset enamel rule.
- **Don't** force a four-sided rule onto a bleeding plate; it reads as a border, which this world
  refuses.
- **Don't** substitute an emoji, a Unicode glyph, or a thin-stroke icon for an authored pictogram.
- **Don't** use 1.81:1 — the measured night plate-on-ground step — as precedent for any UI part,
  boundary or mark.
- **Don't** add motion beyond state feedback. What ships is 200ms colour transitions plus a hover
  arrow nudge, and `prefers-reduced-motion` collapses all of it.
- **Don't** add custom scrollbars; product UI keeps the native ones.

## Open questions

Recorded as gaps, not as rules:
- **The touch surface has no authored motion.** All 200ms transitions are colour, and the arrow
  nudge is hover-only — a phone has no hover. Motion belongs with the first real state change.
- **The night ground is generic.** `{colors.night-ground}` is the default dark-mode blue-black;
  the night world is less specific than the very specific day world.
- **The roundel never reaches sign scale.** Empty boards use a chalk pictogram instead, so the
  identity mark is only ever seen small.
- **Desktop is the phone layout centred.** No wider composition has been designed.
- **The active-tab treatment is unverified at phone width.** The captures came from routes that
  match no tab.
