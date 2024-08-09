'use client';

import { api } from '@/lib/api/api';
import { secureHealthCheck } from '@/lib/api/definitions';
import { ReactChildren } from '@/lib/types';
import { useCallback, useEffect, useState } from 'react';

export default function Template({ children }: ReactChildren): JSX.Element {
  const [show, setShow] = useState(false);

  const shouldRenderPages = useCallback(async () => {
    const { error } = await secureHealthCheck();
    setShow(error ? false : true);
  }, []);

  useEffect(
    () => {
      shouldRenderPages();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  if (show) {
    return <>{children}</>;
  }

  return <></>;
}
