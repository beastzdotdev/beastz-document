import { Button } from '@/components/ui/button';
import { constants } from '@/lib/constants';
import Link from 'next/link';

export const LandingPageContent = () => {
  return (
    <>
      <Link href={constants.path.signIn}>
        <Button>Sign in</Button>
      </Link>

      <Link href={constants.path.signUp}>
        <Button>Sign up</Button>
      </Link>
    </>
  );
};
