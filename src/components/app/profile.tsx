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
import { useUserStore } from '@/app/(auth)/state';
import { AvatarImage } from '@radix-ui/react-avatar';

export const Profile = (): JSX.Element => {
  const user = useUserStore(state => state.user);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="icon" className="rounded-full">
          <Avatar>
            {!!user?.profileFullImagePath && (
              <AvatarImage src={user?.profileFullImagePath} alt="beasts profile image" />
            )}

            <AvatarFallback>{user?.userName[0]}</AvatarFallback>
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
