---
name: Packly
description: A calm, native-feeling daily travel companion on a soft mint wash.
colors:
  ground: "#eef6f2"
  surface: "#ffffff"
  surface-sunk: "#f4f9f6"
  ink: "#14231f"
  muted: "#5b6d67"
  hair: "#dde9e3"
  field-edge: "#8a9c95"
  brand: "#1f7a63"
  brand-deep: "#17614e"
  brand-ink: "#ffffff"
  brand-text: "#17614e"
  brand-soft: "#d5ede3"
  hero-from: "#197159"
  hero-to: "#155a48"
  hero-ink: "#ffffff"
  hero-muted: "#e3f5ee"
  todo: "#b54708"
  todo-soft: "#fdf0e3"
  todo-text: "#9a3f07"
  danger: "#b42318"
  danger-soft: "#fdecea"
  night-ground: "#0c1512"
  night-surface: "#15201c"
  night-surface-sunk: "#111b17"
  night-ink: "#e8f1ed"
  night-muted: "#9db0a8"
  night-hair: "#24332e"
  night-field-edge: "#5f7770"
  night-brand: "#4cc9a3"
  night-brand-deep: "#3db892"
  night-brand-ink: "#06130f"
  night-brand-text: "#6fdcb9"
  night-brand-soft: "#1b3a31"
  night-hero-from: "#1d6f5a"
  night-hero-to: "#11443a"
  night-todo: "#f5a45b"
  night-todo-soft: "#3a2a17"
  night-todo-text: "#f5b877"
  night-danger: "#f47067"
  night-danger-soft: "#3b1d1b"
typography:
  display:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    letterSpacing: "-0.01em"
  title-row:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.25
  body:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.375
  body-sm:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
  label:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
  label-tab:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1
rounded:
  md: "12px"
  lg: "16px"
  tile: "1.1rem"
  xl: "24px"
  2xl: "28px"
  tab: "22px"
  squircle: "30%"
  full: "9999px"
spacing:
  gutter: "20px"
  row-gap: "12px"
  section: "24px"
  section-lg: "32px"
  card-pad: "20px"
  dock-clearance: "144px"
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.brand-ink}"
    typography: "{typography.title-row}"
    rounded: "{rounded.full}"
    padding: "14px 16px"
  button-primary-hover:
    backgroundColor: "{colors.brand-deep}"
  button-on-hero:
    backgroundColor: "{colors.hero-ink}"
    textColor: "{colors.hero-to}"
    rounded: "{rounded.full}"
    padding: "10px 16px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "14px 16px 14px 14px"
  card-hero:
    backgroundColor: "{colors.hero-from}"
    textColor: "{colors.hero-ink}"
    rounded: "{rounded.2xl}"
    padding: "{spacing.card-pad}"
  icon-tile:
    backgroundColor: "{colors.brand-soft}"
    textColor: "{colors.brand-text}"
    rounded: "{rounded.tile}"
    size: "52px"
  chip-todo:
    backgroundColor: "{colors.todo-soft}"
    textColor: "{colors.todo-text}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  input:
    backgroundColor: "{colors.surface-sunk}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "12px 16px"
  input-focus:
    backgroundColor: "{colors.surface}"
  dock-tab-active:
    backgroundColor: "{colors.brand-soft}"
    textColor: "{colors.brand-text}"
    typography: "{typography.label-tab}"
    rounded: "{rounded.tab}"
    height: "56px"
  avatar:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.brand-text}"
    rounded: "{rounded.full}"
    size: "40px"
---

# Design System: Packly

## Overview

**Creative North Star: "Mint Companion"**

Packly is the category standard played straight: a calm, friendly phone app that should feel native next to Airbnb and Apple Health / Fitness. A soft mint wash sits under white cards with generous corners and soft ambient shadows; one deep emerald carries every brand moment; amber means exactly one thing, "still to do". Nothing on screen asks to be read closely. The hierarchy is big bold title, one emerald hero card, then a short stack of tappable rows.

Density is low and thumb-first. Every tab uses the same reading column, the same large title, and the same floating dock, so the four tabs read as one app. The system runs in two registers from the same tokens: a daylight register for a rushed one-handed glance, and an evening register (`prefers-color-scheme: dark`) that is the same app with the lights down, not a separate theme.

The only picture is the authored soft suitcase illustration on the hero card. Icons are drawn, not borrowed.

**Key Characteristics:**
- Mint ground, white cards, one emerald brand colour, amber reserved for to-dos.
- Figtree only; sentence case; extra-bold headings with tight negative tracking.
- Large soft corners (24-28px), pills for every button and chip.
- Soft ambient shadows lift cards off the wash; no borders on cards.
- iOS-style frosted floating dock tab bar above the home indicator.
- Rounded 1.75px outline icons with a duotone body that fills solid when active.

## Colors

A cool mint-and-emerald palette with a single warm voice for pending work.

