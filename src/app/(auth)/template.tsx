'use client';

import { useUserStore } from '@/app/(auth)/state';
import { getCurrentUser } from '@/lib/api/definitions';
import { ReactChildren } from '@/lib/types';
import { useCallback, useEffect } from 'react';

export default function Template({ children }: ReactChildren): JSX.Element {
  const userStore = useUserStore();

  const shouldRenderPages = useCallback(async () => {
    const { data } = await getCurrentUser();

    if (data) {
      userStore.setUser(data);
      return;
    }
  }, [userStore]);

  useEffect(
    () => {
      shouldRenderPages();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  if (!!userStore.user) {
    return <>{children}</>;
  }

  return <></>;
}
