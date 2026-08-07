import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_WIDTH } from '@/shared/constants/app.constants';

interface SidebarState {
  isCollapsed: boolean;
  toggle: () => void;
  collapse: () => void;
  expand: () => void;
  width: number;
}

/**
 * Sidebar UI state.
 * Persisted to localStorage so collapse state survives page refresh.
 */
export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      width: SIDEBAR_WIDTH,

      toggle: () =>
        set((state) => ({
          isCollapsed: !state.isCollapsed,
          width: state.isCollapsed ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH,
        })),

      collapse: () => set({ isCollapsed: true, width: SIDEBAR_COLLAPSED_WIDTH }),

      expand: () => set({ isCollapsed: false, width: SIDEBAR_WIDTH }),
    }),
    {
      name: 'resigna-sidebar',
      partialize: (state) => ({ isCollapsed: state.isCollapsed }),
    },
  ),
);
