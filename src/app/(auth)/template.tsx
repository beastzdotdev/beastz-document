'use client';

import { useUserStore } from '@/app/(auth)/state';
import { getCurrentUser } from '@/lib/api/definitions';
import { ReactChildren } from '@/lib/types';
import { useCallback, useEffect } from 'react';

export default function Template({ children }: ReactChildren): JSX.Element | null {
  const userStore = useUserStore();

  const shouldRenderPages = useCallback(async () => {
    const { data, error: _error } = await getCurrentUser();

    //! Error here will be handled in handleAxiosResponseError

    if (data) {
      userStore.setUser(data);
    }
  }, [userStore]);

  useEffect(
    () => {
      shouldRenderPages();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return userStore.user ? <>{children}</> : null;
}
