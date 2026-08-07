'use client';

import { Sidebar } from '@/modules/shell/sidebar/Sidebar';
import { Topbar } from '@/modules/shell/topbar/Topbar';
import { CommandPalette } from '@/modules/shell/command-palette/CommandPalette';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[hsl(var(--background))]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar />

        <main id="main-content" className="flex-1 overflow-y-auto" tabIndex={-1}>
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>

      {/* Global command palette — renders above everything */}
      <CommandPalette />
    </div>
  );
}
