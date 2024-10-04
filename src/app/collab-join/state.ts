import { create } from 'zustand';
import { PublicFileStructurePublicShare } from '@/lib/api/type';
import { Text } from '@uiw/react-codemirror';

type CollabStoreState = {
  data: PublicFileStructurePublicShare | null;
  setData: (data: PublicFileStructurePublicShare | null) => void;
  getDataStrict: () => PublicFileStructurePublicShare;
};

type CodemirrorState = {
  initDoc: Text | null;
  readonly: boolean;
  setInitDoc: (value: Text) => void;
  setReadonly: (value: boolean) => void;
  setAll: (params: { value: Text; readonly: boolean }) => void;
  clear: () => void;
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

export const useCodemirrorStore = create<CodemirrorState>((set, get) => ({
  initDoc: null,
  readonly: true,
  setInitDoc: value => set({ initDoc: value }),
  setReadonly: value => set({ readonly: value }),
  setAll: ({ value, readonly }) => set({ initDoc: value, readonly }),
  clear: () => set({ initDoc: null, readonly: true }),
}));
