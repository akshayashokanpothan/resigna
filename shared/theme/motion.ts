/**
 * Resigna motion tokens — fast (150 ms), standard (200 ms), slow (300 ms).
 * Opacity and short translations only; no springs, bounce or elastic easing.
 * Components import from here and never define their own variants.
 * Reduced motion is honoured globally (MotionConfig in providers, media query in globals.css).
 */
import type { Transition, Variants } from 'framer-motion';

type Bezier = [number, number, number, number];

export const duration = {
  fast: 0.15,
  standard: 0.2,
  slow: 0.3,
} as const;

export const ease = {
  /** Most UI changes: moving, resizing, colour */
  standard: [0.2, 0, 0.38, 0.9] as Bezier,
  /** Elements appearing */
  entrance: [0, 0, 0.38, 0.9] as Bezier,
  /** Elements leaving */
  exit: [0.2, 0, 1, 0.9] as Bezier,
} as const;

export const variants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  } satisfies Variants,

  fadeUp: {
    initial: { opacity: 0, y: 4 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 4 },
  } satisfies Variants,

  scaleIn: {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
  } satisfies Variants,

  slideInLeft: {
    initial: { opacity: 0, x: -4 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -4 },
  } satisfies Variants,
} as const;

export const transition = {
  fast: { duration: duration.fast, ease: ease.standard },
  default: { duration: duration.standard, ease: ease.standard },
  enter: { duration: duration.standard, ease: ease.entrance },
  exit: { duration: duration.fast, ease: ease.exit },
  slow: { duration: duration.slow, ease: ease.standard },
} as const satisfies Record<string, Transition>;
