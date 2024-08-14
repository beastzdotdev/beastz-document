'use client';

import { create } from 'zustand';

export type SocketStatus = 'connected' | 'disconnected' | 'reconnecting';

type SocktState = {
  status: SocketStatus;
  setStatus: (status: SocketStatus) => void;
};

export const useSocketStore = create<SocktState>((set, get) => ({
  status: 'disconnected',
  setStatus: (status: SocketStatus) => set({ status }),
}));
