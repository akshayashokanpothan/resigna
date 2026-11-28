'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/constants/query-keys';
import { AppError } from '@/shared/errors/AppError';
import { ErrorCode } from '@/shared/errors/error-codes';
import { toast } from '@/shared/utils/toast';
import { SEARCH_MIN_LENGTH } from '../domain/research.domain';
import { researchService } from '../services/research.service';
import type {
  CreateSourceInput,
  ParticipantInput,
  SourceMetadataInput,
  StudyInput,
} from '../types/research.types';

const keys = queryKeys.research;

// Queries --------------------------------------------------------------------

export function useProjectResearchCounts(projectId: string) {
  return useQuery({
    queryKey: keys.counts(projectId),
    queryFn: () => researchService().countsForProject(projectId),
  });
}

export function useStudies(projectId: string) {
  return useQuery({
    queryKey: keys.studies(projectId),
    queryFn: () => researchService().listStudies(projectId),
  });
}

export function useStudy(projectId: string, studyId: string | undefined) {
  return useQuery({
    queryKey: keys.study(projectId, studyId ?? ''),
    queryFn: () => researchService().getStudy(studyId!),
    enabled: !!studyId,
  });
}

export function useParticipants(projectId: string) {
  return useQuery({
    queryKey: keys.participants(projectId),
    queryFn: () => researchService().listParticipants(projectId),
  });
}

export function useSources(projectId: string, studyId?: string) {
  return useQuery({
    queryKey: keys.sources(projectId, studyId),
    queryFn: () => researchService().listSources({ projectId, studyId }),
  });
}

export function useSource(projectId: string, sourceId: string | undefined) {
  return useQuery({
    queryKey: keys.source(projectId, sourceId ?? ''),
    queryFn: () => researchService().getSource(sourceId!),
    enabled: !!sourceId,
  });
}

export function useResearchSearch(workspaceId: string | undefined, term: string) {
  return useQuery({
    queryKey: keys.search(workspaceId ?? '', term),
    queryFn: () => researchService().search(workspaceId!, term),
    enabled: !!workspaceId && term.length >= SEARCH_MIN_LENGTH,
    staleTime: 30_000,
  });
}

// Mutations ------------------------------------------------------------------

/** After any write, refresh the project's research queries (and search). */
function useInvalidateProject(projectId: string) {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: keys.project(projectId) }),
      queryClient.invalidateQueries({ queryKey: ['research-search'] }),
    ]);
}

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof AppError && error.code === ErrorCode.PARTICIPANT_LABEL_TAKEN) {
    return error.message;
  }
  return fallback;
}

export function useSaveStudy(projectId: string) {
  const invalidate = useInvalidateProject(projectId);
  return useMutation({
    mutationFn: (args: { id?: string; createdBy: string; input: StudyInput }) =>
      args.id
        ? researchService().updateStudy(args.id, args.input)
        : researchService().createStudy(projectId, args.createdBy, args.input),
    onSuccess: (_study, args) => {
      void invalidate();
      toast.success(args.id ? 'Study updated' : 'Study created');
    },
    onError: (error) => toast.error('Could not save the study. Please try again.', error),
  });
}

export function useDeleteStudy(projectId: string) {
  const invalidate = useInvalidateProject(projectId);
  return useMutation({
    mutationFn: (id: string) => researchService().deleteStudy(id),
    onSuccess: () => {
      void invalidate();
      toast.success('Study deleted');
    },
    onError: (error) => toast.error('Could not delete the study. Please try again.', error),
  });
}

export function useSaveParticipant(projectId: string) {
  const invalidate = useInvalidateProject(projectId);
  return useMutation({
    mutationFn: (args: { id?: string; createdBy: string; input: ParticipantInput }) =>
      args.id
        ? researchService().updateParticipant(args.id, args.input)
        : researchService().createParticipant(projectId, args.createdBy, args.input),
    onSuccess: (_p, args) => {
      void invalidate();
      toast.success(args.id ? 'Participant updated' : 'Participant added');
    },
    onError: (error) =>
      toast.error(errorMessage(error, 'Could not save the participant. Please try again.'), error),
  });
}

export function usePurgeParticipant(projectId: string) {
  const invalidate = useInvalidateProject(projectId);
  return useMutation({
    mutationFn: (id: string) => researchService().purgeParticipant(id),
    onSuccess: () => {
      void invalidate();
      toast.success('Participant and their data deleted');
    },
    onError: (error) =>
      toast.error('Could not delete the participant. Nothing was removed.', error),
  });
}

export function useCreateSource(projectId: string) {
  const invalidate = useInvalidateProject(projectId);
  return useMutation({
    mutationFn: (input: CreateSourceInput) => researchService().createSource(input),
    onSuccess: () => {
      void invalidate();
      toast.success('Source added');
    },
    onError: (error) => {
      const upload = error instanceof AppError && error.code === ErrorCode.SOURCE_UPLOAD_FAILED;
      toast.error(
        upload
          ? 'Could not upload the file. Check your connection and try again.'
          : 'Could not save the source. Please try again.',
        error,
      );
    },
  });
}

export function useUpdateSourceMetadata(projectId: string) {
  const invalidate = useInvalidateProject(projectId);
  return useMutation({
    mutationFn: (args: { id: string; input: SourceMetadataInput }) =>
      researchService().updateSourceMetadata(args.id, args.input),
    onSuccess: () => {
      void invalidate();
      toast.success('Source updated');
    },
    onError: (error) => toast.error('Could not save the source. Please try again.', error),
  });
}

export function useDeleteSource(projectId: string) {
  const invalidate = useInvalidateProject(projectId);
  return useMutation({
    mutationFn: (id: string) => researchService().deleteSource(id),
    onSuccess: () => {
      void invalidate();
      toast.success('Source deleted');
    },
    onError: (error) => toast.error('Could not delete the source. Please try again.', error),
  });
}
