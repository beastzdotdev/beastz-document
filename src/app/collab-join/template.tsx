/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import Link from 'next/link';
import Image from 'next/image';
import LogoSvg from '@/assets/document.svg';

import { useEffect, useState } from 'react';

import { ReactChildren } from '@/lib/types';
import { LayoutTitle } from '@/app/(auth)/document/_components/layout-title';
import { ConnectionIndicator } from '@/app/(auth)/document/_components/connection-indicator';
import { DocumentMenubar } from '@/app/(auth)/document/[documentId]/_components/document-menu-bar';
import { useRouter, useSearchParams } from 'next/navigation';
import { constants } from '@/lib/constants';
import { Chip } from '@/components/app/chip';
import { getFsPublicSharePublic } from '@/lib/api/definitions';
import { cleanURL } from '@/lib/utils';
import { useCollabStore } from '@/app/collab-join/state';
import { JoinedPeopleAmount } from '@/app/(auth)/document/_components/joined-people-amount';

export default function CollabJoinTemplate({ children }: ReactChildren) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const collabStore = useCollabStore();
  const sharedUniqueHash = searchParams.get(constants.general.querySharedUniqueHash);
  const [initialLoadingIsReady, setInitialLoadingIsReady] = useState(false);

  useEffect(() => {
    if (typeof sharedUniqueHash !== 'string') {
      router.push(cleanURL(constants.path.oops, { message: 'Invalid url' }).toString());
      return;
    }

    (async () => {
      const { data, error } = await getFsPublicSharePublic(sharedUniqueHash);

      if (error || !data) {
        router.push(cleanURL(constants.path.oops, { message: 'Something went wrong' }).toString());
        return;
      }

      if (!data.data && !data.enabled) {
        router.push(
          cleanURL(constants.path.oops, { message: 'Document sharing not enabled' }).toString(),
        );
        return;
      }

      if (data.data && !data.enabled) {
        router.push(
          cleanURL(constants.path.oops, {
            message: 'Document sharing no longer enabled',
          }).toString(),
        );
        return;
      }

      collabStore.setData(data.data);

      setInitialLoadingIsReady(true);
    })();
  }, []);

  if (!initialLoadingIsReady) {
    return null;
  }

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
              <Chip text="Guest" />
            </div>

            <DocumentMenubar isServant />
          </div>
        </div>

        {/* <div className="flex justify-end w-full items-center md:ml-auto gap-3 flex-1">
          <JoinedPeople people={[{ name: 'John' }, { name: 'Jane' }, { name: 'Jack' }]} />
        </div> */}

        <div className="flex justify-end w-full items-center md:ml-auto gap-3 flex-1">
          <JoinedPeopleAmount isServant={true} />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto h-full bg-muted/40">
        {children}

        {/* {initialLoadingIsReady ? (
          children
        ) : (
          <>
            <h1 className="mt-5 flex gap-1 justify-center items-center">
              Loading <p className="font-bold">{title}</p> <Chip text={`#${sharedUniqueHash}`} />
              <Icon icon="eos-icons:three-dots-loading" className="text-4xl" />
            </h1>
          </>
        )} */}
      </main>
    </div>
  );
}
