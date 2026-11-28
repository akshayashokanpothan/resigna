# Resigna design system — v1.0

The Resigna design system turns the brand kit (`Resigna_Claude_Handoff_Kit_v1.0`) and the product
vision (§13–15) into tokens and accessible components. The quality bar is IBM Carbon: semantic
tokens, every state covered, WCAG 2.2 AA, full keyboard support, and documentation.

- **Live reference:** `/design-system` in the app (open it from ⌘K → "Open design system reference").
- **Tokens:** `app/globals.css` (source of truth) and `shared/theme/*` (for JS).
- **Components:** `shared/components/*`.
- **Brand assets:** `public/brand/*`, `app/icon.png`, `app/apple-icon.png`, `app/favicon.ico`,
  `app/opengraph-image.png`, `app/twitter-image.png`, `app/manifest.ts`.

## Principles

1. **Calm, dark-first, evidence first.** Neutral layers; indigo only for actions, focus and signals.
2. **Borders before shadows.** Shadows are only for things that float (menus, dialogs, toasts).
3. **Every screen has loading, empty and error states.** Loading is a skeleton, never a spinner.
4. **Accessible by default.** AA contrast, visible focus, keyboard operable, correct semantics.
5. **Fast, quiet motion.** 150 / 200 / 300 ms, opacity and small translations, no bounce.
   `prefers-reduced-motion` is honoured globally.

## Tokens

Three tiers:

| Tier      | Example                             | Who uses it                        |
| --------- | ----------------------------------- | ---------------------------------- |
| Primitive | `--resigna-accent: #6E5CF6`         | Only `globals.css`                 |
| Semantic  | `--color-accent` → `bg-accent`      | Components, via Tailwind utilities |
| Component | `buttonVariants`, `controlVariants` | Pages and features                 |

Tailwind's default palette, radii and shadows are switched off, so `bg-blue-500` or `rounded-lg`
do not exist. Use the semantic utilities below.

### Colour

Contrast ratios are against the canvas `#0B0D12` unless noted.

| Utility                             | Value                 | Use                               | Contrast         |
| ----------------------------------- | --------------------- | --------------------------------- | ---------------- |
| `bg-canvas`                         | `#0B0D12`             | Page background                   |                  |
| `bg-surface`                        | `#11151C`             | Panels, cards, sidebar            |                  |
| `bg-surface-raised`                 | `#181D26`             | Menus, popovers, raised cards     |                  |
| `bg-layer-hover`                    | `#1C222C`             | Hover on any layer                |                  |
| `bg-layer-selected`                 | `#222936`             | Selected / pressed                |                  |
| `border-border`                     | `#262D39`             | Dividers, card edges (decorative) |                  |
| `border-border-strong`              | `#636D7E`             | Control outlines                  | 3.2:1+ (1.4.11)  |
| `text-fg`                           | `#F5F7FA`             | Primary text                      | 18.1:1           |
| `text-fg-secondary`                 | `#9AA5B1`             | Supporting text, labels           | 7.8:1            |
| `text-fg-muted`                     | `#6B7280`             | **Placeholder and disabled only** | 4.0:1            |
| `bg-accent`                         | `#6E5CF6`             | Primary action, signal            | white text 4.6:1 |
| `bg-accent-hover`                   | `#5E4DE8`             | Primary hover / pressed           | white text 6.0:1 |
| `text-accent-text`, `outline-focus` | `#8B7CFF`             | Links, accent copy, focus ring    | 6.0:1            |
| `bg-accent-subtle`                  | 14 % indigo           | Selected tags, suggestion tint    |                  |
| `success` / `warning`               | kit                   | Status (icon, dot, text)          | 8.5:1 / 9.1:1    |
| `danger` / `text-danger-text`       | `#EF4444` / `#F87171` | Error border / error copy         | 5.2:1 / 7.0:1    |
| `bg-danger-solid`                   | `#DC2626`             | Danger button                     | white text 4.8:1 |
| `info` / `text-info-text`           | `#3B82F6` / `#60A5FA` | Info border / info copy           | 5.3:1 / 7.6:1    |

