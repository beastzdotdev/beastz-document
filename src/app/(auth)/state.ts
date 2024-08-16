'use client';

import { UserResponseDto } from '@/lib/api/type';
import { create } from 'zustand';

type SocktState = {
  user: UserResponseDto | null;
  setUser: (user: UserResponseDto) => void;
  getUser: () => UserResponseDto;
};

export const useUserStore = create<SocktState>((set, get) => ({
  user: null,
  setUser: (user: UserResponseDto) => set({ user }),
  getUser: () => {
    const { user } = get();

    if (!user) {
      throw new Error('User is not set');
    }

    return user;
  },
}));
