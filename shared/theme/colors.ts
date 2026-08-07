/**
 * Resigna Color Tokens
 *
 * All colors map to CSS variables defined in globals.css.
 * These constants document the semantic intent.
 * Components import from tokens.ts — never use raw hex values.
 */

export const colors = {
  /** Page background — near-black */
  backgroundPrimary: 'hsl(var(--background))',
  /** Slightly elevated surface (cards, panels) */
  backgroundSecondary: 'hsl(var(--card))',
  /** Popover / floating surfaces */
  backgroundElevated: 'hsl(var(--popover))',

  /** Default border */
  borderDefault: 'hsl(var(--border))',
  /** Subtle, de-emphasized border */
  borderMuted: 'hsl(var(--border) / 0.5)',

  /** Primary text */
  textPrimary: 'hsl(var(--foreground))',
  /** Secondary / muted text */
  textMuted: 'hsl(var(--muted-foreground))',
  /** Disabled text */
  textDisabled: 'hsl(var(--muted-foreground) / 0.5)',

  /** Brand accent — restrained indigo */
  accentDefault: 'hsl(var(--primary))',
  /** Accent text on accent background */
  accentForeground: 'hsl(var(--primary-foreground))',

  /** Destructive / error */
  destructive: 'hsl(var(--destructive))',
  destructiveForeground: 'hsl(var(--destructive-foreground))',

  /** Muted backgrounds (tags, chips) */
  mutedBackground: 'hsl(var(--muted))',
  mutedForeground: 'hsl(var(--muted-foreground))',

  /** Success */
  success: 'hsl(142 71% 45%)',
  /** Warning */
  warning: 'hsl(38 92% 50%)',
} as const;

export type ColorToken = keyof typeof colors;
