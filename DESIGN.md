# Claude UI — Design System Specification

## Overview

This document defines the design language for mocking Claude's interface. It covers color, typography, iconography, and all available assets. All iterations should use these specs as their foundation.

---

## Color System

### Claude Brand Colors

| Name | Hex | Role |
|---|---|---|
| Crail | `#C15F3C` | Signature accent — rust-orange, used for CTAs, highlights, active states |
| Cloudy | `#B1ADA1` | Warm grey — secondary text, borders, muted elements |
| Pampas | `#F4F3EE` | Warm off-white — primary background |
| White | `#FFFFFF` | Pure white — cards, input fields |

### Anthropic Extended Palette

| Name | Hex | RGB | HSL | Usage |
|---|---|---|---|---|
| Antique Brass | `#CC785C` | 204, 120, 92 | 15°, 52%, 58% | Warm accent variant |
| Friar Gray | `#828179` | 130, 129, 121 | 53°, 4%, 49% | UI text, icons |
| Cararra | `#F0EFEA` | 240, 239, 234 | 50°, 17%, 93% | Subtle backgrounds, code block trim |
| Cod Gray | `#141413` | 20, 20, 19 | 60°, 3%, 8% | Sidebar, dark surfaces, primary text |
| White | `#FFFFFF` | 255, 255, 255 | 0°, 0%, 100% | Pure white surfaces |

### Semantic Color Tokens

Map these semantic names to values per light/dark mode:

```css
:root {
  /* Backgrounds */
  --bg-primary: #F4F3EE;       /* Pampas — main chat area */
  --bg-sidebar: #141413;       /* Cod Gray — sidebar */
  --bg-input: #F0EFEA;         /* Cararra — input field */
  --bg-message-human: #F0EFEA; /* Human message bubble */

  /* Text */
  --text-primary: #141413;     /* Primary content */
  --text-secondary: #828179;   /* Friar Gray — secondary/muted */
  --text-on-dark: #FFFFFF;     /* Text on sidebar */

  /* Accent */
  --accent: #C15F3C;           /* Crail — interactive highlight */
  --accent-warm: #CC785C;      /* Antique Brass — hover/softer accent */

  /* Borders & Dividers */
  --border: #B1ADA1;           /* Cloudy — dividers, subtle borders */
  --border-subtle: #E8E7E2;    /* Light borders */
}
```

---

## Typography

### Font Stack

| Font | Source | Role |
|---|---|---|
| **SF Pro** | System font (macOS/iOS) | All UI chrome — labels, buttons, sidebar, inputs, timestamps, metadata |
| **Test Tiempos Headline** | `/Test Tiempos Headline/` | All AI-generated output — Claude's response text |
| **SF Compact Rounded** | `SF-Compact-Rounded-Regular.otf` | Accent/display use — numerals, pills, badges |

### Test Tiempos Headline — Available Weights

All weights available in both regular and italic variants:

| Weight | File |
|---|---|
| Light | `test-tiempos-headline-light.woff2` |
| Regular | `test-tiempos-headline-regular.woff2` |
| Medium | `test-tiempos-headline-medium.woff2` |
| Semibold | `test-tiempos-headline-semibold.woff2` |
| Bold | `test-tiempos-headline-bold.woff2` |
| Black | `test-tiempos-headline-black.woff2` |

> **Usage rule:** Use **Regular** for body responses, **Medium** for headings within responses, **Light** for long-form reading at large sizes.

### CSS Font Declarations

