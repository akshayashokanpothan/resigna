'use client';

import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FilePlus2, Plus, ShieldCheck, UserPlus } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { EmptyState } from '@/shared/components/EmptyState';
import { NetworkError } from '@/shared/components/ErrorPage';
import { Skeleton } from '@/shared/components/Skeleton';
import { Tabs } from '@/shared/components/Tabs';
import { ROUTES } from '@/shared/constants/routes';
import { nextParticipantLabel } from '../domain/research.domain';
import { useParticipants, useSources, useStudies } from '../hooks/use-research';
import type { Participant } from '../types/research.types';
import { AddSourceDialog } from './AddSourceDialog';
import { ParticipantFormDialog } from './ParticipantFormDialog';
import { ParticipantList } from './ParticipantList';
import { PurgeParticipantDialog } from './PurgeParticipantDialog';
import { SourceList } from './SourceList';
import { StudyFormDialog } from './StudyFormDialog';
import { StudyList } from './StudyList';

const TAB_IDS = ['studies', 'sources', 'participants'] as const;
type TabId = (typeof TAB_IDS)[number];

interface ProjectResearchProps {
  projectId: string;
  /** Archived projects are read-only. */
  readOnly?: boolean;
}

function ListSkeleton() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col">
      <span className="sr-only">Loading</span>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-border px-4 py-3.5 last:border-b-0"
        >
          <Skeleton className="size-9 rounded-control" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border px-4 py-3">
      <div>
        <h2 className="type-heading-sm text-fg">{title}</h2>
        <p className="type-body-sm text-fg-secondary">{description}</p>
      </div>
      {action}
    </div>
  );
}

