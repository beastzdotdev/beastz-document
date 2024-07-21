import Link from 'next/link';
import Image from 'next/image';
import { ThemeModeToggle } from '@/components/theme/theme-mode-toggle';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { constants } from '@/lib/constants';
import { Icon } from '@iconify/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '@/components/ui/menubar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

//lazy load
import LogoSvg from '../../../assets/document.svg';

type AppLayoutProps = {
  children: React.ReactNode;
};

function MenubarDemo() {
  return (
    <Menubar className="border-none p-0 h-auto shadow-none">
      <MenubarMenu>
        <MenubarTrigger className="font-medium px-2 cursor-pointer hover:bg-accent">
          File
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            New Tab <MenubarShortcut>⌘T</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            New Window <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>New Incognito Window</MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Share</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Email link</MenubarItem>
              <MenubarItem>Messages</MenubarItem>
              <MenubarItem>Notes</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem>
            Print... <MenubarShortcut>⌘P</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger className="font-medium px-2 cursor-pointer hover:bg-accent">
          Edit
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            Undo <MenubarShortcut>⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Find</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Search the web</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Find...</MenubarItem>
              <MenubarItem>Find Next</MenubarItem>
              <MenubarItem>Find Previous</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem>Cut</MenubarItem>
          <MenubarItem>Copy</MenubarItem>
          <MenubarItem>Paste</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger className="font-medium px-2 cursor-pointer hover:bg-accent">
          View
        </MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem>Always Show Bookmarks Bar</MenubarCheckboxItem>
          <MenubarCheckboxItem checked>Always Show Full URLs</MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarItem inset>
            Reload <MenubarShortcut>⌘R</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled inset>
            Force Reload <MenubarShortcut>⇧⌘R</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem inset>Toggle Fullscreen</MenubarItem>
          <MenubarSeparator />
          <MenubarItem inset>Hide Sidebar</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger className="font-medium px-2 cursor-pointer hover:bg-accent">
          Profiles
        </MenubarTrigger>
        <MenubarContent>
          <MenubarRadioGroup value="benoit">
            <MenubarRadioItem value="andy">Andy</MenubarRadioItem>
            <MenubarRadioItem value="benoit">Benoit</MenubarRadioItem>
            <MenubarRadioItem value="Luis">Luis</MenubarRadioItem>
          </MenubarRadioGroup>
          <MenubarSeparator />
          <MenubarItem inset>Edit...</MenubarItem>
          <MenubarSeparator />
          <MenubarItem inset>Add Profile...</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}

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

              <MenubarDemo />
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
