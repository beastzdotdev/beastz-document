'use client';

import { FileStructure, FileStructurePublicShare } from '@/lib/api/type';
import { SocketStatus } from '@/lib/types';
import { Text } from '@uiw/react-codemirror';
import { create } from 'zustand';

type SocktState = {
  status: SocketStatus;
  setStatus: (status: SocketStatus) => void;
  clear: () => void;
};

type DocumentState = {
  document: FileStructure | null;
  setDocument: (fs: FileStructure) => void;
  getDocumentStrict: () => FileStructure;
  clear: () => void;
};

type DocumentShareState = {
  isEnabled: boolean;
  data: FileStructurePublicShare | null;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  setAll: (value: Partial<DocumentShareState>) => void;
  clear: () => void;
};

type UserDocStore = {
  initDoc: Text | undefined;
  readonly: boolean;
  setInitDoc: (value: Text) => void;
  setReadonly: (value: boolean) => void;
  setAll: (params: { value: Text; readonly: boolean }) => void;
  clear: () => void;
};

type JoinedPeopleState = {
  people: string[];
  setPeople: (people: string[]) => void;
  clear: () => void;
};

export const useSocketStore = create<SocktState>((set, get) => ({
  status: 'disconnected',
  setStatus: (status: SocketStatus) => set({ status }),
  clear() {
    set({ status: 'disconnected' });
  },
}));

// This state is for file structure
export const useDocumentStore = create<DocumentState>((set, get) => ({
  document: null,
  setDocument: (fs: FileStructure) => set({ document: fs }),
  getDocumentStrict: () => {
    const { document: fs } = get();

    if (!fs) {
      throw new Error('fs is not set');
    }

    return fs;
  },
  clear: () => set({ document: null }),
}));

export const useDocumentShareStore = create<DocumentShareState>((set, get) => ({
  isEnabled: false,
  data: null,
  isLoading: false,
  setIsLoading: value => set({ isLoading: value }),
  setAll: value => set(value),
  clear: () => set({ isEnabled: false, data: null, isLoading: false }),
}));

// This state is for codemirror doc (I know bad naming)
export const useDocStore = create<UserDocStore>(set => ({
  initDoc: undefined,
  readonly: true,
  setInitDoc: (value: Text) => set({ initDoc: value }),
  setReadonly: (value: boolean) => set({ readonly: value }),
  setAll: ({ value, readonly }) => set({ initDoc: value, readonly }),
  clear: () => set({ initDoc: undefined, readonly: true }),
}));

export const useJoinedPeopleStore = create<JoinedPeopleState>(set => ({
  people: [],
  setPeople: (people: string[]) => set({ people }),
  clear: () => set({ people: [] }),
}));
