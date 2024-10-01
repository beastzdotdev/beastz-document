import { create } from 'zustand';
import { PublicFileStructurePublicShare } from '@/lib/api/type';

type CollabStoreState = {
  data: PublicFileStructurePublicShare | null;
  setData: (data: PublicFileStructurePublicShare | null) => void;
  getDataStrict: () => PublicFileStructurePublicShare;
};

export const useCollabStore = create<CollabStoreState>((set, get) => ({
  data: null,
  setData: value => set({ data: value }),
  getDataStrict: () => {
    if (!get().data) {
      throw new Error('data is null');
    }

    return get().data!;
  },
}));
