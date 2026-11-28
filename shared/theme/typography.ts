/**
 * Resigna typography — Inter for product UI, IBM Plex Mono for data, IDs and code.
 * Fraunces is marketing-only and must never appear in the product.
 * Use the type-* utilities from app/globals.css (type-heading-md, type-body, type-label…).
 */

export const fontFamily = {
  sans: 'var(--font-sans)',
  mono: 'var(--font-mono)',
} as const;

/** Type roles: [font-size, line-height, weight]. Matches the @utility type-* rules. */
export const typeScale = {
  display: ['32px', '40px', 600],
  headingLg: ['24px', '32px', 600],
  headingMd: ['20px', '28px', 600],
  headingSm: ['16px', '24px', 600],
  body: ['14px', '20px', 400],
  bodySm: ['13px', '18px', 400],
  label: ['12px', '16px', 500],
  caption: ['12px', '16px', 400],
  overline: ['11px', '16px', 600],
  code: ['12px', '16px', 400],
} as const;

export type TypeRole = keyof typeof typeScale;
