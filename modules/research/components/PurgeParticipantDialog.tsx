'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Dialog } from '@/shared/components/Dialog';
import { Field } from '@/shared/components/Field';
import { Input } from '@/shared/components/Input';
import { usePurgeParticipant } from '../hooks/use-research';
import type { Participant } from '../types/research.types';

interface PurgeParticipantDialogProps {
  projectId: string;
  participant: Participant | null;
  /** How many sources are linked to the participant, shown so the impact is clear. */
  sourceCount: number;
  onClose: () => void;
}

/**
 * Deletes a participant and everything linked to them. The user types the
 * label to confirm, because this can't be undone (guardrail 9).
 */
export function PurgeParticipantDialog({
  projectId,
  participant,
  sourceCount,
  onClose,
}: PurgeParticipantDialogProps) {
  const purge = usePurgeParticipant(projectId);
  const [typed, setTyped] = useState('');

  const close = () => {
    setTyped('');
    onClose();
  };

  const label = participant?.label ?? '';
  const sources =
    sourceCount === 0
      ? 'No sources are linked to them.'
      : sourceCount === 1
        ? 'This also deletes 1 linked source, its uploaded file and its evidence.'
        : `This also deletes ${sourceCount} linked sources, their uploaded files and their evidence.`;

  return (
    <Dialog
      open={!!participant}
      onClose={close}
      size="sm"
      title={`Delete ${label} and their data?`}
      description={`${sources} You can't undo this.`}
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!participant || typed.trim() !== label) return;
          try {
            await purge.mutateAsync(participant.id);
            close();
          } catch {
            // The mutation shows the error.
          }
        }}
      >
        <Field id="purge-confirm" label={`Type ${label} to confirm`}>
          <Input autoComplete="off" value={typed} onChange={(e) => setTyped(e.target.value)} />
        </Field>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={close} disabled={purge.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="danger"
            leadingIcon={Trash2}
            disabled={typed.trim() !== label}
            isLoading={purge.isPending}
            loadingText="Deleting…"
          >
            Delete participant
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
