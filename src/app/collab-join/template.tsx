/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import Link from 'next/link';
import Image from 'next/image';
import LogoSvg from '@/assets/document.svg';

import { useState } from 'react';

import { ReactChildren } from '@/lib/types';
import { LayoutTitle } from '@/app/(auth)/document/_components/layout-title';
import { JoinedPeople } from '@/app/(auth)/document/_components/joined-people';
import { ConnectionIndicator } from '@/app/(auth)/document/_components/connection-indicator';
import { DocumentMenubar } from '@/app/(auth)/document/[documentId]/_components/document-menu-bar';
import { useSearchParams } from 'next/navigation';
import { constants } from '@/lib/constants';
import { Badge } from '@/components/app/badge';

//TODO resume here
export default function CollabJoinTemplate({ children }: ReactChildren) {
  const searchParams = useSearchParams();
  const sharedUniqueHash = searchParams.get(constants.general.querySharedUniqueHash);
  const title = searchParams.get(constants.general.queryTitleForDocument);

  const [initialLoadingIsReady, setInitialLoadingIsReady] = useState(false);

  return (
    <div className="flex min-h-screen w-full flex-col h-full">
      <header className="pt-2 top-0 flex items-center gap-4 border-b px-4 pb-1.5">
        <div className="flex">
          <Link href="/home" className="flex items-center gap-2 text-lg font-semibold md:text-base">
            <Image src={LogoSvg} priority alt="Follow us on Twitter" className="w-9" />
          </Link>

          <div className="flex flex-col pl-2">
            <div className="pl-2 flex items-center gap-3">
              <p className="text-lg font-normal text-nowrap tracking-tight">
                <LayoutTitle />
              </p>

              <ConnectionIndicator />
              <Badge text="Guest" />
            </div>

            <DocumentMenubar isServant />
          </div>
        </div>

        <div className="flex justify-end w-full items-center md:ml-auto gap-3 flex-1">
          <JoinedPeople people={[{ name: 'John' }, { name: 'Jane' }, { name: 'Jack' }]} />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto h-full bg-muted/40">
        {initialLoadingIsReady ? (
          children
        ) : (
          <>
            <h1 className="mt-5 flex gap-1 justify-center">
              Loading <p className="font-bold">{title}</p> <Badge text={`#${sharedUniqueHash}`} />
              ...
            </h1>
          </>
        )}
      </main>
    </div>
  );
}
