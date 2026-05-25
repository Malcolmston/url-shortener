# Frontend Design System & Page Specification

> **Project:** Snip — URL Shortener & File Host  
> **Stack:** React · Tailwind CSS v3 · FontAwesome Pro · animate.css  
> **Date:** 2026-05-25

---

## Table of Contents

1. [Brand Identity](#1-brand-identity)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Spacing & Sizing Tokens](#4-spacing--sizing-tokens)
5. [Elevation & Borders](#5-elevation--borders)
6. [Iconography](#6-iconography)
7. [Animation & Motion](#7-animation--motion)
8. [Light Theme](#8-light-theme)
9. [Dark Theme](#9-dark-theme)
10. [Component Library](#10-component-library)
11. [Layout System](#11-layout-system)
12. [Pages](#12-pages)
13. [Responsive Breakpoints](#13-responsive-breakpoints)
14. [Tailwind Config](#14-tailwind-config)
15. [Accessibility Standards](#15-accessibility-standards)

---

## 1. Brand Identity

### Name & Tagline
- **App name:** Snip
- **Tagline:** "Short links. Big control."
- **Domain pattern:** `snip.io` / `snp.io`

### Voice & Tone
- **Short.** Never more words than needed in UI copy.
- **Confident.** Declarative labels, not hedging ("Delete" not "Would you like to delete?").
- **Human.** Error messages explain what went wrong and how to fix it.
- **Technical but accessible.** Power-user features are always available but never forced.

### Logo Mark
- Icon: A stylised `⌂` scissor-snip glyph (FontAwesome `faScissors`)
- Used at 3 sizes: 16px (favicon), 32px (navbar), 120px (marketing hero)
- Never distorted — always uniform scale

### Brand Colours (primary swatches only)
| Swatch | Hex | Use |
|---|---|---|
| Snip Violet | `#7C3AED` | Primary actions, links, focus rings |
| Snip Violet Dark | `#5B21B6` | Hover state on primary |
| Snip Violet Light | `#EDE9FE` | Tinted backgrounds, hover states |
| Ink | `#111827` | Primary text in light mode |
| Slate | `#6B7280` | Secondary / meta text |
| Paper | `#F9FAFB` | Page background (light) |
| Canvas | `#0F172A` | Page background (dark) |

---

## 2. Color System

All colours map to **Tailwind CSS v3 semantic tokens** via a custom Tailwind config extension. Every component references semantic names, never raw hex, so dark mode is a single class toggle.

### Semantic Color Tokens

```
--color-bg-base          light: gray-50     dark: slate-950
--color-bg-surface       light: white       dark: slate-900
--color-bg-elevated      light: white       dark: slate-800
--color-bg-subtle        light: gray-100    dark: slate-800
--color-bg-muted         light: gray-200    dark: slate-700

--color-text-primary     light: gray-900    dark: slate-50
--color-text-secondary   light: gray-600    dark: slate-400
--color-text-tertiary    light: gray-400    dark: slate-500
--color-text-disabled    light: gray-300    dark: slate-600
--color-text-inverse     light: white       dark: gray-900

--color-border-default   light: gray-200    dark: slate-700
--color-border-strong    light: gray-300    dark: slate-600
--color-border-focus     light: violet-500  dark: violet-400

--color-brand-primary    light: violet-600  dark: violet-500
--color-brand-hover      light: violet-700  dark: violet-400
--color-brand-tint       light: violet-50   dark: violet-950
--color-brand-text       light: violet-700  dark: violet-300

--color-success          light: emerald-600 dark: emerald-400
--color-success-tint     light: emerald-50  dark: emerald-950
--color-warning          light: amber-500   dark: amber-400
--color-warning-tint     light: amber-50    dark: amber-950
--color-danger           light: red-600     dark: red-400
--color-danger-tint      light: red-50      dark: red-950
--color-info             light: sky-600     dark: sky-400
--color-info-tint        light: sky-50      dark: sky-950
```

### File Type Colour Palette (for `Mime.jsx` icons)
| File Category | Light bg | Icon colour | Dark bg | Icon colour dark |
|---|---|---|---|---|
| Images | blue-50 | blue-500 | blue-950 | blue-400 |
| Video | purple-50 | purple-500 | purple-950 | purple-400 |
| Audio | green-50 | green-500 | green-950 | green-400 |
| PDF | red-50 | red-500 | red-950 | red-400 |
| Office docs | orange-50 | orange-500 | orange-950 | orange-400 |
| Spreadsheets | emerald-50 | emerald-600 | emerald-950 | emerald-400 |
| Code / Dev | indigo-50 | indigo-500 | indigo-950 | indigo-400 |
| Archives | yellow-50 | yellow-600 | yellow-950 | yellow-400 |
| Fonts | pink-50 | pink-500 | pink-950 | pink-400 |
| 3D / CAD | teal-50 | teal-500 | teal-950 | teal-400 |
| Design (PSD/AI) | rose-50 | rose-500 | rose-950 | rose-400 |
| Generic binary | gray-50 | gray-500 | gray-800 | gray-400 |

---

## 3. Typography

### Font Stack

#### Display Font — Plus Jakarta Sans
```css
font-family: 'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif;
```
- **Source:** Google Fonts (`https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800`)
- **Used for:** Hero headings, page titles, logo wordmark, marketing copy
- **Weights loaded:** 400, 500, 600, 700, 800

#### Body Font — Inter
```css
font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
```
- **Source:** Google Fonts (`https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600`)
- **Used for:** All UI text, form labels, body copy, navigation, meta text
- **Weights loaded:** 400 (regular), 500 (medium), 600 (semibold)

#### Monospace Font — JetBrains Mono
```css
font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
```
- **Source:** Google Fonts (`https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500`)
- **Used for:** Code previews, API keys, short link slugs, UUIDs, file hashes, terminal output
- **Weights loaded:** 400, 500

---

### Type Scale

All sizes use the Inter body font unless noted. The scale is defined in `tailwind.config.js` as custom `fontSize` tokens.

| Token | Size | Line height | Weight | Usage |
|---|---|---|---|---|
| `text-display-2xl` | 72px / 4.5rem | 1.1 | 800 | Marketing hero headline (Plus Jakarta Sans) |
| `text-display-xl` | 56px / 3.5rem | 1.1 | 700 | Section hero headlines (Plus Jakarta Sans) |
| `text-display-lg` | 40px / 2.5rem | 1.2 | 700 | Page hero H1 (Plus Jakarta Sans) |
| `text-display-md` | 32px / 2rem | 1.25 | 700 | Section title (Plus Jakarta Sans) |
| `text-display-sm` | 24px / 1.5rem | 1.3 | 600 | Card headings (Plus Jakarta Sans) |
| `text-xl` | 20px / 1.25rem | 1.4 | 600 | Sub-headings (Inter) |
| `text-lg` | 18px / 1.125rem | 1.5 | 500 | Large body / lead text |
| `text-md` | 16px / 1rem | 1.5 | 400 | Default body text |
| `text-sm` | 14px / 0.875rem | 1.5 | 400 | Secondary info, labels |
| `text-xs` | 12px / 0.75rem | 1.4 | 400 | Timestamps, badges, captions |
| `text-2xs` | 10px / 0.625rem | 1.3 | 500 | Tiny labels, status dots |
| `text-mono-sm` | 13px / 0.8125rem | 1.5 | 400 | Code inline, API keys |
| `text-mono-xs` | 12px / 0.75rem | 1.4 | 400 | Code block content |

### Typography Rules
- **Headings** (`h1–h3`) always use Plus Jakarta Sans; `h4–h6` use Inter semibold
- **Body paragraphs** max-width: `65ch` (optimal reading line length)
- **Code blocks** always use JetBrains Mono with syntax highlighting
- **Short link slugs** always render in `font-mono` — never in the body font
- **Numbers in stat cards** use Plus Jakarta Sans 700 for visual weight
- **Error messages** use Inter 500 red-600; never all-caps
- **Placeholder text** color: `gray-400` light / `slate-500` dark

---

## 4. Spacing & Sizing Tokens

The project uses Tailwind's default 4px base grid. Custom tokens are added only for unique layout needs.

### Component-Level Spacing

| Token | Value | Usage |
|---|---|---|
| `spacing-px` | 1px | Hairline borders, dividers |
| `spacing-0.5` | 2px | Icon-to-label micro gaps |
| `spacing-1` | 4px | Inline badge padding |
| `spacing-1.5` | 6px | Compact badge/chip padding |
| `spacing-2` | 8px | Dense list row padding |
| `spacing-3` | 12px | Default icon padding button |
| `spacing-4` | 16px | Default inner card padding small |
| `spacing-5` | 20px | Form field internal padding |
| `spacing-6` | 24px | Default card padding |
| `spacing-8` | 32px | Section gap within page |
| `spacing-10` | 40px | Between page sections |
| `spacing-12` | 48px | Large section gap |
| `spacing-16` | 64px | Hero section padding |
| `spacing-24` | 96px | Marketing section gap |

### Sizing

| Token | Value | Usage |
|---|---|---|
| `h-5 / w-5` | 20px | Inline icons next to text |
| `h-8 / w-8` | 32px | Button icon-only small |
| `h-9` | 36px | Input height compact |
| `h-10` | 40px | Input height default |
| `h-11` | 44px | Button height (minimum touch target) |
| `h-12` | 48px | Input height large / hero inputs |
| `h-16 / w-16` | 64px | Avatar medium |
| `h-24 / w-24` | 96px | Avatar large |
| `h-32 / w-32` | 128px | Avatar XL |
| `max-w-sm` | 384px | Login / signup card width |
| `max-w-lg` | 512px | Dialog / modal default |
| `max-w-2xl` | 672px | Content column |
| `max-w-4xl` | 896px | Wide content / preview modal |
| `max-w-7xl` | 1280px | Page max-width container |

---

## 5. Elevation & Borders

### Shadow Scale

```
shadow-none   — flat, no elevation (e.g. inline editing input)
shadow-xs     — 0 1px 2px rgba(0,0,0,0.05)         — subtle card border replacement
shadow-sm     — 0 1px 3px rgba(0,0,0,0.10)         — default card
shadow-md     — 0 4px 6px rgba(0,0,0,0.07)         — floating tooltips, dropdowns
shadow-lg     — 0 10px 15px rgba(0,0,0,0.10)       — modals, command palette
shadow-xl     — 0 20px 25px rgba(0,0,0,0.15)       — sheet overlays
shadow-2xl    — 0 25px 50px rgba(0,0,0,0.25)       — full-screen modals
```

*Dark mode:* all shadows use `rgba(0,0,0,0.4)` — shadows are more pronounced on dark surfaces.

### Border Radius Scale

```
rounded-none  — 0px      — not used in UI
rounded-sm    — 2px      — tiny chips, status dots
rounded       — 4px      — code blocks, tables
rounded-md    — 6px      — compact buttons, small badges
rounded-lg    — 8px      — default inputs, default buttons
rounded-xl    — 12px     — cards, modals
rounded-2xl   — 16px     — large cards, image previews
rounded-3xl   — 24px     — sheet overlays, marketing sections
rounded-full  — 9999px   — avatars, pills, toggle switches
```

### Border Widths
- Default card: `border border-gray-200` (light) / `border border-slate-700` (dark)
- Focus ring: `ring-2 ring-violet-500 ring-offset-2`
- Dividers: `divide-y divide-gray-100` (light) / `divide-slate-800` (dark)
- Input default: `border border-gray-300` (light) / `border border-slate-600` (dark)
- Input error: `border border-red-400`
- Input focused: `border border-violet-500 ring-2 ring-violet-500/20`

---

## 6. Iconography

### Library
**FontAwesome Pro** — Regular weight (`@fortawesome/pro-regular-svg-icons`) for all UI icons.  
Switch to **Solid** (`@fortawesome/pro-solid-svg-icons`) only for filled state indicators (active nav items, toggled-on states).

### Icon Sizing Conventions
| Context | Size prop | Pixels |
|---|---|---|
| Inline with body text | `sm` (default) | 14px |
| Button icon | (no size) | 16px |
| Navigation item | `lg` | 18px |
| Stat card accent | `xl` | 20px |
| Empty state | `3x` | 48px |
| Page-level illustration | `5x` | 80px |

### Standard Icon Map

| Action / Concept | Icon name | FA identifier |
|---|---|---|
| Upload | Cloud Upload | `faCloudArrowUp` |
| Download | Arrow Down to Bracket | `faArrowDownToBracket` |
| Short link | Link Simple | `faLinkSimple` |
| File (generic) | File | `faFile` |
| Folder | Folder | `faFolder` |
| Folder open | Folder Open | `faFolderOpen` |
| Image file | Image | `faImage` |
| Video file | Film | `faFilm` |
| Audio file | Music | `faMusic` |
| PDF | File PDF | `faFilePdf` |
| Code file | Code | `faCode` |
| Archive | File Zipper | `faFileZipper` |
| Delete / Trash | Trash | `faTrash` |
| Restore | Trash Undo | `faTrashUndo` |
| Edit / Rename | Pen | `faPen` |
| Settings | Gear | `faGear` |
| User / Profile | Circle User | `faCircleUser` |
| Visibility public | Eye | `faEye` |
| Visibility private | Eye Slash | `faEyeSlash` |
| Copy to clipboard | Copy | `faCopy` |
| Check / success | Circle Check | `faCircleCheck` |
| Warning | Triangle Exclamation | `faTriangleExclamation` |
| Error / close | Circle X Mark | `faCircleXmark` |
| Info | Circle Info | `faCircleInfo` |
| Loading spinner | Spinner | `faSpinner` |
| Refresh | Arrows Rotate | `faArrowsRotate` |
| Search | Magnifying Glass | `faMagnifyingGlass` |
| Calendar | Calendar | `faCalendar` |
| Analytics / chart | Chart Line | `faChartLine` |
| QR Code | QR Code | `faQrcode` |
| Lock (protected link) | Lock | `faLock` |
| Unlock | Lock Open | `faLockOpen` |
| Share | Share Nodes | `faShareNodes` |
| Tag | Tag | `faTag` |
| API Key | Key | `faKey` |
| Webhook | Webhook | `faWebhook` |
| Notification bell | Bell | `faBell` |
| Close / dismiss | X Mark | `faXmark` |
| More options | Ellipsis | `faEllipsis` |
| Drag handle | Grid Dots Vertical | `faGridDotsVertical` |
| Scissors (logo) | Scissors | `faScissors` |
| Dashboard | Grid 2 | `faGrid2` |
| Dark mode | Moon | `faMoon` |
| Light mode | Sun | `faSun` |
| System theme | Half Moon | `faCircleHalfStroke` |
| Expand | Up Right and Down Left from Center | `faUpRightAndDownLeftFromCenter` |
| Collapse | Down Left and Up Right to Center | `faDownLeftAndUpRightToCenter` |

---

## 7. Animation & Motion

### Principles
1. **Purpose-driven.** Every animation communicates state change — never decorative flicker.
2. **Fast.** UI responses ≤ 150ms. Page transitions ≤ 300ms. Never block user intent.
3. **Subtle.** Amplitude is small; easing is always ease-out (objects slow to their resting state).
4. **Reducible.** All animations respect `prefers-reduced-motion: reduce`.

### Timing Tokens
```css
--duration-instant:  50ms   /* focus rings, hover backgrounds */
--duration-fast:    150ms   /* tooltips, dropdowns open */
--duration-normal:  250ms   /* modal enter, page transitions */
--duration-slow:    400ms   /* skeleton→content fade, progress bar */
--duration-crawl:   600ms   /* onboarding illustrations */
```

### Easing Tokens
```css
--ease-out:       cubic-bezier(0.0, 0.0, 0.2, 1)   /* default enter */
--ease-in:        cubic-bezier(0.4, 0.0, 1.0, 1)   /* exit */
--ease-in-out:    cubic-bezier(0.4, 0.0, 0.2, 1)   /* repositioning */
--ease-spring:    cubic-bezier(0.34, 1.56, 0.64, 1) /* micro-interactions */
--ease-linear:    linear                             /* progress bars, spinners */
```

### Tailwind Transition Classes Used
```
transition-colors    — background, border, text color changes (150ms ease-out)
transition-opacity   — fade in/out (150ms ease-out)
transition-transform — scale, translate micro-interactions (150ms ease-spring)
transition-all       — NOT used (too broad; catches layout properties)
duration-150         — default for hover states
duration-200         — modals, dropdowns
duration-300         — page-level transitions
```

### animate.css Usage (keep minimal)
| Trigger | Class | Duration |
|---|---|---|
| Form validation error appears | `animate__animated animate__headShake` | 800ms |
| Error toast slides in | `animate__animated animate__slideInRight` | 400ms |
| Success toast slides in | `animate__animated animate__slideInRight` | 400ms |
| Modal backdrop click (wrong target) | `animate__animated animate__headShake` on modal panel | 600ms |
| Onboarding step advance | `animate__animated animate__fadeInRight` | 300ms |

### Skeleton Loading
All data-fetching components show skeleton placeholders before content arrives.

```
Skeleton bg:          bg-gray-200   animate-pulse  (light)
                      bg-slate-700  animate-pulse  (dark)
Skeleton radius:      rounded-md for text lines, rounded-full for avatars
Text skeleton widths: first line 100%, second 80%, third 60% (staggered)
```

### Page Transition
- Route changes: `opacity-0 → opacity-100` over 200ms (Tailwind `transition-opacity duration-200`)
- Scroll-to-top on every route change

---

## 8. Light Theme

The default theme. Class applied: `data-theme="light"` on `<html>`.

### Surface Hierarchy
```
Level 0 — Page bg:       bg-gray-50         (#F9FAFB)  — outermost shell
Level 1 — App shell:     bg-white           (#FFFFFF)  — sidebar, topbar
Level 2 — Card:          bg-white + shadow-sm          — content cards
Level 3 — Elevated card: bg-white + shadow-md          — modals, dropdowns
Level 4 — Overlay:       bg-white + shadow-xl          — sheets, command palette
Scrim:                   bg-black/50                   — modal backdrop
```

### Text
```
Primary text:    text-gray-900   (#111827)
Secondary text:  text-gray-600   (#4B5563)
Muted text:      text-gray-400   (#9CA3AF)
Link:            text-violet-600  (#7C3AED)
Link hover:      text-violet-700  (#6D28D9)
Danger text:     text-red-600    (#DC2626)
Success text:    text-emerald-600 (#059669)
Warning text:    text-amber-600  (#D97706)
```

### Interactive Elements
```
Primary button bg:        bg-violet-600   hover:bg-violet-700
Primary button text:      text-white
Secondary button bg:      bg-white        hover:bg-gray-50
Secondary button border:  border-gray-300 hover:border-gray-400
Ghost button:             transparent     hover:bg-gray-100
Danger button:            bg-red-600      hover:bg-red-700
Input bg:                 bg-white
Input border:             border-gray-300
Input focus:              ring-2 ring-violet-500/30 border-violet-500
```

### Status Badges
```
Public / active:    bg-emerald-100  text-emerald-700  border-emerald-200
Private:            bg-gray-100     text-gray-600     border-gray-200
Deleted / inactive: bg-red-50       text-red-600      border-red-100
Pending:            bg-amber-50     text-amber-700    border-amber-100
Info / new:         bg-violet-50    text-violet-700   border-violet-100
```

---

## 9. Dark Theme

Applied via `data-theme="dark"` on `<html>`. Toggled by user preference + stored in `localStorage`.

### Surface Hierarchy
```
Level 0 — Page bg:       bg-slate-950    (#020617)
Level 1 — App shell:     bg-slate-900    (#0F172A)
Level 2 — Card:          bg-slate-800    (#1E293B)  + shadow-sm
Level 3 — Elevated card: bg-slate-800    (#1E293B)  + shadow-md
Level 4 — Overlay:       bg-slate-900    (#0F172A)  + shadow-xl
Scrim:                   bg-black/70
```

### Text
```
Primary text:    text-slate-50    (#F8FAFC)
Secondary text:  text-slate-400   (#94A3B8)
Muted text:      text-slate-500   (#64748B)
Link:            text-violet-400  (#A78BFA)
Link hover:      text-violet-300  (#C4B5FD)
Danger text:     text-red-400     (#F87171)
Success text:    text-emerald-400 (#34D399)
Warning text:    text-amber-400   (#FBBF24)
```

### Interactive Elements
```
Primary button bg:        bg-violet-600    hover:bg-violet-500
Primary button text:      text-white
Secondary button bg:      bg-slate-800     hover:bg-slate-700
Secondary button border:  border-slate-600 hover:border-slate-500
Ghost button:             transparent      hover:bg-slate-800
Danger button:            bg-red-600       hover:bg-red-500
Input bg:                 bg-slate-900
Input border:             border-slate-600
Input focus:              ring-2 ring-violet-400/30 border-violet-400
Input text:               text-slate-50
Input placeholder:        text-slate-500
```

### Status Badges (dark)
```
Public / active:    bg-emerald-950  text-emerald-400  border-emerald-800
Private:            bg-slate-800    text-slate-400    border-slate-600
Deleted / inactive: bg-red-950      text-red-400      border-red-900
Pending:            bg-amber-950    text-amber-400    border-amber-900
Info / new:         bg-violet-950   text-violet-400   border-violet-800
```

---

## 10. Component Library

### 10.1 Buttons

#### Sizes
```
xs  — h-7  px-2.5 text-xs  rounded-md   (inside table rows, tight spaces)
sm  — h-8  px-3   text-sm  rounded-md
md  — h-10 px-4   text-sm  rounded-lg   ← default
lg  — h-11 px-5   text-base rounded-lg
xl  — h-12 px-6   text-base rounded-xl  (CTA buttons, hero)
```

#### Variants
```
primary    — violet-600 bg, white text, hover:violet-700, active:violet-800
secondary  — white bg, gray-300 border, gray-700 text, hover:gray-50
ghost      — transparent, gray-600 text, hover:gray-100 bg
danger     — red-600 bg, white text, hover:red-700
outline    — transparent, violet-600 border, violet-600 text, hover:violet-50
link       — transparent, violet-600 text, underline on hover
```

#### States
```
Loading:  spinner icon replaces text, opacity-80, pointer-events-none
Disabled: opacity-50, cursor-not-allowed, pointer-events-none
Active:   scale-[0.97] transform (spring easing, 100ms)
```

#### Icon Buttons
```
Standalone icon button (p-2 rounded-lg):
  default:  text-gray-500 hover:text-{color}-600 hover:bg-{color}-50
  active:   text-{color}-600 bg-{color}-100
  danger:   text-gray-500 hover:text-red-600 hover:bg-red-50
```

---

### 10.2 Inputs & Forms

#### Text Input
```
Default:  h-10 w-full px-3 py-2 bg-white border border-gray-300 rounded-lg
          text-gray-900 text-sm placeholder:text-gray-400
          focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500
          transition-colors duration-150

Error:    border-red-400 ring-2 ring-red-400/20

Disabled: bg-gray-50 text-gray-400 cursor-not-allowed

Dark:     bg-slate-900 border-slate-600 text-slate-50 placeholder:text-slate-500
```

#### Label
```
block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5
```

#### Helper / Error text
```
mt-1.5 text-xs
  helper: text-gray-500
  error:  text-red-500 flex items-center gap-1
              <FontAwesomeIcon icon={faCircleXmark} />
              {message}
```

#### Input Group (icon inside input)
```
relative div wrapping input
Left icon:  absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none
Right icon: absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
Input with left icon:  pl-9
Input with right icon: pr-9
```

#### Password Visibility Toggle
```
Right of input — button with faEye / faEyeSlash
button: absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600
```

#### Select
```
Same sizing as text input + bg-white + appearance-none
Right chevron via background SVG or absolute FontAwesome faChevronDown
```

#### Checkbox
```
h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500
Label: ml-2 text-sm text-gray-700
```

#### Toggle Switch
```
Pill: w-10 h-6 rounded-full transition-colors
  Off: bg-gray-200          On: bg-violet-600
Thumb: w-4 h-4 rounded-full bg-white shadow translate-x-1 → translate-x-5
```

---

### 10.3 Cards

#### Default Card
```
bg-white rounded-xl shadow-sm border border-gray-200 p-6
dark: bg-slate-800 border-slate-700
```

#### Stat Card (used in file stats, analytics)
```
bg-white rounded-xl shadow-sm border border-gray-200 p-5
flex items-center gap-4

Icon wrap: w-11 h-11 rounded-xl bg-{color}-50 flex items-center justify-center
Icon:      text-{color}-600 (size lg)

Label:     text-xs font-medium text-gray-500 uppercase tracking-wide
Value:     text-2xl font-bold text-gray-900 font-display (Plus Jakarta Sans)
Delta:     text-xs text-emerald-600 flex items-center gap-0.5 (▲ 12%)
```

#### File Row Card (in the files list)
```
px-5 py-4 hover:bg-gray-50 transition-colors duration-150
border-b border-gray-100 last:border-b-0

Deleted state: opacity-50 bg-red-50/30
```

#### Link Card (for shortened URLs)
```
bg-white rounded-xl border border-gray-200 p-4
hover:shadow-md transition-shadow duration-200

Short URL:   font-mono text-sm text-violet-600 font-medium
Long URL:    text-xs text-gray-500 truncate max-w-xs
Stat chips:  text-xs bg-gray-100 rounded-full px-2 py-0.5 text-gray-600
```

---

### 10.4 Modals & Dialogs

```
Backdrop:   fixed inset-0 bg-black/50 backdrop-blur-sm z-40
            transition-opacity duration-200

Panel:      bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4
            fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50
            max-h-[90vh] overflow-y-auto

Header:     px-6 pt-6 pb-4 border-b border-gray-100
            flex items-start justify-between gap-4
  Title:    text-lg font-semibold text-gray-900 (Plus Jakarta Sans)
  Close:    p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100

Body:       px-6 py-5

Footer:     px-6 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-100
            flex justify-end gap-3
```

#### File Preview Modal (large variant)
```
Panel:      max-w-5xl w-full max-h-[92vh]

Header:     sticky top-0 bg-white z-10 border-b border-gray-100
            px-6 py-4 flex items-center justify-between

Body:       p-6 overflow-auto
```

#### Confirmation Dialog (destructive action)
```
Icon:       mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center
            text-red-600 text-xl

Title:      mt-4 text-center text-lg font-semibold text-gray-900
Body text:  mt-2 text-center text-sm text-gray-500 max-w-xs mx-auto

Buttons:    mt-6 grid grid-cols-2 gap-3
            Cancel: secondary variant
            Confirm: danger variant
```

---

### 10.5 Toasts / Notifications

Positioned: `fixed bottom-5 right-5 flex flex-col gap-2 z-[60]`

```
Toast:      min-w-[280px] max-w-sm bg-white rounded-xl shadow-lg
            border border-gray-100 px-4 py-3
            flex items-start gap-3

Icon wrap:  w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center
Success:    bg-emerald-100 text-emerald-600
Error:      bg-red-100 text-red-600
Warning:    bg-amber-100 text-amber-600
Info:       bg-violet-100 text-violet-600

Title:      text-sm font-semibold text-gray-900
Message:    text-xs text-gray-500 mt-0.5

Close:      ml-auto text-gray-400 hover:text-gray-600

Enter:      animate__animated animate__slideInRight (300ms)
Exit:       animate__animated animate__fadeOutRight (200ms)
Auto-dismiss: 5000ms for success/info, 8000ms for error/warning
```

---

### 10.6 Navigation

#### Top Bar (mobile + auth pages)
```
h-16 bg-white border-b border-gray-200 sticky top-0 z-30
px-4 flex items-center justify-between

Logo: faScissors icon + "Snip" wordmark (Plus Jakarta Sans 700)
Nav links: hidden md:flex gap-1
User menu: relative dropdown
```

#### Sidebar (desktop app shell)
```
w-64 bg-white border-r border-gray-200 flex flex-col
fixed inset-y-0 left-0 z-20

Top section:  px-4 py-5 — logo + wordmark
Nav:          flex-1 px-3 py-4 space-y-1 overflow-y-auto
Bottom:       px-4 py-4 border-t border-gray-100 — user info + settings

Nav item:     flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
  Default:    text-gray-600 hover:bg-gray-100 hover:text-gray-900
  Active:     bg-violet-50 text-violet-700 (icon is solid variant)
  Icon:       w-5 h-5 flex-shrink-0

Nav section:  text-2xs font-semibold text-gray-400 uppercase tracking-widest
              px-3 mb-2 mt-6 first:mt-0
```

#### Collapsible Mobile Sidebar
```
Overlay:    fixed inset-0 bg-black/30 z-10 (visible when sidebar open)
Sidebar:    slide in from left — transform translate-x-0/-64 transition-transform duration-250
Close button inside at top-right of sidebar
```

---

### 10.7 Badges / Chips

```
Base: inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border

Sizes:
  sm: px-1.5 py-0 text-2xs
  md: px-2 py-0.5 text-xs   ← default
  lg: px-2.5 py-1 text-sm

Variants:
  Public/active: bg-emerald-50  text-emerald-700 border-emerald-200
  Private:       bg-gray-100    text-gray-600    border-gray-200
  Deleted:       bg-red-50      text-red-600     border-red-200
  Beta:          bg-amber-50    text-amber-700   border-amber-200
  New:           bg-violet-50   text-violet-700  border-violet-200
  Count:         bg-gray-100    text-gray-700    border-transparent
```

---

### 10.8 Progress Bar

```
Wrapper:  h-1.5 w-full bg-gray-200 rounded-full overflow-hidden

Track:    h-full bg-violet-600 rounded-full transition-all duration-300 ease-out

Stages:
  Preparing (0–30%):  bg-amber-500
  Uploading (30–95%): bg-violet-600
  Processing (95–99%):bg-violet-600 animate-pulse
  Complete (100%):    bg-emerald-500 → fades out after 800ms
```

---

### 10.9 Empty States

```
Container:  flex flex-col items-center justify-center py-16 text-center
Icon:       text-gray-300 dark:text-slate-600 mb-4 (size 3x or 5x)
Title:      text-base font-semibold text-gray-700 mb-2 (Plus Jakarta Sans)
Body:       text-sm text-gray-500 max-w-xs mx-auto mb-6
CTA button: primary variant md size
```

---

### 10.10 Drag-and-Drop Upload Zone

```
Default:    border-2 border-dashed border-gray-300 rounded-2xl p-12
            flex flex-col items-center gap-4 text-center
            cursor-pointer hover:border-violet-400 hover:bg-violet-50/50
            transition-all duration-200

Dragging:   border-violet-500 bg-violet-50 scale-[1.01] shadow-md
            transition-transform duration-150 ease-spring

Icon:       faCloudArrowUp text-gray-400 (dragging: text-violet-500) size 3x
Title:      text-base font-medium text-gray-700
Sub:        text-sm text-gray-500
Browse btn: ghost/link variant inline within text
File limit: text-xs text-gray-400 mt-2
```

---

### 10.11 Skeleton Loaders

```
Line skeleton:   h-4 rounded-md bg-gray-200 animate-pulse dark:bg-slate-700
Avatar skeleton: w-10 h-10 rounded-full bg-gray-200 animate-pulse
Card skeleton:   bg-white rounded-xl border border-gray-100 p-5
                 space-y-3 (contains line skeletons)

File row skeleton: 3-4 rows of:
  left:  w-10 h-10 rounded-lg skeleton + two text lines (100%, 60%)
  right: three w-6 h-6 circle skeletons (action buttons)
```

---

## 11. Layout System

### App Shell (authenticated)

```
┌─────────────────────────────────────────────────────────┐
│  SIDEBAR (w-64, fixed)     │  MAIN CONTENT              │
│                            │  ┌──────────────────────┐  │
│  Logo (h-16)               │  │ TOP BAR (h-16 sticky)│  │
│  ─────────────────         │  └──────────────────────┘  │
│  Nav section: Main         │  ┌──────────────────────┐  │
│    Dashboard               │  │ PAGE CONTENT         │  │
│    My Links                │  │ max-w-7xl mx-auto    │  │
│    My Files                │  │ px-4 sm:px-6 lg:px-8 │  │
│  ─────────────────         │  │ py-8                 │  │
│  Nav section: Analytics    │  │                      │  │
│    Overview                │  │                      │  │
│    Click Maps              │  │                      │  │
│  ─────────────────         │  │                      │  │
│  Nav section: Settings     │  │                      │  │
│    Account                 │  │                      │  │
│    API Keys                │  │                      │  │
│    Preferences             │  └──────────────────────┘  │
│  ─────────────────         │                            │
│  User profile (bottom)     │                            │
└─────────────────────────────────────────────────────────┘
```

- Sidebar: `hidden lg:flex` (collapses to hamburger on mobile)
- Main content: `lg:pl-64` offset for sidebar
- Top bar on mobile: shows hamburger, logo, user avatar only
- Content area: `min-h-screen bg-gray-50`

### Public / Marketing Shell

```
┌─────────────────────────────────────────────────────────┐
│ NAV BAR (h-16 sticky, bg-white, backdrop-blur)          │
│  Logo        Navigation links        CTA buttons        │
├─────────────────────────────────────────────────────────┤
│ PAGE SECTIONS (full-width, alternating bg)              │
├─────────────────────────────────────────────────────────┤
│ FOOTER (bg-gray-900, text-gray-400)                     │
└─────────────────────────────────────────────────────────┘
```

### Auth Shell (login, signup, password reset)

```
bg-gray-50 min-h-screen flex flex-col
  Header: centered logo (top-8)
  Card:   max-w-sm w-full mx-auto mt-16 bg-white rounded-2xl shadow-sm p-8
  Footer: text-xs text-gray-400 text-center mt-8 — links to Terms, Privacy
```

---

## 12. Pages

---

### 12.1 Landing Page (`/`)

**Purpose:** Marketing — convert visitors to sign-ups.  
**Layout:** Public shell  
**Auth:** No — redirect to `/dashboard` if authenticated

#### Sections

**Hero**
```
bg-white, section py-24 max-w-7xl mx-auto
  Headline:     display-2xl (72px) Plus Jakarta Sans 800
                "Shorten. Share. Snip."
  Subheadline:  text-xl text-gray-500 mt-4 max-w-lg
                "Create short links, host files, and track every click—
                 all in one clean dashboard."
  CTA row:      mt-10 flex gap-4
    Primary:    "Get Started Free" — primary xl button → /signup
    Secondary:  "See How It Works" — ghost xl button (scrolls to features)
  Hero image:   mt-16 rounded-2xl shadow-2xl border border-gray-100
                (dark-mode-aware screenshot of the dashboard)
```

**Stats bar**
```
bg-gray-50 border-y border-gray-100 py-8
  3 stats across (max-w-4xl mx-auto grid grid-cols-3):
    "10M+ Links created"
    "99.9% Uptime"
    "50+ Countries"
  Each: text-display-sm font-bold text-gray-900 + text-sm text-gray-500
```

**Features grid**
```
py-24 max-w-7xl mx-auto
  Section label: "Features" — text-xs font-semibold text-violet-600 uppercase tracking-widest
  Title:         "Everything you need. Nothing you don't."  — display-lg
  Grid:          grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6

  Feature card:  bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md
    Icon bg:     w-11 h-11 bg-violet-50 rounded-xl flex items-center justify-center
    Icon:        text-violet-600
    Title:       text-base font-semibold text-gray-900 mt-4 (Plus Jakarta Sans)
    Body:        text-sm text-gray-500 mt-2

  Features:
    faLinkSimple      "Smart Short Links"      Custom slugs, QR codes, expiry dates
    faChartLine       "Real-Time Analytics"    Clicks, locations, devices, referrers
    faCloudArrowUp    "File Hosting"           Upload any file, control visibility
    faLock            "Link Protection"        Password-protect any link
    faKey             "Developer API"          Full REST API + API key management
    faScissors        "One-Click Copy"         Copy short URL to clipboard instantly
```

**Social proof**
```
bg-gray-50 py-20
  Quote cards (grid 1-3) with avatar, name, role, company
```

**Pricing section** (if applicable)
```
py-24 max-w-5xl mx-auto
  2–3 tier cards: Free / Pro / Team
  Active tier: border-violet-500 ring-2 ring-violet-500/20
```

**Final CTA**
```
bg-violet-600 py-24 text-center
  Headline: "Start shortening in seconds." — display-lg text-white
  Sub:      "No credit card required." — text-violet-200
  Button:   "Create Free Account" — bg-white text-violet-700 hover:bg-violet-50 xl
```

**Footer**
```
bg-gray-900 text-gray-400 py-16
  grid grid-cols-2 md:grid-cols-5 gap-8
  Columns: Product | Company | Legal | Social icons
  Bottom row: © 2026 Snip · Privacy · Terms
```

---

### 12.2 Login Page (`/login`)

**Layout:** Auth shell  
**Card width:** max-w-sm

```
Logo + tagline (centered above card)

Card contents:
  Title:    "Welcome back"  — display-sm Plus Jakarta Sans
  Sub:      "Sign in to your Snip account"  — text-sm text-gray-500

  Form:
    Email / Username:  input + faUser left icon
    Password:          input + faEye toggle right icon
    "Forgot password?" text-xs text-violet-600 hover:underline (right-aligned)

  Submit button:   "Sign in" primary full-width lg
  Loading state:   "Signing in…" with spinner

  Divider:         "or continue with" — text-xs text-gray-400 with lines

  OAuth buttons (secondary, full-width):
    [G] Continue with Google
    [⌘] Continue with GitHub

  Footer:  "Don't have an account? Sign up →"
           text-sm text-gray-500 + text-violet-600 link

Error banner (above button):
  bg-red-50 border border-red-100 rounded-lg px-4 py-3
  flex items-center gap-2 text-sm text-red-600
  faCircleXmark icon + message + animate__headShake on repeated failure
```

---

### 12.3 Signup Page (`/signup`)

**Layout:** Auth shell  
**Card width:** max-w-sm

```
Logo + tagline

Card:
  Title:    "Create your account"  — display-sm
  Sub:      "Free forever. No credit card."

  Form fields (in order):
    First Name:   text input
    Last Name:    text input
    Username:     text input
      Availability indicator: spinning → ✓ green / ✗ red (debounced 500ms)
    Password:     password input + visibility toggle
      Strength bar: 4-segment bar below input
        Segments: gray → red → amber → yellow → green based on score

  Terms:     checkbox + "I agree to the Terms of Service and Privacy Policy"
             (required, links open in new tab)

  Submit:    "Create account" primary full-width lg
             disabled until all fields valid + terms checked

  Footer:    "Already have an account? Sign in →"

Error:       same pattern as login page
Success:     redirects to onboarding flow or /dashboard
```

**Password strength rules (visual only — server always validates):**
```
1 char     → 1 red segment
8 chars    → 2 amber segments
+uppercase → 3 yellow segments
+symbol    → 4 green segments (strong)
```

---

### 12.4 Dashboard (`/dashboard`)

**Layout:** App shell  
**Auth:** Required → redirect to /login

```
Top stats row (4 cards):
  Total Links     / faLinkSimple    / violet
  Total Files     / faFile          / sky
  Clicks Today    / faChartLine     / emerald
  Storage Used    / faDatabase      / amber

Recent Activity feed (left 2/3):
  Card: "Recent Activity"
  Items: last 10 events (link created, file uploaded, link clicked)
  Each item:
    icon-circle + event description + timestamp (relative: "2 min ago")
    link to the affected resource

Quick actions (right 1/3):
  Card: "Quick Actions"
  "Shorten a URL" — text input + "Snip it" button inline
  "Upload a file" — upload zone (compact, h-24)

Top Links this week (below, full-width):
  Table: Slug | Destination (truncated) | Clicks | Created | Actions
```

---

### 12.5 My Links (`/links`)

**Layout:** App shell  
**Purpose:** Manage all shortened URLs

```
Header row:
  Left:   "My Links" display-md + count badge
  Right:  "New Link" primary button + faPlus icon

Filter bar:
  Search input (faSearch left icon)  + Status filter dropdown + Date range

Stats row (3 cards):
  Total Links / Active Links / Total Clicks

Links list:
  Each row (cards stacked, not a table):

  ┌──────────────────────────────────────────────────────────┐
  │ [QR] [favicon]  snip.io/abc123  →  original-domain.com  │
  │       Title: Page Title (from OG meta)                   │
  │       432 clicks · Created May 20 · Expires Jun 1        │
  │       [Copy] [QR] [Analytics] [Edit] [Delete]           │
  └──────────────────────────────────────────────────────────┘

  Slug:        font-mono text-sm text-violet-600 font-medium
  Arrow icon:  faArrowRight text-gray-300
  Destination: text-xs text-gray-500 truncate
  Copy button: on click → clipboard + toast "Copied!"

Empty state:
  faLinkSimple 5x + "No links yet" + "Create your first short link" CTA

New Link modal / sheet:
  "Destination URL" input (validated on blur)
  "Custom Slug" input (optional, availability check)
  "Expiry date" date picker (optional)
  "Password protect" toggle + password field (conditional)
  "Redirect type" select (301 / 302 / 307)
  "Preview interstitial" toggle
  Submit: "Create Link" primary
```

---

### 12.6 Link Analytics (`/links/:id/analytics`)

**Layout:** App shell

```
Back link: ← Back to Links

Header:
  Short URL (mono) + "Copy" button
  Destination (truncated)
  Status badge (active / expired / deleted)
  Actions: Edit | Delete | Share

Time range selector:  7d · 30d · 90d · 1y · Custom
                       tabs / segmented control

Stats row (4 cards):
  Total Clicks  / Unique (by IP hash) / Avg. per day / Last click (relative)

Charts (grid 2-up on desktop, stacked mobile):
  Clicks over time:     Line chart (recharts)
  Devices:              Doughnut chart (desktop / mobile / tablet)
  Browsers:             Horizontal bar chart (top 5)
  Top Countries:        World choropleth (react-simple-maps) + ranked list
  Top Referrers:        Ranked list with domain favicon + count + percentage

QR code section:
  Large QR preview + download PNG / SVG buttons + color customiser
```

---

### 12.7 My Files (`/files`)

**Layout:** App shell  
**Currently exists as `files.jsx` — this spec extends it**

```
Header row:
  "My Files" display-md
  Right: "Upload" primary button + view toggle (list/grid)

Filter / sort bar:
  Search input
  Filter: All | Public | Private | Deleted
  Sort: Newest | Oldest | Name A–Z | Size ↓↑
  Type filter: chips (Images | Video | Audio | Docs | Code | Other)

Stats row (4 cards):  [already implemented — keep, update colors to violet]
  Total / Public / Private / Deleted

Files view — List mode (default):
  [already implemented — keep structure, update colors from blue→violet]
  Add: drag handle column (for folder ordering)
  Add: checkbox column (for multi-select)
  Add: folder breadcrumb above list

Files view — Grid mode:
  grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4
  Each cell:
    File thumbnail (image preview or Mime icon on coloured bg)
    Overlay on hover: preview / download / actions
    File name (truncated, 1 line)
    File size + date (text-2xs text-gray-400)
    Visibility badge (bottom-left)

Folder sidebar (left panel, toggleable):
  Folder tree with indentation
  "New Folder" button at top
  Drag-over highlight

Multi-select toolbar (appears at top when ≥1 checked):
  "{n} selected"  [Move] [Delete] [Download as ZIP] [×]

Preview modal:  [already implemented — keep, extend with metadata panel]
```

---

### 12.8 Upload Page (`/upload`)

**Layout:** App shell  
**Currently exists as `upload.jsx`**

```
Card: "Upload Files"
  Subtitle: "Drag and drop or browse — up to 10 files at once, max 100MB each"

  Upload zone: [see 10.10 spec above — update blue→violet]

  Queued files list (below zone):
    Each file row:
      [Mime icon] [filename] [size]  [remove × button]
    Preview button (opens mini-modal for image/video/audio)

  Progress section (appears after "Upload" clicked):
    Overall progress bar (large, h-2)
    Per-file progress rows (h-1 bars)

  Upload button: "Upload {n} file(s)" primary lg — disabled if empty queue

  After success:
    Success toast
    "Go to My Files" link + confetti burst (lightweight canvas)
```

---

### 12.9 Account Settings (`/account`)

**Layout:** App shell  
**Currently exists as `account.jsx`**

```
Tabs:  Profile | Security | Preferences | Notifications | Danger Zone
       tab bar: border-b border-gray-200, active tab: border-b-2 border-violet-600 text-violet-600

── Profile tab ──
  Avatar:
    Circle avatar (current: initials fallback, later: uploaded image)
    "Change photo" button below
  
  Profile fields (2-column grid on md+):
    First Name / Last Name / Username / Email / Bio (textarea) / Website / Location

  "Save Changes" primary button (bottom right)
  Success/error inline feedback

── Security tab ──
  Change Password:
    Current password / New password (strength bar) / Confirm new
    "Update Password" button

  Two-Factor Authentication:
    Status badge + "Enable 2FA" CTA or TOTP setup flow

  Active Sessions:
    Table: Device | IP | Location | Last active | [Revoke]
    "Sign out all other devices" danger ghost button

  API Keys:
    List of active keys: Label | Scopes | Last used | [Revoke]
    "Create API Key" button → modal

── Preferences tab ──
  Theme:       3-way toggle: Light / Dark / System
  Timezone:    Select dropdown
  Default link expiry: Select (Never / 7d / 30d / 90d / 1y)
  Email notifications: toggle list
    - File shared with me
    - Link near expiry
    - Weekly analytics summary
    - Security alerts

── Notifications tab ──
  Notification list (same as /notifications page, filtered to account-relevant)

── Danger Zone tab ──
  "Delete Account" — bg-red-50 border border-red-200 rounded-xl p-5
    Warning text explaining consequences
    "Delete my account" danger button → confirmation modal
    Modal requires typing username to confirm
```

---

### 12.10 Notifications (`/notifications`)

**Layout:** App shell

```
Header: "Notifications" + "Mark all as read" ghost button

Filter: All | Unread | Files | Links | Security | System

Notification list:
  Unread items: bg-violet-50 dark:bg-violet-950/20
  Each row:
    Icon circle (type-coloured)  + message  + timestamp (relative)
    On click: mark read + navigate to resource

Empty state: faBell 3x + "All caught up!"
```

---

### 12.11 Analytics Overview (`/analytics`)

**Layout:** App shell

```
Header: "Analytics"
Time range selector: 7d | 30d | 90d | 1y | All time

Summary cards (4):
  Total clicks / Unique visitors / Links created / Files downloaded

Top links table (top 10 by clicks):
  Rank | Slug | Destination | Clicks | Trend sparkline | % of total

Charts section:
  Full-width: Aggregate clicks over time (line)
  2-col grid:
    Left:  Traffic by source (referrers — doughnut)
    Right: Top countries (map + table)
  2-col grid:
    Left:  Device breakdown (doughnut)
    Right: Browser breakdown (bar)

Export button: top-right → "Export CSV" dropdown (date range + format)
```

---

### 12.12 Trash (`/trash`)

**Layout:** App shell

```
Header: "Trash" + "Empty Trash" danger ghost button (top-right)

Info banner:
  bg-amber-50 rounded-xl border border-amber-100 px-4 py-3
  faTriangleExclamation text-amber-500
  "Items in trash will be permanently deleted after 30 days."

Tabs: Files | Links

List (same layout as /files and /links but read-only actions):
  Each row shows "Deleted X days ago · Permanently deleted in Y days"
  Actions: [Restore] | [Delete Permanently]
```

---

### 12.13 Search Results (`/search?q=`)

**Layout:** App shell

```
Search bar (full-width, top of page — also auto-focused when ⌘K pressed)

Result groups (stacked):
  "Links (3)"   — link cards
  "Files (7)"   — file rows
  "Folders (1)" — folder links

Each result highlights the matched query term in bold.

Empty: faMagnifyingGlass + "No results for "{query}"" + suggestions
```

---

### 12.14 Command Palette (overlay, any page)

**Trigger:** `⌘K` / `Ctrl+K`

```
Overlay:     fixed inset-0 bg-black/40 backdrop-blur-sm z-[70]
Panel:       max-w-xl w-full bg-white rounded-2xl shadow-2xl mt-[15vh] mx-auto
             ring-1 ring-black/10

Input:       px-4 pt-4 pb-3 — faMagnifyingGlass left icon, large input, no border
Divider:     border-t border-gray-100

Results:     max-h-96 overflow-y-auto divide-y divide-gray-50

Section headers: px-4 py-2 text-2xs font-semibold text-gray-400 uppercase tracking-widest
                  bg-gray-50

Result item:     px-4 py-2.5 flex items-center gap-3 cursor-pointer
                  hover:bg-violet-50 hover:text-violet-700
                  Icon + Label + Right: kbd shortcut or meta text

Footer:      px-4 py-2 border-t border-gray-100
             text-2xs text-gray-400 flex gap-4
             ↑↓ navigate · ↵ open · ESC close
```

---

### 12.15 Link Redirect Interstitial (`/p/:slug`)

**Layout:** Minimal (no sidebar, no topbar)  
**Purpose:** Show a preview before redirecting — optional per link

```
bg-gray-50 min-h-screen flex flex-col items-center justify-center p-4

Card: max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden

  OG image (if available): w-full h-40 object-cover (bg-gray-100 if no image)

  Body: p-6
    Favicon + Domain:    flex items-center gap-2 text-sm text-gray-500
    Page title:          text-base font-semibold text-gray-900 (Plus Jakarta Sans)
    Destination URL:     text-xs font-mono text-gray-400 truncate
    Description:         text-sm text-gray-500 mt-2 (max 2 lines, truncate)

  Footer: p-4 bg-gray-50 border-t border-gray-100
    Left:  "You are leaving Snip" text-xs text-gray-400
    Right: "Continue →" primary button md

  Countdown: optional 5-second auto-redirect
    Progress bar below OG image: h-0.5 bg-violet-600 animate-width
    "Redirecting in 5s…" text-xs text-gray-400 + "Cancel" link

  Powered by:  "Shortened with Snip" footer link — text-2xs text-gray-300
```

---

### 12.16 Password-Protected Link (`/l/:slug`)

**Layout:** Minimal (same shell as interstitial)

```
Card: max-w-sm w-full bg-white rounded-2xl shadow-lg p-8

  Icon:  w-14 h-14 bg-violet-50 rounded-2xl mx-auto flex items-center justify-center
         faLock text-violet-600 text-2xl

  Title: "Protected Link" mt-4 text-center display-sm
  Sub:   "Enter the password to continue" text-sm text-gray-500 text-center mt-2

  Form:
    Password input (full-width) + show/hide toggle
    Error: "Incorrect password. Try again." — headShake animation
    Submit: "Unlock" primary full-width md

  Footer: "Powered by Snip" text-xs text-gray-300 text-center mt-6
```

---

### 12.17 Public Profile (`/u/:username`)

**Layout:** Public shell (navbar + footer)

```
Hero section: bg-gradient-to-b from-violet-50 to-white py-16
  Avatar (w-24 rounded-full)
  Display name (display-lg Plus Jakarta Sans)
  Username (@handle text-violet-600 font-mono)
  Bio (text-sm text-gray-500 max-w-xs text-center)
  Website link (if set)

Tabs:  Public Files | Public Links

Files grid: 3-col grid, same file cards as /files grid mode (public only)
Links list: link cards without edit/delete actions
```

---

### 12.18 Onboarding Wizard (`/welcome`)

**Layout:** Fullscreen (no sidebar/topbar) — one-time flow after signup

```
Background: bg-gradient-to-br from-violet-50 via-white to-sky-50

Progress:   top-8 right-8 text-sm text-gray-400 "Step 2 of 4"
            4-dot progress (filled = violet, empty = gray-200)

Card:       max-w-lg mx-auto mt-20 bg-white rounded-3xl shadow-xl p-10

Step 1 — Welcome:
  faScissors 3x text-violet-600
  "Welcome to Snip, {name}!" display-md
  "Let's get you set up in 2 minutes." text-gray-500
  "Let's go →" primary lg

Step 2 — Profile:
  "Tell us a bit about yourself"
  Bio + Website + Location fields (all optional)
  "Continue →" | "Skip"

Step 3 — First Link:
  "Create your first short link"
  URL input + "Snip it!" inline
  Animated checkmark on success + confetti
  Shows the created short link with copy button
  "Continue →"

Step 4 — Enable 2FA:
  "Secure your account"
  QR code (or skip)
  "Enable 2FA" | "Remind me later"

Completion:
  Confetti burst
  "You're all set!" display-md
  "Go to Dashboard" primary lg
```

---

### 12.19 Admin Panel (`/admin`)

**Layout:** App shell with admin-specific nav items  
**Auth:** `role: admin` required → 403 page if non-admin

```
Admin nav section (in sidebar):
  Users | Audit Log | Quarantine | System Health | Queue Monitor

── Users page ──
  Table: Avatar | Name | Email | Username | Role | Status | Joined | Actions
  Actions: View | Promote/Demote | Suspend | Delete
  Filter: All | Admin | Suspended | Recently joined

── Audit Log ──
  Table: Timestamp | User | Action | Resource | IP
  Filter: action type, date range, user
  Export CSV

── System Health ──
  Cards: DB pool active/idle | Redis memory | Queue depth | Failed jobs
  Charts: request rate / error rate (last 1h)

── Quarantine ──
  Files flagged by virus scanner
  Table: Filename | Uploader | Flagged at | Virus name | Actions (release / delete)
```

---

### 12.20 404 Page (`/*`)

**Layout:** Minimal (logo only, no sidebar)  
**Currently exists as `404.jsx`**

```
bg-gray-50 min-h-screen flex flex-col items-center justify-center gap-6 text-center p-4

Number:    "404" — font-display text-[120px] font-bold text-gray-100 leading-none
Icon:      faScissors absolute text-4xl text-violet-300 (overlaid on number)

Title:     "Page not found" display-md text-gray-800
Sub:       "The link you followed may be broken, or the page may have been removed."
           text-sm text-gray-500 max-w-sm

Buttons:   flex gap-3 justify-center mt-2
  Primary:   "← Back to Dashboard" → /dashboard
  Secondary: "Contact Support" → mailto:

Footer:    "Snip © 2026" text-xs text-gray-300 absolute bottom-6
```

---

## 13. Responsive Breakpoints

| Name | Min-width | Primary use |
|---|---|---|
| `xs` (default) | 0px | Mobile portrait — single-column |
| `sm` | 640px | Mobile landscape, small tablets |
| `md` | 768px | Tablets — 2-column grids begin |
| `lg` | 1024px | Desktops — sidebar appears, 3-col grids |
| `xl` | 1280px | Wide desktop — 4-5 col grids, larger charts |
| `2xl` | 1536px | Ultrawide — content max-width reached, no wider |

### Responsive Rules
- **Sidebar:** `hidden lg:flex` — hamburger on mobile
- **File grid:** `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`
- **Stats row:** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
- **Form layouts:** `grid-cols-1 md:grid-cols-2`
- **Charts side-by-side:** `grid-cols-1 lg:grid-cols-2`
- **Modal max-width:** `max-w-lg` on sm+; `w-full mx-4` on mobile
- **Typography scale down:** display-2xl → display-xl on mobile for hero text
- **Touch targets:** All interactive elements `min-h-[44px] min-w-[44px]`

---

## 14. Tailwind Config

```js
// tailwind.config.js
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './short/src/**/*.{js,jsx,ts,tsx}',
    './short/public/index.html',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Plus Jakarta Sans"', ...defaultTheme.fontFamily.sans],
        sans:    ['Inter',              ...defaultTheme.fontFamily.sans],
        mono:    ['"JetBrains Mono"',  ...defaultTheme.fontFamily.mono],
      },
      fontSize: {
        '2xs':           ['0.625rem', { lineHeight: '1rem' }],
        'display-sm':    ['1.5rem',   { lineHeight: '2rem',   fontWeight: '600' }],
        'display-md':    ['2rem',     { lineHeight: '2.5rem', fontWeight: '700' }],
        'display-lg':    ['2.5rem',   { lineHeight: '3rem',   fontWeight: '700' }],
        'display-xl':    ['3.5rem',   { lineHeight: '4rem',   fontWeight: '700' }],
        'display-2xl':   ['4.5rem',   { lineHeight: '5rem',   fontWeight: '800' }],
      },
      colors: {
        brand: {
          50:  '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',  // ← primary
          700: '#6D28D9',  // ← hover
          800: '#5B21B6',
          900: '#4C1D95',
          950: '#2E1065',
        },
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0,0,0,0.05)',
      },
      animation: {
        'width': 'width 5s linear forwards',
      },
      keyframes: {
        width: {
          '0%':   { width: '100%' },
          '100%': { width: '0%' },
        },
      },
      maxWidth: {
        '8xl': '88rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/line-clamp'),
    require('@tailwindcss/aspect-ratio'),
  ],
};
```

---

## 15. Accessibility Standards

### Target: WCAG 2.1 AA

| Requirement | Implementation |
|---|---|
| Colour contrast (text) | ≥ 4.5:1 for normal text; ≥ 3:1 for large text — tested with axe-core |
| Focus indicators | `focus-visible:ring-2 ring-violet-500 ring-offset-2` on all interactive elements |
| Focus trap | All modals trap focus; ESC closes; first focusable element receives focus on open |
| Skip link | `<a href="#main">Skip to content</a>` — first focusable on every page, `sr-only focus:not-sr-only` |
| Image alt text | All `<img>` elements have descriptive `alt`; decorative images use `alt=""` |
| Icon-only buttons | All `<button>` with only an icon have `aria-label` |
| Form labels | Every `<input>` has an associated `<label>` via `htmlFor` or `aria-label` |
| Error messages | `role="alert"` on error messages; `aria-describedby` linking input to error |
| Live regions | Toast notifications use `role="status"` or `role="alert"` |
| Reduced motion | All `transition-*` and `animate__` classes wrapped in `@media (prefers-reduced-motion: no-preference)` |
| Keyboard navigation | All file/link list items navigable with arrow keys; Del to delete, Enter to open |
| Semantic HTML | `<nav>`, `<main>`, `<header>`, `<footer>`, `<section>`, `<aside>` used structurally |
| Table headers | All `<table>` elements use `<th scope="col">` / `<th scope="row">` |
| Loading states | `aria-busy="true"` on containers while loading |

### Screen Reader Labels
```jsx
/* Spinner */
<FontAwesomeIcon icon={faSpinner} className="animate-spin" aria-hidden="true" />
<span className="sr-only">Loading…</span>

/* Icon-only button */
<button aria-label="Delete file">
  <FontAwesomeIcon icon={faTrash} aria-hidden="true" />
</button>

/* Copy button with state */
<button aria-label={copied ? "Copied!" : "Copy to clipboard"}>
  <FontAwesomeIcon icon={copied ? faCheck : faCopy} aria-hidden="true" />
</button>
```

---

*This document is the single source of truth for all visual and UX decisions.  
Update it when design choices change — don't let implementation drift from spec.*