### Primary
- **Deep Emerald** (`brand`): primary buttons, focus rings, caret and native control accent. Hover deepens to **Pine** (`brand-deep`). White on it is 5.22:1.
- **Pine Text** (`brand-text`): links, active tab labels, icon-tile glyphs, avatar initial (7.35:1 on surface, 5.97:1 on mint tint).
- **Mint Tint** (`brand-soft`): icon tiles, the active tab pill, success/status notices, text selection.
- **Emerald Hero Gradient** (`hero-from` to `hero-to`, to bottom-right): the Today hero card and the logo squircle only. Text on it is white (`hero-ink`) with `hero-muted` for secondary lines.

### Tertiary
- **Amber To-Do** (`todo`, `todo-soft`, `todo-text`): the "still to do" chip on plan rows. `todo-text` on `todo-soft` is 6.07:1.

### Neutral
- **Mint Wash** (`ground`): page background and browser theme colour.
- **White Card** (`surface`): every card, the account menu, the avatar.
- **Sunk Mint** (`surface-sunk`): resting input fill and menu-item hover.
- **Evergreen Ink** (`ink`): all primary text (14.81:1 on ground).
- **Sage Muted** (`muted`): subtitles, row detail, inactive tabs, chevrons (5.49:1 on surface, 4.99:1 on ground).
- **Hairline** (`hair`): the dock's 70% outline only.
- **Field Edge** (`field-edge`): input borders, 3.0:1 on surface.
- **Danger** (`danger`, `danger-soft`): field errors and form alerts (5.75:1 as text on its soft fill).

The evening register swaps every role to its `night-*` value; the brand lightens to `night-brand` with near-black `night-brand-ink` on it (9.2:1), and shadows turn to black.

### Named Rules
**The One Emerald Rule.** Emerald is the only brand colour. It marks what you can do or where you are (primary button, active tab, hero card, links), never decoration.

**The Amber Means To-Do Rule.** Amber appears only on "still to do" state. Nothing else may turn amber, including warnings or decoration.

**The Two Registers Rule.** Every new colour is defined in both `:root` and the dark media block, and every text pair clears 4.5:1 (non-text marks 3:1) in its own register.

## Typography

**Display Font:** Figtree (variable, via `next/font`), with ui-sans-serif, system-ui fallback
**Body Font:** Figtree

**Character:** One friendly, open geometric-humanist sans. Weight and tracking do all the hierarchy work; there is no second family.

### Hierarchy
- **Display** (800, 2rem, rising to 2.25rem at `sm`, leading tight, -0.025em, balanced): each screen's title ("Day 3 in Lisbon", "Packing"). Auth screens use the same style at 1.75rem.
- **Headline** (700, 1.5rem, -0.02em): the hero card's key figure ("8 items left to pack").
- **Title** (700, 1.125rem, -0.01em): section headings ("Today's plan") and empty-state titles.
- **Row title** (700, 1rem): plan-row names; also the primary button label.
- **Body** (400, 15px, snug): screen subtitles and the date line (500); empty-state copy uses relaxed leading at max 20rem.
- **Small** (400-600, 0.875rem): row detail, field labels (600), hero meta line (600), menu items.
- **Label** (700, 0.75rem): chips, hints, fine print. Tab labels are 11px, 600 at rest and 700 when active.

### Named Rules
**The Sentence Case Rule.** All text is sentence case. No uppercase labels, no letter-spaced small caps.

**The Tabular Figures Rule.** Counts, dates and progress ("14 of 22 packed", "Day 3 of 7") use tabular numerals so they hold their columns as they change.

## Layout

Mobile-first single column. Screens share a centered reading column (max 672px) with 20px side gutters; the top bar (logo left, avatar right) uses the same column and respects the top safe area. Vertical rhythm: 24px between a screen header and its content, 32px before a new section, 12px between stacked row cards. Main content carries 144px bottom padding so the out-of-flow dock never covers the last row. Auth screens center a 384px column vertically with the logo mark above a single card. The dock is capped at 448px and centered at wider widths; there is no desktop-specific layout beyond these caps.

## Elevation & Depth

Depth is soft and ambient: cards are lifted off the mint wash by diffuse shadows tinted with the ink hue, never by borders. Three levels exist.

### Shadow Vocabulary
- **Card** (`--shadow-card`: `0 1px 2px rgb(20 35 31 / 0.04), 0 8px 24px -10px rgb(20 35 31 / 0.14)`): resting cards, avatar, white pill on hero.
- **Lift** (`--shadow-lift`: `0 2px 4px rgb(20 35 31 / 0.05), 0 18px 40px -14px rgb(20 35 31 / 0.28)`): the dock, the account menu, and plan rows on hover.
- **Hero** (`--shadow-hero`: `0 18px 36px -16px rgb(21 90 72 / 0.55)`): emerald glow under the hero card and the primary button.

The dock adds frosted glass: 86% surface fill, `backdrop-blur-xl`, saturate 150%.

