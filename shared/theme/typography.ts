/**
 * Resigna Typography Tokens
 */

export const fontFamily = {
  sans: 'var(--font-inter)',
  mono: 'var(--font-mono)',
} as const;

export const fontSize = {
  xs: '0.6875rem', // 11px
  sm: '0.8125rem', // 13px
  base: '0.875rem', // 14px
  md: '0.9375rem', // 15px
  lg: '1rem', // 16px
  xl: '1.125rem', // 18px
  '2xl': '1.25rem', // 20px
  '3xl': '1.5rem', // 24px
  '4xl': '2rem', // 32px
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const lineHeight = {
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
} as const;

export const letterSpacing = {
  tight: '-0.02em',
  normal: '0em',
  wide: '0.02em',
  wider: '0.05em',
} as const;
