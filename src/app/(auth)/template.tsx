'use client';

import { useUserStore } from '@/app/(auth)/state';
import { redirectToAuthSignin } from '@/lib/api/api';
import { getCurrentUser } from '@/lib/api/definitions';
import { ExceptionMessageCode } from '@/lib/enums/exception-message-code.enum';
import { ReactChildren } from '@/lib/types';
import { useCallback, useEffect } from 'react';

export default function Template({ children }: ReactChildren): JSX.Element | null {
  const userStore = useUserStore();

  const shouldRenderPages = useCallback(async () => {
    const { data, error } = await getCurrentUser();

    //! Error here will be handled in handleAxiosResponseError
    if (error) {
      if (error.message === ExceptionMessageCode.USER_NOT_FOUND) {
        return redirectToAuthSignin();
      }
    }

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
