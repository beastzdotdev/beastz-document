/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useUserStore } from '@/app/(auth)/state';
import { getCurrentUser } from '@/lib/api/definitions';
import { constants } from '@/lib/constants';
import { ReactChildren } from '@/lib/types';
import { cleanURL } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';

export default function Template({ children }: ReactChildren): JSX.Element | null {
  const userStore = useUserStore();
  const router = useRouter();

  const shouldRenderPages = useCallback(async () => {
    const { data, error } = await getCurrentUser();

    if (!data || error) {
      router.push(cleanURL(constants.path.oops, { message: 'User not found' }).toString());
      return;
    }

    userStore.setUser(data);
  }, [router, userStore]);

  useEffect(() => {
    shouldRenderPages();
  }, []);

  return userStore.user ? <>{children}</> : null;
}
