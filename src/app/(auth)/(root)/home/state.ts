import { FileStructure } from '@/lib/api/type';
import { create } from 'zustand';

type DocumentsState = {
  documents: FileStructure[];
  updateDoc: (id: number, value: Partial<FileStructure>) => void;
  setDocuments: (documents: FileStructure[]) => void;
  pushDocument: (document: FileStructure) => void;
};

export const useDocumentsStore = create<DocumentsState>((set, get) => ({
  documents: [],
  pushDocument: (document: FileStructure) => set({ documents: [...get().documents, document] }),
  setDocuments: (documents: FileStructure[]) => set({ documents }),
  updateDoc(id, value) {
    const documents = get().documents.map(doc => (doc.id === id ? { ...doc, ...value } : doc));
    set({ documents });
  },
}));
