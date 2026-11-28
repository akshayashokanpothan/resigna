import { cn } from '@/shared/utils/cn';
import { APP_NAME } from '@/shared/constants/app.constants';

/*
 * Resigna "Connected Insights" mark, copied node-for-node from the brand kit
 * (Brand_Assets/01_Logos/SVG). Do not redraw, recolour or re-space it.
 * Inline SVG (rather than <img>) so the wordmark renders in the app's Inter, and so the
 * monochrome variant can follow currentColor.
 */

const EDGES: ReadonlyArray<readonly [number, number, number, number]> = [
  [20, 20, 20, 50],
  [20, 50, 20, 80],
  [20, 20, 80, 20],
  [20, 50, 50, 50],
  [50, 50, 80, 50],
  [80, 20, 80, 50],
  [20, 80, 80, 80],
  [50, 50, 80, 80],
];

/** [cx, cy, isSignal] — the two signal nodes are Electric Indigo in the full-colour mark. */
const NODES: ReadonlyArray<readonly [number, number, boolean]> = [
  [20, 20, false],
  [20, 50, false],
  [20, 80, false],
  [50, 50, false],
  [80, 20, true],
  [80, 50, true],
  [80, 80, false],
];

type LogoTone = 'full-color' | 'mono';

function SymbolGeometry({ tone }: { tone: LogoTone }) {
  const ink = tone === 'mono' ? 'currentColor' : 'var(--resigna-text-primary)';
  const signal = tone === 'mono' ? 'currentColor' : 'var(--resigna-accent)';
  return (
    <>
      {EDGES.map(([x1, y1, x2, y2]) => (
        <line
          key={`${x1}-${y1}-${x2}-${y2}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={ink}
          strokeWidth={5.2}
          strokeLinecap="round"
        />
      ))}
      {NODES.map(([cx, cy, isSignal]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={7.8} fill={isSignal ? signal : ink} />
      ))}
    </>
  );
}

interface LogoSymbolProps {
  /** Rendered size in px (square). Below 16 px, use the favicon exports instead. */
  size?: number;
  tone?: LogoTone;
  /** Accessible name. Pass an empty string when the symbol sits next to visible "Resigna" text. */
  title?: string;
  className?: string;
}

export function LogoSymbol({
  size = 24,
  tone = 'full-color',
  title = APP_NAME,
  className,
}: LogoSymbolProps) {
  const decorative = title === '';
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : title}
      aria-hidden={decorative ? true : undefined}
      className={cn('shrink-0', className)}
      focusable="false"
    >
      <SymbolGeometry tone={tone} />
    </svg>
  );
}

interface LogoProps {
  /** Height in px of the lockup. The width follows the kit's 620 × 100 proportions. */
  height?: number;
  tone?: LogoTone;
  className?: string;
}

/** Horizontal lockup: symbol + "Resigna" wordmark (Inter Medium, −2.5 tracking, per the kit). */
export function Logo({ height = 24, tone = 'full-color', className }: LogoProps) {
  const wordmarkFill = tone === 'mono' ? 'currentColor' : 'var(--resigna-text-primary)';
  // The kit's 620-unit canvas leaves room after the word; trim to the wordmark's end.
  const viewWidth = 372;
  return (
    <svg
      viewBox={`0 0 ${viewWidth} 100`}
      height={height}
      width={(height * viewWidth) / 100}
      role="img"
      aria-label={APP_NAME}
      className={cn('shrink-0', className)}
      focusable="false"
    >
      <SymbolGeometry tone={tone} />
      <text
        x={128}
        y={68}
        fontSize={62}
        fontWeight={500}
        letterSpacing={-2.5}
        fill={wordmarkFill}
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        {APP_NAME}
      </text>
    </svg>
  );
}
