'use client';

import Link from 'next/link';
import { ClipboardPaste, FileText, Lock } from 'lucide-react';
import { Badge } from '@/shared/components/Badge';
import { ROUTES } from '@/shared/constants/routes';
import { cn } from '@/shared/utils/cn';
import {
  formatBytes,
  formatDay,
  SOURCE_STATUS_META,
  SOURCE_TYPE_LABELS,
} from '../domain/research.domain';
import type { Participant, ResearchSourceSummary, Study } from '../types/research.types';

interface SourceListProps {
  sources: ResearchSourceSummary[];
  participants: Participant[];
  /** When given, each row names its study (used on the project-wide list). */
  studies?: Study[];
}

export function SourceList({ sources, participants, studies }: SourceListProps) {
  const participantLabel = (id: string | null) =>
    id ? participants.find((p) => p.id === id)?.label : undefined;
  const studyTitle = (id: string) => studies?.find((s) => s.id === id)?.title;

  return (
    <ul role="list" aria-label="Sources" className="flex flex-col">
      {sources.map((source) => {
        const status = SOURCE_STATUS_META[source.status];
        const Icon = source.inputMethod === 'paste' ? ClipboardPaste : FileText;
        const participant = participantLabel(source.participantId);
        const study = studyTitle(source.studyId);
        return (
          <li key={source.id} className="border-b border-border last:border-b-0">
            <Link
              href={ROUTES.source(source.projectId, source.id)}
              className={cn(
                'flex items-start gap-4 px-4 py-3 transition-colors duration-fast ease-standard',
                'hover:bg-layer-hover focus-ring-inset',
              )}
            >
              <div
                aria-hidden="true"
                className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-control border border-border bg-surface-raised text-fg-secondary"
              >
                <Icon size={16} />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-sm font-medium text-fg">{source.title}</span>
                  {source.isSensitive && (
                    <Badge tone="warning">
                      <Lock size={10} aria-hidden="true" />
                      Sensitive
                    </Badge>
                  )}
                </span>
                <span className="flex flex-wrap items-center gap-x-3 gap-y-1 type-caption text-fg-secondary">
                  <span>{SOURCE_TYPE_LABELS[source.sourceType]}</span>
                  {participant && <span className="font-mono">{participant}</span>}
                  {study && <span className="truncate">{study}</span>}
                  {source.conductedAt && <span>{formatDay(source.conductedAt)}</span>}
                  {source.originalFilename && (
                    <span className="truncate">
                      {source.originalFilename} · {formatBytes(source.sizeBytes)}
                    </span>
                  )}
                </span>
              </div>
              <Badge tone={status.tone} dot className="shrink-0">
                {status.label}
              </Badge>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
