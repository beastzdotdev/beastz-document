/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import LogoSvg from '@/assets/document.svg';

import { Icon } from '@iconify/react';
import { constants } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Profile } from '@/components/app/profile';
import { ExternalLink } from '@/components/app/external-link';
import { BasicTooltip } from '@/components/app/basic-tooltip';
import { ConnectionIndicator } from '@/app/(auth)/document/_components/connection-indicator';
import { DocumentMenubar } from '@/app/(auth)/document/[documentId]/_components/document-menu-bar';
import { JoinedPeople } from '@/app/(auth)/document/_components/joined-people';
import { ReactChildren } from '@/lib/types';
import { LayoutTitle } from '@/app/(auth)/document/_components/layout-title';
import { useDocumentShareStore, useDocumentStore } from '@/app/(auth)/document/[documentId]/state';
import { useEffect, useState } from 'react';
import { cleanURL } from '@/lib/utils';
import {
  getFileStructureById,
  getFileStructurePublicShare,
  getFileStructurePublicShareEnabled,
} from '@/lib/api/definitions';

export default function DocumentTemplate({ children }: ReactChildren): JSX.Element {
  const router = useRouter();
  const params = useParams<{ documentId: string }>();
  const documentStore = useDocumentStore();
  const documentShareStore = useDocumentShareStore();

  const [renderEditor, setRenderEditor] = useState(false);

  useEffect(() => {
    (async () => {
      const documentId = parseInt(params.documentId);

      if (typeof documentId !== 'number') {
        router.push(cleanURL(constants.path.oops, { message: 'Invalid url' }).toString());
        return;
      }

      const [
        { data: docShareEnabled, error: docShareEnabledError },
        { data: fsData, error: fsError },
      ] = await Promise.all([
        getFileStructurePublicShareEnabled(documentId),
        getFileStructureById(documentId),
      ]);

      const isShareEnabledProblem = docShareEnabledError || docShareEnabled === undefined;
      const fsProblem = fsError || fsData === undefined;

      if (isShareEnabledProblem || fsProblem) {
        return router.push(
          cleanURL(constants.path.oops, { message: 'Document not found' }).toString(),
        );
      }

      documentShareStore.setAll({ isEnabled: docShareEnabled });

      if (docShareEnabled) {
        const { data, error } = await getFileStructurePublicShare(documentId);

        if (error || !data) {
          return router.push(
            cleanURL(constants.path.oops, { message: 'Something went wrong' }).toString(),
          );
        }

        documentShareStore.setAll({ data });
      }

      documentStore.setDocument(fsData);

      setRenderEditor(true);
    })();
  }, []);

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

              <BasicTooltip content="Move this file inside vault">
                <Icon
                  icon="ic:outline-drive-file-move"
                  className="text-xl active:text-lg transition-all"
                />
              </BasicTooltip>

              <BasicTooltip
                content={
                  <>
                    All changes are saved in{' '}
                    <ExternalLink href={constants.externalLinks.beastzVault}>Vault</ExternalLink>
                  </>
                }
              >
                <Icon
                  icon="dashicons:cloud-saved"
                  className="text-xl active:text-lg transition-all"
                />
              </BasicTooltip>

              <ConnectionIndicator />
            </div>

            <DocumentMenubar />
          </div>
        </div>

        <div className="flex justify-end w-full items-center md:ml-auto gap-3 flex-1">
          <Button size="icon" variant="ghost" className="focus-visible:ring-0">
            <Icon icon="ion:apps" className="text-xl" />
          </Button>
          <Button size="icon" variant="ghost" className="focus-visible:ring-0">
            <Icon icon="icon-park-solid:comments" className="text-xl" />
          </Button>
          <JoinedPeople people={[{ name: 'John' }, { name: 'Jane' }, { name: 'Jack' }]} />
          {/* Disabled for now */}
          {/* <CollabButton /> */}
          <Profile />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto h-full bg-muted/40">
        {renderEditor ? children : <Loading />}
      </main>
    </div>
  );
}

const Loading = () => {
  return (
    <>
      {/* //TODO: can add loading here */}
      <h1 className="text-center mt-5">Loading ....</h1>
    </>
  );
};
