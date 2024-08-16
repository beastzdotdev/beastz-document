'use server';

import Link from 'next/link';
import Image from 'next/image';
import LogoSvg from '@/assets/document.svg';

import { Icon } from '@iconify/react';
import { constants } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Profile } from '@/components/app/profile';
import { ExternalLink } from '@/components/app/external-link';
import { BasicTooltip } from '@/components/app/basic-tooltip';
import { ConnectionIndicator } from '@/app/(auth)/document/_components/connection-indicator';
import { DocumentMenubar } from '@/app/(auth)/document/[documentId]/_components/document-menu-bar';
import { CollabButton } from '@/app/(auth)/document/_components/collab-button';
import { JoinedPeople } from '@/app/(auth)/document/_components/joined-people';
import { ReactChildren } from '@/lib/types';
import { LayoutTitle } from '@/app/(auth)/document/_components/layout-title';

export default async function DocumentLayout({ children }: ReactChildren): Promise<JSX.Element> {
  const people: { name: string }[] = [
    // /
    { name: 'John' },
    { name: 'Jane' },
    { name: 'Jack' },
  ];

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
          <JoinedPeople people={people} />
          <CollabButton />
          <Profile />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto h-full bg-muted/40">{children}</main>
    </div>
  );
}
