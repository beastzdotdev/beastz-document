import { cn } from '@/lib/utils';

type Props = {
  href: string;
  children: React.ReactNode;
  className?: string;
  noUnderline?: boolean;
};

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
