'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CalendarRange, FilePlus2, Pencil, Trash2 } from 'lucide-react';
import { useProject } from '@/modules/projects';
import { Badge } from '@/shared/components/Badge';
import { Button, buttonVariants } from '@/shared/components/Button';
import { EmptyState } from '@/shared/components/EmptyState';
import { NetworkError, NotFound } from '@/shared/components/ErrorPage';
import { PageHeader } from '@/shared/components/PageHeader';
import { Skeleton } from '@/shared/components/Skeleton';
import { ROUTES } from '@/shared/constants/routes';
import { STUDY_METHOD_LABELS, STUDY_STATUS_META } from '../domain/research.domain';
import {
  useDeleteStudy,
  useParticipants,
  useSources,
  useStudies,
  useStudy,
} from '../hooks/use-research';
import { AddSourceDialog } from './AddSourceDialog';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog';
import { SourceList } from './SourceList';
import { StudyFormDialog } from './StudyFormDialog';
import { studyDateRange } from './StudyList';

interface StudyDetailProps {
  projectId: string;
  studyId: string;
}

export function StudyDetail({ projectId, studyId }: StudyDetailProps) {
  const router = useRouter();
  const { data: project } = useProject(projectId);
  const study = useStudy(projectId, studyId);
  const studies = useStudies(projectId);
  const sources = useSources(projectId, studyId);
  const participants = useParticipants(projectId);
  const deleteStudy = useDeleteStudy(projectId);

  const [isEditing, setEditing] = useState(false);
  const [isAdding, setAdding] = useState(false);
  const [isDeleting, setDeleting] = useState(false);

  if (study.isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-8 py-8" role="status" aria-live="polite">
        <span className="sr-only">Loading study</span>
        <Skeleton className="mb-3 h-7 w-64" />
        <Skeleton className="mb-8 h-4 w-96" />
        <Skeleton className="h-64 w-full rounded-card" />
      </div>
    );
  }
  if (study.isError) return <NetworkError onRetry={() => study.refetch()} />;
  if (!study.data || study.data.projectId !== projectId) {
    return (
      <NotFound
        resource="Study"
        action={
          <Link
            href={ROUTES.project(projectId)}
            className={buttonVariants({ variant: 'secondary' })}
          >
            Back to project
          </Link>
        }
      />
    );
  }

  const s = study.data;
  const readOnly = project?.status === 'archived';
  const status = STUDY_STATUS_META[s.status];
  const range = studyDateRange(s);
  const sourceList = sources.data ?? [];

  const addButton = !readOnly && (
    <Button leadingIcon={FilePlus2} onClick={() => setAdding(true)}>
      Add source
    </Button>
  );

  return (
    <div className="mx-auto max-w-5xl px-8 py-8">
      <PageHeader
        eyebrow="Study"
        title={s.title}
        description={s.goal ?? undefined}
        meta={
          <Badge tone={status.tone} dot>
            {status.label}
          </Badge>
        }
        action={
          !readOnly && (
            <>
              <Button variant="secondary" leadingIcon={Pencil} onClick={() => setEditing(true)}>
                Edit
              </Button>
              <Button variant="secondary" leadingIcon={Trash2} onClick={() => setDeleting(true)}>
                Delete
              </Button>
            </>
          )
        }
      />

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <section
          aria-labelledby="study-questions"
          className="rounded-card border border-border bg-surface p-4 md:col-span-2"
        >
          <h2 id="study-questions" className="mb-2 type-label text-fg-secondary">
            Research questions
          </h2>
          {s.researchQuestions.length > 0 ? (
            <ol className="flex list-decimal flex-col gap-1.5 pl-5 type-body text-fg">
              {s.researchQuestions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ol>
          ) : (
            <p className="type-body-sm text-fg-secondary">
              No questions yet.{' '}
              {readOnly ? '' : 'Edit the study to add the questions it should answer.'}
            </p>
          )}
        </section>
        <section
          aria-labelledby="study-details"
          className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4"
        >
          <h2 id="study-details" className="type-label text-fg-secondary">
            Details
          </h2>
          <dl className="flex flex-col gap-3 type-body-sm">
            <div>
              <dt className="type-caption text-fg-secondary">Methods</dt>
              <dd className="mt-1 flex flex-wrap gap-1.5">
                {s.methods.length > 0 ? (
                  s.methods.map((m) => <Badge key={m}>{STUDY_METHOD_LABELS[m]}</Badge>)
                ) : (
                  <span className="text-fg-secondary">Not set</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="type-caption text-fg-secondary">Timeline</dt>
              <dd className="mt-1 flex items-center gap-1.5 text-fg">
                <CalendarRange size={14} className="text-fg-secondary" aria-hidden="true" />
                {range ?? <span className="text-fg-secondary">Not set</span>}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <div className="overflow-hidden rounded-card border border-border bg-surface">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border px-4 py-3">
          <div>
            <h2 className="type-heading-sm text-fg">Sources</h2>
            <p className="type-body-sm text-fg-secondary">
              Transcripts, notes and documents from this study.
            </p>
          </div>
          {sourceList.length > 0 && addButton}
        </div>
        {sources.isLoading ? (
          <div className="p-4" role="status">
            <span className="sr-only">Loading sources</span>
            <Skeleton className="h-12 w-full" />
          </div>
        ) : sources.isError ? (
          <NetworkError onRetry={() => sources.refetch()} />
        ) : sourceList.length === 0 ? (
          <EmptyState
            illustration="no-files"
            title="Add the first source"
            description="Paste an interview transcript or upload notes and documents. Each source keeps its original text, so every finding can trace back to it."
            action={addButton || undefined}
          />
        ) : (
          <SourceList sources={sourceList} participants={participants.data ?? []} />
        )}
      </div>

      <StudyFormDialog
        projectId={projectId}
        study={s}
        open={isEditing}
        onClose={() => setEditing(false)}
      />
      <AddSourceDialog
        projectId={projectId}
        studyId={s.id}
        studies={studies.data ?? [s]}
        participants={participants.data ?? []}
        open={isAdding}
        onClose={() => setAdding(false)}
      />
      <ConfirmDeleteDialog
        open={isDeleting}
        title={`Delete “${s.title}”?`}
        description={
          sourceList.length === 0
            ? "This study has no sources. You can't undo this."
            : `This also deletes its ${sourceList.length === 1 ? 'source' : `${sourceList.length} sources`}, their uploaded files and any evidence from them. You can't undo this.`
        }
        confirmLabel="Delete study"
        isPending={deleteStudy.isPending}
        onClose={() => setDeleting(false)}
        onConfirm={async () => {
          try {
            await deleteStudy.mutateAsync(s.id);
            router.push(ROUTES.project(projectId, 'studies'));
          } catch {
            // The mutation shows the error.
          }
        }}
      />
    </div>
  );
}