### Named Rules
**The Soft Lift Rule.** Shadows are always wide, blurred and negatively spread. Hover raises a card from Card to Lift; nothing gets a hard or offset-edge shadow.

## Shapes

Generous, friendly rounding at every scale, nesting tighter as elements shrink: 28px for the hero card, auth card, dock and large empty-state tile; 24px for row cards and empty-state cards; 22px for the active tab pill inside the dock; 16px for inputs, alerts and the menu panel; ~18px for 52px icon tiles; 12px for menu items. The logo mark is a 30% squircle. Every button, chip, avatar, progress track and day dot is a full pill. Icons are 24px-grid outlines at 1.75px (2px for chevrons and arrows) with round caps and joins.

## Components

### Buttons
- **Shape:** full pill.
- **Primary:** Deep Emerald fill, white 16px bold label, 14px vertical padding, full width in forms, Hero shadow. Hover to Pine; press scales to 0.98; disabled at 60% opacity; focus is a 2px emerald ring offset 2px.
- **On-hero:** white pill with `hero-to` text (8.11:1), 14px bold, trailing arrow icon, Card shadow; press scales to 0.95; focus ring in white offset against `hero-to`.
- **Text link:** Pine Text, bold, underline on hover/focus.

### Chips
- **To-do chip:** Amber soft fill, `todo-text`, 12px bold tabular, pill, 4px 10px. Sits before the row chevron.

### Cards / Containers
- **Plan row:** white, 24px corners, Card shadow, no border; 52px mint icon tile, bold name over muted detail (2-line clamp), optional to-do chip, muted chevron that nudges 2px right on hover. The whole card is the target; hover to Lift, press to 0.98, emerald focus ring.
- **Hero card:** emerald gradient, 28px corners, Hero shadow, 20px padding (24px at `sm`); two faint white circles behind the suitcase art; text column capped at 62% width; white packing progress bar on a 25% white track; day dots (current day a 24px pill, past 70% white, future 30% white).
- **Empty state:** white 24px card, centered 80px mint tile holding a 40px icon, title, and one sentence explaining what will live here.
- **Auth card:** white, 28px corners, Card shadow, under a 64px logo mark.

### Inputs / Fields
- **Style:** Sunk Mint fill, 1px `field-edge` border, 16px corners, 12px 16px padding, 16px text; label above in 14px semibold.
- **Focus:** fill lifts to white, border turns emerald, 4px emerald ring at 20%.
- **Error:** danger border and ring; 12px medium danger message wired via `aria-describedby`. Form-level alerts are 16px-corner soft-fill notices (danger or mint).

### Navigation
- **Dock tab bar:** fixed, floating 12px (or the safe-area inset) above the bottom, 28px pill bar with frosted surface, 70% hairline and Lift shadow, 6px inner padding. Four equal tabs, each at least 56px tall: 24px icon over an 11px label. Inactive tabs are muted and darken to ink on hover; the active tab gets a mint pill, Pine text, bold label and a filled icon body. Press scales to 0.95.
- **Account menu:** 40px white avatar with the email initial; opens a 256px white panel (16px corners, Lift shadow) with "Signed in as" and a sign-out row. Closes on outside tap or Escape; works without JavaScript.

### Icons
Rounded outline set with a duotone body at 16% opacity that fills to 100% when an ancestor is active. New icons keep the stroke, caps and body, or the set breaks.

### Suitcase Illustration
The one picture: an authored SVG carry-on in warm cream with coral, mint and yellow stickers, tipped -7 degrees with a soft ground shadow. Its colours are illustration-only and are not tokens.

## Do's and Don'ts

### Do:
- **Do** use the 200ms `ease-out-quint` (`cubic-bezier(0.22, 1, 0.36, 1)`) transition for state changes and a press scale (0.95 small controls, 0.98 cards and full-width buttons) for taps; respect reduced motion.
- **Do** lift cards with Card/Lift shadows on the mint ground instead of borders.
- **Do** put secondary text in `muted` and keep every pair at 4.5:1 in both registers.
- **Do** give every interactive element a visible 2px emerald focus ring.
- **Do** keep tap targets at least 40px (dock tabs 56px).

### Don't:
- **Don't** introduce a second brand colour or use emerald decoratively.
- **Don't** use amber for anything but "still to do".
- **Don't** add a second typeface, uppercase labels or letter-spaced eyebrows.
- **Don't** use hard, offset-edge shadows or 1px borders around cards.
- **Don't** use sharp corners; nothing interactive is below 12px radius, and buttons and chips are always pills.
- **Don't** borrow icon-font or emoji glyphs; draw icons to the 1.75px duotone set.

## Open questions

Known ceilings of the current build. These are not rules; do not copy them into new surfaces.

- Motion stops at press-scale and 200ms state transitions; there are no authored entrances or screen transitions yet.
- Empty states explain but offer no action, because no create flows exist yet.
- All plan-row icon tiles share one mint tint; whether categories get their own tints is undecided.