#### Where we deviate from the kit, and why

The kit's values are kept as primitives. A few semantic roles use a derived step so every pairing
passes AA; each is listed here for brand review.

| Kit value                     | Problem                                     | Semantic role uses             |
| ----------------------------- | ------------------------------------------- | ------------------------------ |
| Accent hover `#7C6CFF`        | White text on it is 3.9:1 (fails AA)        | `#5E4DE8` (darker) for hover   |
| Accent `#6E5CF6` as text      | 4.2:1 on canvas, 3.6:1 on raised (fails AA) | `#8B7CFF` for links and focus  |
| Danger `#EF4444` behind white | White text on it is 3.8:1                   | `#DC2626` for danger buttons   |
| Danger / info as small text   | 4.5:1 on raised surfaces is borderline      | `#F87171` / `#60A5FA` for copy |
| Muted `#6B7280`               | 4.0:1, below AA for body text               | Placeholder and disabled only  |
| Border `#262D39`              | 1.4:1, too faint to outline a control       | `#636D7E` for control borders  |

### Typography

Inter for product UI, IBM Plex Mono for data, IDs and code (both via `next/font`). Fraunces is
marketing-only and never appears in the product.

| Utility           | Size / line | Weight    |
| ----------------- | ----------- | --------- |
| `type-display`    | 32 / 40     | 600       |
| `type-heading-lg` | 24 / 32     | 600       |
| `type-heading-md` | 20 / 28     | 600       |
| `type-heading-sm` | 16 / 24     | 600       |
| `type-body`       | 14 / 20     | 400       |
| `type-body-sm`    | 13 / 18     | 400       |
| `type-label`      | 12 / 16     | 500       |
| `type-caption`    | 12 / 16     | 400       |
| `type-overline`   | 11 / 16     | 600, caps |
| `type-code`       | 12 / 16     | Plex Mono |

### Radius, spacing, elevation, motion

- **Radius:** `rounded-control` 10 px (buttons, inputs), `rounded-card` 16 px, `rounded-dialog` 20 px,
  `rounded-pill`; `rounded-sm` 6 px and `rounded-xs` 4 px for small parts (checkbox, kbd, tooltip).
- **Spacing:** 4 px grid; preferred steps 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 96.
- **Elevation:** `shadow-raised` (1 px) and `shadow-overlay` (menus, dialogs, toasts).
- **Motion:** `duration-fast` 150 ms (default for every `transition-*`), `duration-standard` 200 ms,
  `duration-slow` 300 ms; easings `ease-standard`, `ease-entrance`, `ease-exit`. Framer Motion
  variants live in `shared/theme/motion.ts`.
- **Focus:** `focus-ring` (2 px `#8B7CFF`, 2 px offset) or `focus-ring-inset` inside lists.

## Components

