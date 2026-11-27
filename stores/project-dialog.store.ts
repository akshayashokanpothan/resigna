import { create } from 'zustand';

interface ProjectDialogState {
  isCreateOpen: boolean;
  openCreate: () => void;
  closeCreate: () => void;
}

/**
 * Open/closed state of the create-project dialog.
 * Lives in a store so the command palette can open it from anywhere.
 */
export const useProjectDialogStore = create<ProjectDialogState>()((set) => ({
  isCreateOpen: false,
  openCreate: () => set({ isCreateOpen: true }),
  closeCreate: () => set({ isCreateOpen: false }),
}));
