'use client';

import Link from 'next/link';
import { CalendarRange, FlaskConical } from 'lucide-react';
import { Badge } from '@/shared/components/Badge';
import { ROUTES } from '@/shared/constants/routes';
import { cn } from '@/shared/utils/cn';
import { formatRelativeDate } from '@/shared/utils/format';
import { formatDay, STUDY_METHOD_LABELS, STUDY_STATUS_META } from '../domain/research.domain';
import { usePrefetchStudy } from '../hooks/use-research';
import type { ResearchSourceSummary, Study } from '../types/research.types';

export function studyDateRange(study: Pick<Study, 'startsOn' | 'endsOn'>): string | null {
  if (study.startsOn && study.endsOn)
    return `${formatDay(study.startsOn)} – ${formatDay(study.endsOn)}`;
  if (study.startsOn) return `From ${formatDay(study.startsOn)}`;
  if (study.endsOn) return `Until ${formatDay(study.endsOn)}`;
  return null;
}

interface StudyListProps {
  studies: Study[];
  sources: ResearchSourceSummary[];
}

export function StudyList({ studies, sources }: StudyListProps) {
  const sourceCount = (studyId: string) => sources.filter((s) => s.studyId === studyId).length;
  const prefetchStudy = usePrefetchStudy();

  return (
    <ul role="list" aria-label="Studies" className="flex flex-col">
      {studies.map((study) => {
        const status = STUDY_STATUS_META[study.status];
        const range = studyDateRange(study);
        const count = sourceCount(study.id);
        return (
          <li key={study.id} className="border-b border-border last:border-b-0">
            <Link
              href={ROUTES.study(study.projectId, study.id)}
              onPointerEnter={() => prefetchStudy(study.projectId, study.id)}
              onFocus={() => prefetchStudy(study.projectId, study.id)}
              className={cn(
                'flex items-start gap-4 px-4 py-3.5 transition-colors duration-fast ease-standard',
                'hover:bg-layer-hover focus-ring-inset',
              )}
            >
              <div
                aria-hidden="true"
                className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-control border border-border bg-surface-raised text-fg-secondary"
              >
                <FlaskConical size={16} />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-sm font-medium text-fg">{study.title}</span>
                  <Badge tone={status.tone} dot>
                    {status.label}
                  </Badge>
                </span>
                {study.goal && (
                  <span className="line-clamp-1 type-body-sm text-fg-secondary">{study.goal}</span>
                )}
                <span className="flex flex-wrap items-center gap-x-3 gap-y-1 type-caption text-fg-secondary">
                  <span>
                    {count} {count === 1 ? 'source' : 'sources'}
                  </span>
                  {study.methods.length > 0 && (
                    <span>{study.methods.map((m) => STUDY_METHOD_LABELS[m]).join(', ')}</span>
                  )}
                  {range && (
                    <span className="inline-flex items-center gap-1">
                      <CalendarRange size={12} aria-hidden="true" />
                      {range}
                    </span>
                  )}
                </span>
              </div>
              <span className="shrink-0 type-caption text-fg-secondary">
                {formatRelativeDate(study.updatedAt)}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
