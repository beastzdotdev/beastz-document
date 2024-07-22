import { ReactPropsWithChildren } from '@/lib/types';
import { cn } from '@/lib/utils';

type Props = ReactPropsWithChildren<{
  href: string;
  className?: string;
  noUnderline?: boolean;
}>;

export const ExternalLink = (props: Props): JSX.Element => {
  const { href, children, className, noUnderline } = props;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn({ underline: !noUnderline }, className, 'cursor-pointer')}
    >
      {children}
    </a>
  );
};
