'use server';

import { signOut } from '@workos-inc/authkit-nextjs';

export const signOutWorkOs = async () => {
  'use server';

  await signOut();
};
