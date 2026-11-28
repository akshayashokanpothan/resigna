'use client';

import { Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Dialog } from '@/shared/components/Dialog';

interface ConfirmDeleteDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  isPending: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDeleteDialog({
  open,
  title,
  description,
  confirmLabel,
  isPending,
  onConfirm,
  onClose,
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} size="sm" title={title} description={description}>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button
          variant="danger"
          leadingIcon={Trash2}
          onClick={onConfirm}
          isLoading={isPending}
          loadingText="Deleting…"
        >
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
