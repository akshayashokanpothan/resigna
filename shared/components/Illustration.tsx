import Image from 'next/image';
import { cn } from '@/shared/utils/cn';

/**
 * Spot illustrations from the brand kit (Brand_Assets/06–08), cropped to the artwork with the
 * board background and baked-in copy removed. Always decorative: the heading next to it carries
 * the meaning. The kit labels these "v1 concepts" — swap the files, not this API, when they change.
 */
const ILLUSTRATIONS = {
  // Empty states
  'no-projects': 'empty/no-projects.svg',
  'no-research': 'empty/no-research.svg',
  'no-files': 'empty/no-files.svg',
  'no-results': 'empty/no-results.svg',
  'search-empty': 'empty/search-empty.svg',
  'workspace-empty': 'empty/workspace-empty.svg',
  'no-internet': 'empty/no-internet.svg',
  // Errors
  'error-403': 'error/403.svg',
  'error-404': 'error/404.svg',
  'error-500': 'error/500.svg',
  'auth-failed': 'error/authentication-failed.svg',
  'network-error': 'error/network-error.svg',
  'permission-denied': 'error/permission-denied.svg',
  // Long-running work
  'ai-thinking': 'loading/ai-thinking.svg',
  'generating-insights': 'loading/generating-insights.svg',
  'processing-documents': 'loading/processing-documents.svg',
  'research-analysis': 'loading/research-analysis.svg',
} as const;

export type IllustrationName = keyof typeof ILLUSTRATIONS;

interface IllustrationProps {
  name: IllustrationName;
  /** Width in px; height follows the 600 × 460 artboard. */
  width?: number;
  className?: string;
}

export function Illustration({ name, width = 200, className }: IllustrationProps) {
  return (
    <Image
      src={`/brand/illustrations/${ILLUSTRATIONS[name]}`}
      alt=""
      aria-hidden="true"
      width={width}
      height={Math.round((width * 460) / 600)}
      unoptimized
      draggable={false}
      className={cn('pointer-events-none select-none', className)}
    />
  );
}
