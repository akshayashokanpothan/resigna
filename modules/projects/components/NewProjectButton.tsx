'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { useProjectDialogStore } from '@/stores/project-dialog.store';

interface NewProjectButtonProps {
  label?: string;
  disabled?: boolean;
}

export function NewProjectButton({ label = 'New project', disabled }: NewProjectButtonProps) {
  const openCreate = useProjectDialogStore((state) => state.openCreate);
  return (
    <Button onClick={openCreate} disabled={disabled} leadingIcon={Plus}>
      {label}
    </Button>
  );
}