| Component                                       | File                                | States covered                                                                                           | Keyboard / a11y                                                                  |
| ----------------------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Button                                          | `Button.tsx`                        | primary, secondary, tertiary, ghost, danger × default, hover, active, focus, pending, disabled; sm/md/lg | Native button; `type="button"` default; pending sets `aria-busy`                 |
| IconButton                                      | `IconButton.tsx`                    | ghost, secondary, primary, selected, disabled                                                            | Required `label` → `aria-label` and tooltip                                      |
| Field + Input/Textarea/Select                   | `Field.tsx`, `Input.tsx`            | default, hover, focus, invalid, disabled, read-only, with icon                                           | Label, helper and error wired with `htmlFor`, `aria-describedby`, `aria-invalid` |
| Checkbox, Radio, Switch                         | `Choice.tsx`                        | checked, unchecked, mixed, disabled, hover, focus                                                        | Native inputs; RadioGroup is a fieldset; Switch is `role="switch"`               |
| Badge, Tag                                      | `Badge.tsx`                         | 6 tones, dot; tag toggle, selected, removable, disabled                                                  | Filter tags are `aria-pressed` toggles; remove buttons are named                 |
| Card                                            | `Card.tsx`                          | surface, raised, interactive, selected                                                                   | Put a real link/button inside; no clickable divs                                 |
| Tabs                                            | `Tabs.tsx`                          | selected, hover, focus, disabled, count                                                                  | ←/→, Home/End; roving tabindex; labelled panel                                   |
| Menu                                            | `Menu.tsx`                          | items with icons, shortcut, disabled, destructive, header                                                | Enter/Space/↓/↑ open, ↑/↓ move, Home/End, Escape returns focus                   |
| Tooltip                                         | `Tooltip.tsx`                       | hover (400 ms), focus (instant)                                                                          | Escape dismisses; portal, so it is never clipped                                 |
| Dialog                                          | `Dialog.tsx`                        | sm/md/lg                                                                                                 | Focus trap, Escape, returns focus, `aria-modal`, labelled and described          |
| Notification                                    | `Notification.tsx`                  | info, success, warning, danger, with action, dismissible                                                 | `role="alert"` for warning/danger, `role="status"` otherwise                     |
| Toast                                           | `providers/ToastProvider.tsx`       | success, error, warning, info, with action                                                               | Call through `shared/utils/toast.ts`                                             |
| Avatar, Kbd, Logo, LogoSymbol                   | `Avatar.tsx`, `Kbd.tsx`, `Logo.tsx` | sizes, full-colour and mono logo                                                                         | Logo is `role="img"` named "Resigna"; decorative symbol is hidden                |
| Skeleton, LoadingState                          | `Skeleton.tsx`, `LoadingState.tsx`  | line, row, card                                                                                          | Loading regions are `role="status"` with a visually hidden label                 |
| EmptyState                                      | `EmptyState.tsx`                    | page (illustration) and compact (icon)                                                                   | Heading + description + next action                                              |
| ErrorPage, NotFound, NetworkError, Unauthorized | `ErrorPage.tsx`                     | with illustration, retry, extra action                                                                   | `role="alert"`                                                                   |
| Illustration                                    | `Illustration.tsx`                  | 17 kit illustrations                                                                                     | Always decorative (`alt=""`)                                                     |
| PageHeader                                      | `PageHeader.tsx`                    | eyebrow, meta badges, actions                                                                            | One `h1` per page                                                                |

## Brand assets

The assets were imported once from the kit. What changed on the way in:

- **Logos** (`public/brand/logo/*.svg`): C2PA metadata removed; geometry untouched. In the app the
  logo is rendered inline by `Logo` / `LogoSymbol` with the same node coordinates so the wordmark
  uses the loaded Inter (an `<img>` SVG can't load web fonts).
- **Illustrations** (`public/brand/illustrations/{empty,error,loading}`): the 1200 × 800 boards were
  cropped to the artwork (viewBox `300 160 600 460`) and their background and baked-in captions were
  removed, so pages supply their own copy. The kit calls these "v1 concepts".
- **Icons:** favicon (16/32/48 ICO), `icon.png` 32, `apple-icon.png` 180, PWA 192/512 and maskable
  512 from `02_App_Icons` (dark variant). Social images from `04_Social_Previews`.
- **Pattern:** `research-grid-pattern.svg` behind the sign-in and sign-up pages, faded at the edges.

## Navigation

The sidebar follows the vision's information architecture (§12): Overview, Projects, Research,
Participants, Insights, Knowledge, Artifacts, with Settings at the bottom. Items not built yet are
visible but disabled, show a "Soon" tag and explain what will live there in a tooltip. The sidebar
collapses to icons (with tooltips) and starts collapsed below 768 px.

## Not in v1.0

- A light theme. The brand is dark-first; tokens are semantic, so a light theme is a new set of
  values in `globals.css`, not a component change.
- Data table, combobox, date picker, drawer, pagination and progress bar. Add them when the first
  feature needs them, following the patterns here.
- Domain components from the handoff guide (evidence card, insight card, citation). They belong
  with the Knowledge Model UI in a later phase.