```css
/* Test Tiempos Headline — declare all weights */
@font-face {
  font-family: 'Tiempos Headline';
  src: url('Test Tiempos Headline/test-tiempos-headline-light.woff2') format('woff2');
  font-weight: 300; font-style: normal;
}
@font-face {
  font-family: 'Tiempos Headline';
  src: url('Test Tiempos Headline/test-tiempos-headline-light-italic.woff2') format('woff2');
  font-weight: 300; font-style: italic;
}
@font-face {
  font-family: 'Tiempos Headline';
  src: url('Test Tiempos Headline/test-tiempos-headline-regular.woff2') format('woff2');
  font-weight: 400; font-style: normal;
}
@font-face {
  font-family: 'Tiempos Headline';
  src: url('Test Tiempos Headline/test-tiempos-headline-regular-italic.woff2') format('woff2');
  font-weight: 400; font-style: italic;
}
@font-face {
  font-family: 'Tiempos Headline';
  src: url('Test Tiempos Headline/test-tiempos-headline-medium.woff2') format('woff2');
  font-weight: 500; font-style: normal;
}
@font-face {
  font-family: 'Tiempos Headline';
  src: url('Test Tiempos Headline/test-tiempos-headline-medium-italic.woff2') format('woff2');
  font-weight: 500; font-style: italic;
}
@font-face {
  font-family: 'Tiempos Headline';
  src: url('Test Tiempos Headline/test-tiempos-headline-semibold.woff2') format('woff2');
  font-weight: 600; font-style: normal;
}
@font-face {
  font-family: 'Tiempos Headline';
  src: url('Test Tiempos Headline/test-tiempos-headline-bold.woff2') format('woff2');
  font-weight: 700; font-style: normal;
}
@font-face {
  font-family: 'Tiempos Headline';
  src: url('Test Tiempos Headline/test-tiempos-headline-black.woff2') format('woff2');
  font-weight: 900; font-style: normal;
}

/* SF Compact Rounded */
@font-face {
  font-family: 'SF Compact Rounded';
  src: url('SF-Compact-Rounded-Regular.otf') format('opentype');
  font-weight: 400; font-style: normal;
}
```

### Type Scale

| Role | Font | Size | Weight | Line Height |
|---|---|---|---|---|
| AI response body | Tiempos Headline | 16px | 400 | 1.75 |
| AI response heading (h3) | Tiempos Headline | 18px | 500 | 1.4 |
| AI response heading (h2) | Tiempos Headline | 20px | 600 | 1.3 |
| UI labels / sidebar items | SF Pro | 14px | 400 | 1.4 |
| UI buttons | SF Pro | 14px | 500 | 1 |
| Input field text | SF Pro | 16px | 400 | 1.5 |
| Timestamps / metadata | SF Pro | 12px | 400 | 1 |
| Code blocks | Monospace (JetBrains Mono / system) | 13px | 400 | 1.6 |

---

## Brand Assets

### Logo & Avatar

| File | Description | Usage |
|---|---|---|
| `assets/asset 1.svg` | **"Claude" wordmark** — full SVG text logo | Top of sidebar, about pages |
| `assets/asset 24.svg` | **Claude avatar** — the butterfly/neural mark SVG | Message avatar, loading states, empty states |
| `assets/asset 0.webp` | **Animated avatar** — animated webp variant | Streaming / thinking animation state |

### Iconography

All icons are 20×20px SVGs using `fill="currentColor"` — color them via CSS `color` property.

| File | Icon | Usage |
|---|---|---|
| `assets/asset 2.svg` | **Sidebar toggle** — panel layout split | Show/hide sidebar |
| `assets/asset 3.svg` | **Send / arrow** — right-pointing arrow | Submit message, confirm action |
| `assets/asset 4.svg` | **Plus** — cross/add | New conversation button |
| `assets/asset 5.svg` | **Search** — magnifying glass | Search conversations |
| `assets/asset 6.svg` | **Projects** — briefcase/folder | Projects section in sidebar |
| `assets/asset 7.svg` | **Conversations** — two speech bubbles | Conversations section in sidebar |
| `assets/asset 8.svg` | **Stack / Library** — layered cards | History, stacked items |
| `assets/asset 9.svg` | **Sparkles / Stars** — multi-star | Featured, AI-powered, starred content |
| `assets/asset 10.svg` | **Code** — `</>` brackets | Code mode, code block label |
| `assets/asset 11.svg` | **More (inline)** — three horizontal dots | Inline action overflow menu |
| `assets/asset 12.svg` | **More (circle)** — three dots in circle | Circular overflow / options button |
| `assets/asset 13.svg` | **Download** — down arrow to tray | Export, download response |
| `assets/asset 14.svg` | **Sort** — up/down chevrons | Sort direction toggle |
| `assets/asset 15.svg` | **Chevron down** — single chevron | Expand/collapse, dropdown trigger |
| `assets/asset 16.svg` | **Regenerate** — circular arrow | Retry / regenerate response |
| `assets/asset 17.svg` | **Edit** — pen/nib | Edit message |
| `assets/asset 18.svg` | **Copy** — default state | Copy message content |
| `assets/asset 19.svg` | **Copy success** — hidden by default, shown on success | Swaps in after copy action |
| `assets/asset 20.svg` | **Chevron down (sm)** — 16px variant | Compact dropdowns, inline selects |
| `assets/asset 21.svg` | **Thumbs up** — upward thumb | Positive feedback on response |
| `assets/asset 22.svg` | **Thumbs down** — downward thumb | Negative feedback on response |
| `assets/asset 23.svg` | **Star / Bookmark** — accent-colored | Starred / saved items |
| `assets/asset 25.svg` | **Upload** — up arrow | Attach / upload file (luminosity blend mode) |
| `assets/asset 26.svg` | **Share / Plus** — outward arrow | Share conversation |
| `assets/asset 27.svg` | **Chevron down (sm, muted)** — 16px, 75% opacity | Subtle expand indicators |
| `assets/asset 28.svg` | **Streaming cursor** — animated rect | Blinking cursor shown while Claude is generating |
| `assets/asset 29.svg` | **File / Document** — page with content | Attached file preview, CSV/code file type |

