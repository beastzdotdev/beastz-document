'use client';

import { signOutWorkOs } from '@/app/action';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useTransition } from 'react';

export const SignOutComponent = () => {
  const [isPending, startTransition] = useTransition();

  const signOut = async () => {
    startTransition(() => {
      signOutWorkOs();
    });
  };

  return (
    <DropdownMenuItem disabled={isPending} onClick={signOut}>
      Sign out
    </DropdownMenuItem>
  );
};
