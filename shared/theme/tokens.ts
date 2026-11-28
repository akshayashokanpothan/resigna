/**
 * Resigna radius, spacing and elevation tokens. Mirrors app/globals.css.
 * Use the Tailwind utilities (rounded-control, rounded-card, rounded-dialog, p-4…) in components.
 */

/** Radius — 10 px controls, 16 px cards, 20 px dialogs, pill for chips and badges. */
export const radius = {
  xs: '4px',
  sm: '6px',
  control: '10px',
  card: '16px',
  dialog: '20px',
  pill: '999px',
} as const;

/** Spacing — 4 px grid. Preferred steps from the brand kit. Tailwind's p-1 = 4 px, p-2 = 8 px… */
export const spacing = {
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  24: '96px',
} as const;

/** Elevation — borders first. Shadows only for floating layers (menus, dialogs, toasts). */
export const shadows = {
  none: 'none',
  raised: 'var(--shadow-raised)',
  overlay: 'var(--shadow-overlay)',
} as const;

/** Layering order for floating UI. */
export const zIndex = {
  sticky: 10,
  dropdown: 30,
  overlay: 40,
  dialog: 50,
  toast: 60,
  tooltip: 70,
} as const;
