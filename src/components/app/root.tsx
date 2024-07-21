import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const LandingPageContent = () => {
  return (
    <>
      <Link href="/home">
        <Button>Sign in</Button>
      </Link>

      <Link href="/home">
        <Button>Sign up</Button>
      </Link>
    </>
  );
};