### Icon Usage Guidelines

```css
/* Default icon color */
.icon { color: #828179; }           /* Friar Gray — resting state */
.icon:hover { color: #141413; }     /* Cod Gray — hover state */
.icon.active { color: #C15F3C; }    /* Crail — active/selected state */
.icon.accent { color: #C15F3C; }    /* Crail — accent icons (star, bookmark) */
```

### Fallback Icon Library

When a needed icon is not available in the `assets/` folder, use **[Lucide Icons](https://lucide.dev)** as the fallback. Load via CDN — no install needed:

```html
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
```

Then use anywhere with:
```html
<i data-lucide="pencil" width="16" height="16"></i>
```
And initialize once with `lucide.createIcons()`.

Lucide is the preferred fallback because it matches Claude's thin, clean stroke style. Avoid mixing in other icon sets (Heroicons, Phosphor, etc.) — pick one and stay consistent per iteration.

---

## Layout

### Structural Regions

```
┌─────────────────────────────────────────────────────────┐
│  Sidebar (260px)          │  Main Chat Area              │
│  bg: #141413              │  bg: #F4F3EE                 │
│                           │                              │
│  [Logo]                   │  [Message thread]            │
│  [Nav items]              │                              │
│                           │  [Input bar at bottom]       │
│  [Conversation list]      │  bg: #F0EFEA                 │
│                           │                              │
│  [User profile]           │                              │
└───────────────────────────┴──────────────────────────────┘
```

### Key Dimensions

| Element | Value |
|---|---|
| Sidebar width | 260px |
| Input bar max-width | 680px |
| Message max-width | 680px |
| Sidebar item padding | 8px 12px |
| Message vertical spacing | 24px |
| Input padding | 12px 16px |
| Border radius (input) | 12px |
| Border radius (message bubble) | 8px |
| Border radius (buttons) | 8px |

---

## Motion & Interaction

### Streaming Text Cursor
Use `assets/asset 28.svg` — the animated rect — inline after the last character while Claude is generating. Fade it out when streaming completes.

### Copy Button State Swap
- Default: show `asset 18.svg` (copy icon)
- On click: swap to `asset 19.svg` (success/checkmark icon) for 1500ms, then revert
- `asset 19.svg` uses `opacity-0 scale-50` by default; animate to `opacity-100 scale-100`

### Hover Transitions
All icon hover state transitions: `150ms ease`
Sidebar item hover background: subtle `rgba(255,255,255,0.06)` on dark sidebar

---

## Iteration File Structure

```
/Documents/Claude /
├── DESIGN.md                     ← This file
├── index.html                    ← Iteration launcher / dashboard
├── shared/
│   └── api.js                    ← Shared Anthropic API streaming logic
├── assets/                       ← All SVG icons + avatar assets
├── Test Tiempos Headline/        ← Tiempos font files (.woff2)
├── SF-Compact-Rounded-Regular.otf
└── iterations/
    ├── v1/index.html
    ├── v2/index.html
    └── v3/index.html
```

Each iteration file should declare at the top:

```javascript
const ITERATION = {
  version: "v1",
  focus: "Baseline — faithful Claude recreation",
  date: "2026-03-17",
};
```

---

## Asset Path Reference (relative to iteration files)

Since iterations live in `iterations/vN/`, use `../../` to reference root assets:

```html
<!-- Fonts -->
<link> or @font-face url('../../Test Tiempos Headline/test-tiempos-headline-regular.woff2')

<!-- Icons -->
<img src="../../assets/asset 1.svg">  <!-- Claude wordmark -->
<img src="../../assets/asset 24.svg"> <!-- Claude avatar -->

<!-- Or inline the SVG directly for color control via currentColor -->
```
