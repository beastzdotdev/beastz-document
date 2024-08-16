import { FileStructure } from '@/lib/api/type';
import { create } from 'zustand';

type State = {
  documents: FileStructure[];
  setDocuments: (documents: FileStructure[]) => void;
  pushDocument: (document: FileStructure) => void;
};

export const useDocumentStore = create<State>((set, get) => ({
  documents: [],
  pushDocument: (document: FileStructure) => set({ documents: [...get().documents, document] }),
  setDocuments: (documents: FileStructure[]) => set({ documents }),
}));
