'use client';

import { useState } from 'react';
import { ChevronsUpDown, Check } from 'lucide-react';
import { useWorkspaces, useFirstWorkspace } from '../hooks/use-workspace';
import { cn } from '@/shared/utils/cn';

export function WorkspaceSelector() {
  const { data: workspaces, isLoading } = useWorkspaces();
  const { workspace: currentWorkspace } = useFirstWorkspace();
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading || !currentWorkspace) {
    return (
      <div className="flex h-10 w-full items-center justify-between rounded-md border border-[hsl(var(--border))] bg-transparent px-3 py-2">
        <div className="h-4 w-24 animate-pulse rounded bg-[hsl(var(--muted))]" />
        <ChevronsUpDown
          size={14}
          className="text-[hsl(var(--muted-foreground))]"
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm',
          'text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--muted))]',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[hsl(var(--primary))]',
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="truncate">{currentWorkspace.name}</span>
        <ChevronsUpDown
          size={14}
          className="shrink-0 text-[hsl(var(--muted-foreground))]"
          aria-hidden="true"
        />
      </button>

      {isOpen && workspaces && (
        <ul
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--popover))] py-1 shadow-md text-sm text-[hsl(var(--popover-foreground))]"
          role="listbox"
        >
          {workspaces.map((ws) => (
            <li
              key={ws.id}
              role="option"
              aria-selected={currentWorkspace.id === ws.id}
              className={cn(
                'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2',
                'hover:bg-[hsl(var(--muted))]',
              )}
              onClick={() => setIsOpen(false)} // In a real app this would select the workspace
            >
              <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                {currentWorkspace.id === ws.id && <Check size={14} />}
              </span>
              <span className="truncate">{ws.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
