'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { FileText, FlaskConical, FolderKanban, Search } from 'lucide-react';
import { useProjects } from '@/modules/projects';
import { useFirstWorkspace } from '@/modules/workspace';
import { EmptyState } from '@/shared/components/EmptyState';
import { NetworkError } from '@/shared/components/ErrorPage';
import { Field } from '@/shared/components/Field';
import { Input } from '@/shared/components/Input';
import { Skeleton } from '@/shared/components/Skeleton';
import { ROUTES } from '@/shared/constants/routes';
import { cn } from '@/shared/utils/cn';
import {
  normalizeSearchTerm,
  SEARCH_MIN_LENGTH,
  SOURCE_TYPE_LABELS,
  splitByMatch,
} from '../domain/research.domain';
import { useResearchSearch } from '../hooks/use-research';

function Highlight({ text, term }: { text: string; term: string }) {
  return (
    <>
      {splitByMatch(text, term).map((part, i) =>
        part.match ? (
          <mark key={i} className="rounded-xs bg-accent-subtle px-0.5 text-fg">
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </>
  );
}

function ResultGroup({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  if (count === 0) return null;
  const id = `results-${title.toLowerCase()}`;
  return (
    <section
      aria-labelledby={id}
      className="overflow-hidden rounded-card border border-border bg-surface"
    >
      <h2
        id={id}
        className="flex items-center gap-2 border-b border-border px-4 py-2.5 type-label text-fg-secondary"
      >
        {title}
        <span className="font-mono text-xs">{count}</span>
      </h2>
      <ul role="list">{children}</ul>
    </section>
  );
}

function ResultRow({
  href,
  icon: Icon,
  title,
  meta,
  snippet,
  term,
}: {
  href: string;
  icon: typeof FileText;
  title: string;
  meta?: string;
  snippet?: string | null;
  term: string;
}) {
  return (
    <li className="border-b border-border last:border-b-0">
      <Link
        href={href}
        className={cn(
          'flex items-start gap-3 px-4 py-3 transition-colors duration-fast ease-standard',
          'hover:bg-layer-hover focus-ring-inset',
        )}
      >
        <Icon size={16} className="mt-0.5 shrink-0 text-fg-secondary" aria-hidden="true" />
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-sm font-medium text-fg">
            <Highlight text={title} term={term} />
          </span>
          {meta && <span className="type-caption text-fg-secondary">{meta}</span>}
          {snippet && (
            <span className="line-clamp-2 type-body-sm text-fg-secondary">
              <Highlight text={snippet} term={term} />
            </span>
          )}
        </span>
      </Link>
    </li>
  );
}

/** Basic search across the workspace's projects, studies and sources. */
export function ResearchSearch() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initial = searchParams.get('q') ?? '';
  const [input, setInput] = useState(initial);
  const [term, setTerm] = useState(normalizeSearchTerm(initial));

  // Search as the user types, without a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      const next = normalizeSearchTerm(input);
      setTerm(next);
      const url = next ? `${pathname}?q=${encodeURIComponent(next)}` : pathname;
      // Native History API: keeps ?q= shareable without a server round trip per search.
      if (url !== `${window.location.pathname}${window.location.search}`) {
        window.history.replaceState(null, '', url);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [input, pathname]);

  const { workspace } = useFirstWorkspace();
  const { data: projects } = useProjects(workspace?.id);
  const results = useResearchSearch(workspace?.id, term);
  const projectName = (id: string) => projects?.find((p) => p.id === id)?.name ?? 'Project';

  const tooShort = term.length < SEARCH_MIN_LENGTH;
  const total = results.data
    ? results.data.projects.length + results.data.studies.length + results.data.sources.length
    : 0;

  return (
    <div className="flex flex-col gap-6">
      <form role="search" onSubmit={(e) => e.preventDefault()}>
        <Field id="research-search" label="Search research" hideLabel>
          <Input
            type="search"
            size="lg"
            leadingIcon={Search}
            autoFocus
            autoComplete="off"
            placeholder="Search projects, studies and source text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </Field>
      </form>

      <div aria-live="polite" className="sr-only">
        {!tooShort && results.data ? `${total} results for ${term}` : ''}
      </div>

      {tooShort ? (
        <div className="rounded-card border border-border bg-surface">
          <EmptyState
            illustration="search-empty"
            title="Find anything you've collected"
            description="Search project names, study titles and goals, and the full text of every transcript and note."
          />
        </div>
      ) : results.isLoading ? (
        <div className="flex flex-col gap-3" role="status">
          <span className="sr-only">Searching</span>
          <Skeleton className="h-16 w-full rounded-card" />
          <Skeleton className="h-16 w-full rounded-card" />
        </div>
      ) : results.isError ? (
        <NetworkError onRetry={() => results.refetch()} />
      ) : total === 0 ? (
        <div className="rounded-card border border-border bg-surface">
          <EmptyState
            illustration="no-results"
            title={`No results for “${term}”`}
            description="Try a different word, or check the spelling. Text inside PDF and Word files becomes searchable once it's extracted."
          />
        </div>
      ) : (
        results.data && (
          <>
            <ResultGroup title="Sources" count={results.data.sources.length}>
              {results.data.sources.map((s) => (
                <ResultRow
                  key={s.id}
                  href={ROUTES.source(s.projectId, s.id)}
                  icon={FileText}
                  title={s.title}
                  meta={`${SOURCE_TYPE_LABELS[s.sourceType]} · ${projectName(s.projectId)}`}
                  snippet={s.snippet}
                  term={term}
                />
              ))}
            </ResultGroup>
            <ResultGroup title="Studies" count={results.data.studies.length}>
              {results.data.studies.map((s) => (
                <ResultRow
                  key={s.id}
                  href={ROUTES.study(s.projectId, s.id)}
                  icon={FlaskConical}
                  title={s.title}
                  meta={projectName(s.projectId)}
                  snippet={s.goal}
                  term={term}
                />
              ))}
            </ResultGroup>
            <ResultGroup title="Projects" count={results.data.projects.length}>
              {results.data.projects.map((p) => (
                <ResultRow
                  key={p.id}
                  href={ROUTES.project(p.id)}
                  icon={FolderKanban}
                  title={p.name}
                  snippet={p.description}
                  term={term}
                />
              ))}
            </ResultGroup>
          </>
        )
      )}
    </div>
  );
}
