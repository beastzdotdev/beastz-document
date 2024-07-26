'use client';

import { constants } from '@/lib/constants';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ExternalLink } from '@/components/app/external-link';
import { bus } from '@/lib/bus';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Profile = (): JSX.Element => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="icon" className="rounded-full">
          <Avatar>
            <AvatarFallback>Gio</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <ExternalLink href={constants.externalLinks.profileEdit} noUnderline>
          <DropdownMenuItem>Profile</DropdownMenuItem>
        </ExternalLink>

        <DropdownMenuItem onClick={() => bus.emit('open:settings')}>Settings</DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
