import Link from 'next/link';
import { ReactPropsWithChildren } from '@/lib/types';
import { cn } from '@/lib/utils';
import { UrlObject } from 'url';

type Props = ReactPropsWithChildren<{
  href: string | UrlObject;
  className?: string;
  noUnderline?: boolean;
}>;

export const ExternalLink = (props: Props): JSX.Element => {
  const { href, children, className, noUnderline } = props;

  return (
    <Link
      href={href as unknown as UrlObject}
      target="_blank"
      rel="noopener noreferrer"
      className={cn({ underline: !noUnderline }, className, 'cursor-pointer')}
    >
      {children}
    </Link>
  );
};
