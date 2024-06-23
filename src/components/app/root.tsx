import { Button } from '@/components/ui/button';
import Link from 'next/link';

type LandingPageProps = {
  children?: React.ReactNode;
  signInUrl: string;
  signUpUrl: string;
};

export const LandingPageContent = (props: LandingPageProps) => {
  const { children, signInUrl, signUpUrl } = props;

  return (
    <>
      <Link href={signInUrl}>
        <Button>Sign in</Button>
      </Link>

      <Link href={signUpUrl}>
        <Button>Sign up</Button>
      </Link>
    </>
  );
};
