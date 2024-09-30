'use client';

import { CollabJoinPageProps } from '@/app/collab-join/type';

export default function CollabJoin(params: CollabJoinPageProps) {
  console.log('='.repeat(20));
  console.log(params.searchParams?.sharedUniqueHash);
  return (
    <>
      <p>Trying to join</p>
      <>{JSON.stringify(params)}</>
    </>
  );
}