/** The research inside a project: studies, sources and participants. */
export function ProjectResearch({ projectId, readOnly = false }: ProjectResearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requested = searchParams.get('tab');
  const tab: TabId = TAB_IDS.includes(requested as TabId) ? (requested as TabId) : 'studies';

  const studies = useStudies(projectId);
  const sources = useSources(projectId);
  const participants = useParticipants(projectId);

  const [isStudyOpen, setStudyOpen] = useState(false);
  const [isSourceOpen, setSourceOpen] = useState(false);
  const [participantDialog, setParticipantDialog] = useState<
    { mode: 'create' } | { mode: 'edit'; participant: Participant } | null
  >(null);
  const [purging, setPurging] = useState<Participant | null>(null);

  const setTab = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', id);
    // The native History API updates useSearchParams without a server round trip, so a tab
    // switch is instant. router.replace would refetch the route from the server on every click.
    window.history.replaceState(null, '', `${pathname}?${params.toString()}`);
  };

  const studyList = studies.data ?? [];
  const sourceList = sources.data ?? [];
  const participantList = participants.data ?? [];
  const isLoading = studies.isLoading || sources.isLoading || participants.isLoading;
  const isError = studies.isError || sources.isError || participants.isError;
  const retry = () => {
    void studies.refetch();
    void sources.refetch();
    void participants.refetch();
  };

  const newStudyButton = !readOnly && (
    <Button leadingIcon={Plus} onClick={() => setStudyOpen(true)}>
      New study
    </Button>
  );
  const addSourceButton = !readOnly && (
    <Button
      leadingIcon={FilePlus2}
      onClick={() => setSourceOpen(true)}
      disabled={studyList.length === 0}
      title={studyList.length === 0 ? 'Create a study first' : undefined}
    >
      Add source
    </Button>
  );
  const addParticipantButton = !readOnly && (
    <Button leadingIcon={UserPlus} onClick={() => setParticipantDialog({ mode: 'create' })}>
      Add participant
    </Button>
  );

  return (
    <>
      <Tabs
        label="Project research"
        value={tab}
        onValueChange={setTab}
        items={[
          { id: 'studies', label: 'Studies', count: studies.data?.length },
          { id: 'sources', label: 'Sources', count: sources.data?.length },
          { id: 'participants', label: 'Participants', count: participants.data?.length },
        ]}
      >
        {(selected) => (
          <div className="mt-6 overflow-hidden rounded-card border border-border bg-surface">
            {selected === 'studies' && (
              <>
                <SectionHeader
                  title="Studies"
                  description="Each study is one round of research, with its goal, questions and methods."
                  action={studyList.length > 0 ? newStudyButton : undefined}
                />
                {isLoading ? (
                  <ListSkeleton />
                ) : isError ? (
                  <NetworkError onRetry={retry} />
                ) : studyList.length === 0 ? (
                  <EmptyState
                    illustration="no-research"
                    title="Start with a study"
                    description="Describe what you want to learn: the goal, the questions and how you'll find out. Then add interviews, notes and documents to it."
                    action={newStudyButton || undefined}
                  />
                ) : (
                  <StudyList studies={studyList} sources={sourceList} />
                )}
              </>
            )}

            {selected === 'sources' && (
              <>
                <SectionHeader
                  title="Sources"
                  description="Original research: transcripts, notes and documents. Kept exactly as added."
                  action={sourceList.length > 0 ? addSourceButton : undefined}
                />
                {isLoading ? (
                  <ListSkeleton />
                ) : isError ? (
                  <NetworkError onRetry={retry} />
                ) : sourceList.length === 0 ? (
                  <EmptyState
                    illustration="no-files"
                    title="No sources yet"
                    description={
                      studyList.length === 0
                        ? 'Sources belong to a study. Create a study first, then paste a transcript or upload a file.'
                        : 'Paste an interview transcript or upload notes and documents.'
                    }
                    action={
                      readOnly
                        ? undefined
                        : studyList.length === 0
                          ? newStudyButton
                          : addSourceButton
                    }
                  />
                ) : (
                  <SourceList
                    sources={sourceList}
                    participants={participantList}
                    studies={studyList}
                  />
                )}
              </>
            )}

            {selected === 'participants' && (
              <>
                <SectionHeader
                  title="Participants"
                  description="Pseudonymous people in your research, with their consent."
                  action={participantList.length > 0 ? addParticipantButton : undefined}
                />
                <div className="flex items-start gap-2 border-b border-border bg-surface-raised px-4 py-2.5 type-caption text-fg-secondary">
                  <ShieldCheck
                    size={14}
                    className="mt-px shrink-0 text-success-text"
                    aria-hidden="true"
                  />
                  <span>
                    Use codes, not names. When someone withdraws consent, mark it here; you can
                    delete them with all their data at any time.
                  </span>
                </div>
                {isLoading ? (
                  <ListSkeleton />
                ) : isError ? (
                  <NetworkError onRetry={retry} />
                ) : participantList.length === 0 ? (
                  <EmptyState
                    icon={UserPlus}
                    title="No participants yet"
                    description="Add the people you research as codes such as P01, record their consent, and link them to their sources."
                    action={addParticipantButton || undefined}
                  />
                ) : (
                  <ParticipantList
                    participants={participantList}
                    sources={sourceList}
                    onEdit={(participant) => setParticipantDialog({ mode: 'edit', participant })}
                    onPurge={setPurging}
                  />
                )}
              </>
            )}
          </div>
        )}
      </Tabs>

      <StudyFormDialog
        projectId={projectId}
        open={isStudyOpen}
        onClose={() => setStudyOpen(false)}
        onSaved={(study) => router.push(ROUTES.study(projectId, study.id))}
      />
      <AddSourceDialog
        projectId={projectId}
        open={isSourceOpen}
        onClose={() => setSourceOpen(false)}
        studies={studyList}
        participants={participantList}
      />
      <ParticipantFormDialog
        projectId={projectId}
        open={!!participantDialog}
        onClose={() => setParticipantDialog(null)}
        participant={participantDialog?.mode === 'edit' ? participantDialog.participant : undefined}
        suggestedLabel={nextParticipantLabel(participantList.map((p) => p.label))}
      />
      <PurgeParticipantDialog
        projectId={projectId}
        participant={purging}
        sourceCount={purging ? sourceList.filter((s) => s.participantId === purging.id).length : 0}
        onClose={() => setPurging(null)}
      />
    </>
  );
}
