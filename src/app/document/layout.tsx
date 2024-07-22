'use server';

import Link from 'next/link';
import Image from 'next/image';
import LogoSvg from '@/assets/document.svg';

import { Icon } from '@iconify/react';
import { constants } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { DocumentMenubar } from '@/app/document/[documentId]/_components/document-menu-bar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Profile } from '@/components/app/profile';
import { ExternalLink } from '@/components/app/external-link';
import { ReactChildren } from '@/lib/types';

export default async function DocumentLayout({ children }: ReactChildren): Promise<JSX.Element> {
  return (
    <div className="flex min-h-screen w-full flex-col h-full">
      <header className="pt-2 top-0 flex items-center gap-4 border-b px-4 pb-1.5">
        <div className="flex">
          <Link
            href={'/home'}
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <Image src={LogoSvg} priority alt="Follow us on Twitter" className="w-9" />
          </Link>

          <div className="flex flex-col pl-2">
            <div className="pl-2 flex items-center gap-3">
              <p className="text-lg font-normal text-nowrap tracking-tight">
                Sandbox Ultimate Edition
              </p>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Icon
                      icon="ic:outline-drive-file-move"
                      className="text-xl active:text-lg transition-all"
                    />
                  </TooltipTrigger>
                  <TooltipContent>Move this file inside vault</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Icon
                      icon="dashicons:cloud-saved"
                      className="text-xl active:text-lg transition-all"
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    All changes are saved in{' '}
                    <ExternalLink href={constants.externalLinks.beastzVault}>Vault</ExternalLink>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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

          <Button variant="default" className="rounded-full">
            <Icon icon="fluent:people-team-20-filled" className="mr-2 text-xl" />
            Collab
          </Button>

          <Profile />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto h-full bg-muted/40">{children}</main>
    </div>
  );
}
