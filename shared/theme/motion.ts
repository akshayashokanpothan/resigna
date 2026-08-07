/**
 * Resigna Motion Tokens
 *
 * Framer Motion variants imported by components.
 * Components never define their own animation variants.
 */
import type { Variants, Transition } from 'framer-motion';

export const duration = {
  fast: 0.12,
  default: 0.2,
  slow: 0.3,
  verySlow: 0.5,
} as const;

export const ease = {
  default: [0.16, 1, 0.3, 1] as [number, number, number, number],
  in: [0.4, 0, 1, 1] as [number, number, number, number],
  out: [0, 0, 0.2, 1] as [number, number, number, number],
  spring: { type: 'spring', stiffness: 300, damping: 30 } as Transition,
} as const;

export const variants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  } satisfies Variants,

  fadeUp: {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 6 },
  } satisfies Variants,

  scaleIn: {
    initial: { opacity: 0, scale: 0.97 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.97 },
  } satisfies Variants,

  slideInLeft: {
    initial: { opacity: 0, x: -8 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -8 },
  } satisfies Variants,
} as const;

export const transition = {
  default: { duration: duration.default, ease: ease.default },
  fast: { duration: duration.fast, ease: ease.out },
  slow: { duration: duration.slow, ease: ease.default },
  spring: ease.spring,
} as const;
