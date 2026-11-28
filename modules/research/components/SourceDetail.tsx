'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Download, Lock, Pencil, Trash2 } from 'lucide-react';
import { useProject } from '@/modules/projects';
import { Badge } from '@/shared/components/Badge';
import { Button, buttonVariants } from '@/shared/components/Button';
import { NetworkError, NotFound } from '@/shared/components/ErrorPage';
import { Notification } from '@/shared/components/Notification';
import { PageHeader } from '@/shared/components/PageHeader';
import { Skeleton } from '@/shared/components/Skeleton';
import { ROUTES } from '@/shared/constants/routes';
import { formatDate } from '@/shared/utils/format';
import { toast } from '@/shared/utils/toast';
import {
  CONSENT_META,
  countWords,
  formatBytes,
  formatDay,
  SOURCE_STATUS_META,
  SOURCE_TYPE_LABELS,
} from '../domain/research.domain';
import { useDeleteSource, useParticipants, useSource, useStudy } from '../hooks/use-research';
import { researchService } from '../services/research.service';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog';
import { EditSourceDialog } from './EditSourceDialog';

interface SourceDetailProps {
  projectId: string;
  sourceId: string;
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="type-caption text-fg-secondary">{label}</dt>
      <dd className="mt-0.5 text-sm text-fg">{children}</dd>
    </div>
  );
}

export function SourceDetail({ projectId, sourceId }: SourceDetailProps) {
  const router = useRouter();
  const { data: project } = useProject(projectId);
  const source = useSource(projectId, sourceId);
  const study = useStudy(projectId, source.data?.studyId);
  const participants = useParticipants(projectId);
  const deleteSource = useDeleteSource(projectId);
  const [isEditing, setEditing] = useState(false);
  const [isDeleting, setDeleting] = useState(false);
  const [isDownloading, setDownloading] = useState(false);

  if (source.isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-8 py-8" role="status" aria-live="polite">
        <span className="sr-only">Loading source</span>
        <Skeleton className="mb-3 h-7 w-64" />
        <Skeleton className="mb-8 h-4 w-96" />
        <Skeleton className="h-96 w-full rounded-card" />
      </div>
    );
  }
  if (source.isError) return <NetworkError onRetry={() => source.refetch()} />;
  if (!source.data || source.data.projectId !== projectId) {
    return (
      <NotFound
        resource="Source"
        action={
          <Link
            href={ROUTES.project(projectId, 'sources')}
            className={buttonVariants({ variant: 'secondary' })}
          >
            Back to sources
          </Link>
        }
      />
    );
  }

  const src = source.data;
  const readOnly = project?.status === 'archived';
  const status = SOURCE_STATUS_META[src.status];
  const participant = participants.data?.find((p) => p.id === src.participantId);
  const words = countWords(src.contentText);

  const download = async () => {
    if (!src.storagePath) return;
    setDownloading(true);
    try {
      window.location.assign(await researchService().sourceDownloadUrl(src.storagePath));
    } catch (error) {
      toast.error('Could not download the file. Please try again.', error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-8 py-8">
      <PageHeader
        eyebrow={SOURCE_TYPE_LABELS[src.sourceType]}
        title={src.title}
        meta={
          <>
            <Badge tone={status.tone} dot>
              {status.label}
            </Badge>
            {src.isSensitive && (
              <Badge tone="warning">
                <Lock size={10} aria-hidden="true" />
                Sensitive
              </Badge>
            )}
          </>
        }
        action={
          <>
            {src.storagePath && (
              <Button
                variant="secondary"
                leadingIcon={Download}
                onClick={download}
                isLoading={isDownloading}
                loadingText="Preparing…"
              >
                Original file
              </Button>
            )}
            {!readOnly && (
              <>
                <Button variant="secondary" leadingIcon={Pencil} onClick={() => setEditing(true)}>
                  Edit details
                </Button>
                <Button variant="secondary" leadingIcon={Trash2} onClick={() => setDeleting(true)}>
                  Delete
                </Button>
              </>
            )}
          </>
        }
      />

      {participant?.consentStatus === 'withdrawn' && (
        <Notification
          tone="danger"
          title={`${participant.label} withdrew consent`}
          className="mb-6"
        >
          Keep this source out of analysis. You can delete {participant.label} with all their data
          from the project’s Participants tab.
        </Notification>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section
          aria-labelledby="source-text-heading"
          className="min-w-0 overflow-hidden rounded-card border border-border bg-surface"
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h2 id="source-text-heading" className="type-label text-fg-secondary">
              Source text
            </h2>
            {src.contentText && (
              <span className="type-caption text-fg-secondary">
                {words.toLocaleString('en-US')} words
              </span>
            )}
          </div>
          {src.contentText ? (
            <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
              <p className="max-w-[72ch] whitespace-pre-wrap break-words type-body leading-relaxed text-fg">
                {src.contentText}
              </p>
            </div>
          ) : (
            <div className="p-5">
              <Notification tone="info" title="Text extraction comes next">
                The original file is stored safely. Resigna reads the text of PDF and Word files in
                the next release; until then you can download the original.
              </Notification>
            </div>
          )}
        </section>

        <aside aria-label="Source details" className="flex flex-col gap-4">
          <dl className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4">
            <Detail label="Study">
              {study.data ? (
                <Link
                  href={ROUTES.study(projectId, study.data.id)}
                  className="text-accent-text hover:underline focus-ring rounded-xs"
                >
                  {study.data.title}
                </Link>
              ) : (
                '…'
              )}
            </Detail>
            <Detail label="Participant">
              {participant ? (
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-mono">{participant.label}</span>
                  <Badge tone={CONSENT_META[participant.consentStatus].tone} dot>
                    {CONSENT_META[participant.consentStatus].label}
                  </Badge>
                </span>
              ) : (
                <span className="text-fg-secondary">None</span>
              )}
            </Detail>
            <Detail label="Date conducted">
              {src.conductedAt ? (
                formatDay(src.conductedAt)
              ) : (
                <span className="text-fg-secondary">Not set</span>
              )}
            </Detail>
            <Detail label="Added">
              {formatDate(src.createdAt)} · {src.inputMethod === 'paste' ? 'Pasted' : 'Uploaded'}
            </Detail>
            {src.originalFilename && (
              <Detail label="File">
                <span className="break-all">{src.originalFilename}</span>
                <span className="text-fg-secondary"> · {formatBytes(src.sizeBytes)}</span>
              </Detail>
            )}
          </dl>
          <p className="px-1 type-caption text-fg-secondary">
            Source text is original research and can’t be edited, so evidence taken from it always
            matches what was said.
          </p>
        </aside>
      </div>

      {!readOnly && (
        <EditSourceDialog
          source={src}
          participants={participants.data ?? []}
          open={isEditing}
          onClose={() => setEditing(false)}
        />
      )}
      <ConfirmDeleteDialog
        open={isDeleting}
        title={`Delete “${src.title}”?`}
        description={`This deletes the source${src.storagePath ? ', its uploaded file' : ''} and any evidence taken from it. You can't undo this.`}
        confirmLabel="Delete source"
        isPending={deleteSource.isPending}
        onClose={() => setDeleting(false)}
        onConfirm={async () => {
          try {
            await deleteSource.mutateAsync(src.id);
            router.push(
              study.data
                ? ROUTES.study(projectId, study.data.id)
                : ROUTES.project(projectId, 'sources'),
            );
          } catch {
            // The mutation shows the error.
          }
        }}
      />
    </div>
  );
}
