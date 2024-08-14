'use client';

import { UserResponseDto } from '@/lib/api/type';
import { create } from 'zustand';

type SocktState = {
  user: UserResponseDto | null;
  setUser: (user: UserResponseDto) => void;
};

export const useUserStore = create<SocktState>((set, get) => ({
  user: null,
  setUser: (user: UserResponseDto) => set({ user }),
}));
