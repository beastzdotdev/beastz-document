'use client';

import { FileStructure, FileStructurePublicShare } from '@/lib/api/type';
import { SocketStatus } from '@/lib/types';
import { create } from 'zustand';



type SocktState = {
  status: SocketStatus;
  setStatus: (status: SocketStatus) => void;
};

type DocumentState = {
  document: FileStructure|null;
  setDocument: (fs: FileStructure) => void;
  getDocumentStrict: () => FileStructure;
};


type DocumentShareState = {
  isEnabled: boolean;
  data: FileStructurePublicShare | null;
  isLoading: boolean;
  isModalDisabled: boolean;
  setIsLoading: (value: boolean) => void;
  setModalDisabled: (value: boolean) => void;
  setAll: (value: Partial<DocumentShareState>) => void;
};

export const useSocketStore = create<SocktState>((set, get) => ({
  status: 'disconnected',
  setStatus: (status: SocketStatus) => set({ status }),
}));

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
}))

export const useDocumentShareStore = create<DocumentShareState>((set, get) => ({
  isEnabled: false,
  data: null,
  isLoading: false,
  isModalDisabled: false,
  setIsLoading: value => set({ isLoading: value }),
  setModalDisabled: value => set({ isModalDisabled: value }),
  setAll: value => set(value),
}));