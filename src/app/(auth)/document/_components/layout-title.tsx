'use client';

import { constants } from '@/lib/constants';
import { useSearchParams } from 'next/navigation';

export const LayoutTitle = () => {
  const searchParams = useSearchParams();
  const title = searchParams.get(constants.general.queryTitleForDocument) ?? 'Temp';

  return title;
};
