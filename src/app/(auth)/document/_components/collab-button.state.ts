'use client';

import { FileStructurePublicShare } from '@/lib/api/type';
import { create } from 'zustand';

type CollabButtonState = {
  data: FileStructurePublicShare | null;
  isLoading: boolean;
  isModalDisabled: boolean;
  setIsLoading: (value: boolean) => void;
  setModalDisabled: (value: boolean) => void;
  setAll: (value: Partial<CollabButtonState>) => void;
};

export const useCollabButtonStore = create<CollabButtonState>((set, get) => ({
  data: null,
  isLoading: false,
  isModalDisabled: false,
  setIsLoading: value => set({ isLoading: value }),
  setModalDisabled: value => set({ isModalDisabled: value }),
  setAll: value => set(value),
}));

// collabButtonStore.setData(data);
// collabButtonStore.setModalDisabled(false);
// collabButtonStore.setShareable(true);
