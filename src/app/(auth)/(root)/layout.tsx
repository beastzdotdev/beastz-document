'use server';

import Link from 'next/link';
import Image from 'next/image';
import LogoSvg from '@/assets/document.svg';

import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Profile } from '@/components/app/profile';
import { ReactChildren } from '@/lib/types';

export default async function RootLayout({ children }: ReactChildren): Promise<JSX.Element> {
  return (
    <>
      <div className="flex min-h-screen w-full flex-col h-full">
        <header className="top-0 flex items-center gap-4 border-b p-3">
          <div className="flex">
            <Link
              href={'/home'}
              className="flex items-center gap-2 text-lg font-semibold md:text-base"
            >
              <Image
                src={LogoSvg}
                priority
                alt="Follow us on Twitter"
                className="w-7 select-none"
              />
            </Link>

            <p className="text-xl font-normal text-nowrap tracking-tight flex items-center ml-3">
              Documents
            </p>
          </div>

          <div className="flex justify-end w-full items-center gap-3 flex-1">
            <Button variant="default" className="rounded-full">
              <Icon icon="ic:round-plus" className="mr-2 text-xl" />
              Create
            </Button>

            <Button size="icon" variant="ghost" className="focus-visible:ring-0">
              <Icon icon="ion:apps" className="text-xl" />
            </Button>
            <Profile />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto h-full bg-muted/40 p-7">{children}</main>
      </div>
    </>
  );
}
