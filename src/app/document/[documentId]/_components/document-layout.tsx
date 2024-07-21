import Link from 'next/link';
import Image from 'next/image';
import LogoSvg from '@/assets/document.svg';

import { Icon } from '@iconify/react';
import { constants } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeModeToggle } from '@/components/theme/theme-mode-toggle';
import { DocumentMenubar } from '@/app/document/[documentId]/_components/document-menu-bar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type AppLayoutProps = {
  children: React.ReactNode;
};

export const DocumentLayout = async ({ children }: AppLayoutProps) => {
  return (
    <>
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
                      <a
                        href={constants.externalLinks.beastzVault}
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
                      >
                        Vault
                      </a>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <DocumentMenubar />
            </div>
          </div>

          <div className="flex justify-end w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4 flex-1">
            <Button size="icon" variant="outline" className="focus-visible:ring-0">
              <Icon icon="ion:apps" className="text-xl" />
            </Button>

            <Button size="icon" variant="outline" className="focus-visible:ring-0">
              <Icon icon="icon-park-solid:comments" className="text-xl" />
            </Button>

            <ThemeModeToggle />

            <Button variant="default" className="rounded-full">
              <Icon icon="charm:share" className="mr-2 h-4 w-4" />
              Share
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                  <Avatar>
                    {/* {AvatarProfileUrl && <AvatarImage src={AvatarProfileUrl} />} */}
                    <AvatarFallback>Gio</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto h-full bg-muted/40">{children}</main>
      </div>
    </>
  );
};
