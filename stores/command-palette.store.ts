import { create } from 'zustand';

interface CommandPaletteState {
  isOpen: boolean;
  query: string;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setQuery: (query: string) => void;
}

/**
 * Command palette UI state.
 * Not persisted — ephemeral open/close state.
 */
export const useCommandPaletteStore = create<CommandPaletteState>()((set) => ({
  isOpen: false,
  query: '',

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false, query: '' }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen, query: state.isOpen ? '' : state.query })),
  setQuery: (query) => set({ query }),
}));
