import { MotionProvider } from './MotionProvider';
import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';
import { ToastProvider } from './ToastProvider';

/**
 * Root provider stack.
 * Order: Query (outermost) → Theme → Motion → Toast (innermost).
 * Used in app/layout.tsx.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <MotionProvider>
          <ToastProvider>{children}</ToastProvider>
        </MotionProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
