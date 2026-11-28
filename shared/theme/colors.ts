/**
 * Resigna colour tokens (brand kit v1.0).
 *
 * The CSS custom properties in app/globals.css are the source of truth. In components, use the
 * Tailwind utilities they generate (bg-surface, text-fg-secondary, border-border-strong…).
 * These constants exist for places that need a value in JS: canvas drawing, charts, metadata.
 */

/** Raw brand palette, exactly as delivered in Brand_Assets/15_Tokens. */
export const brandPalette = {
  deepCharcoal: '#0B0D12',
  surface: '#11151C',
  elevatedSurface: '#181D26',
  border: '#262D39',
  primaryText: '#F5F7FA',
  secondaryText: '#9AA5B1',
  muted: '#6B7280',
  electricIndigo: '#6E5CF6',
  accentHover: '#7C6CFF',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
} as const;

/** Semantic colour roles → CSS variable references. */
export const colors = {
  canvas: 'var(--color-canvas)',
  surface: 'var(--color-surface)',
  surfaceRaised: 'var(--color-surface-raised)',
  layerHover: 'var(--color-layer-hover)',
  layerSelected: 'var(--color-layer-selected)',
  border: 'var(--color-border)',
  borderStrong: 'var(--color-border-strong)',
  fg: 'var(--color-fg)',
  fgSecondary: 'var(--color-fg-secondary)',
  fgMuted: 'var(--color-fg-muted)',
  accent: 'var(--color-accent)',
  accentHover: 'var(--color-accent-hover)',
  accentText: 'var(--color-accent-text)',
  focus: 'var(--color-focus)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  danger: 'var(--color-danger)',
  info: 'var(--color-info)',
} as const;

export type ColorToken = keyof typeof colors;
