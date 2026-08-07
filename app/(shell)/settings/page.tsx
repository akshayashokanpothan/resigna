import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings',
};

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6">
        <h1 className="text-base font-semibold text-[hsl(var(--foreground))]">Settings</h1>
        <p className="mt-0.5 text-sm text-[hsl(var(--muted-foreground))]">
          Manage your account and workspace preferences.
        </p>
      </div>

      {/* Placeholder tabs */}
      <div className="flex gap-6 border-b border-[hsl(var(--border))] mb-6">
        {['Account', 'Workspace', 'Integrations', 'Billing'].map((tab, i) => (
          <button
            key={tab}
            className={
              i === 0
                ? 'pb-2.5 text-sm font-medium text-[hsl(var(--foreground))] border-b-2 border-[hsl(var(--primary))] -mb-px'
                : 'pb-2.5 text-sm text-[hsl(var(--muted-foreground))] cursor-not-allowed opacity-50'
            }
            disabled={i > 0}
            aria-disabled={i > 0}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content placeholder */}
      <div className="rounded-lg border border-[hsl(var(--border))] border-dashed p-12 text-center">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Account settings — coming in Sprint 1
        </p>
      </div>
    </div>
  );
}
