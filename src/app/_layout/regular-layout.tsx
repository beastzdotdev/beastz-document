'use server';

import Link from 'next/link';
import Image from 'next/image';
import LogoSvg from '@/assets/document.svg';

import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { ThemeModeToggle } from '@/components/theme/theme-mode-toggle';
import { Profile } from '@/components/app/profile';

type Props = {
  children: React.ReactNode;
};

export const RegularLayout = async ({ children }: Props) => {
  return (
    <>
      <div className="flex min-h-screen w-full flex-col h-full">
        <header className="top-0 flex items-center gap-4 border-b p-4">
          <div className="flex">
            <Link
              href={'/home'}
              className="flex items-center gap-2 text-lg font-semibold md:text-base"
            >
              <Image src={LogoSvg} priority alt="Follow us on Twitter" className="w-9" />
            </Link>

            {/* <div className="flex flex-col pl-2">
              <div className="pl-2 flex items-center gap-3">
              </div>
            </div> */}
            <p className="text-xl font-semibold text-nowrap tracking-tight flex items-center ml-3">
              Docs
            </p>
          </div>

          <div className="flex justify-end w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4 flex-1">
            <Button size="icon" variant="outline" className="focus-visible:ring-0">
              <Icon icon="ion:apps" className="text-xl" />
            </Button>
            <ThemeModeToggle />
            <Profile />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto h-full bg-muted/40 p-7">{children}</main>
      </div>
    </>
  );
};
