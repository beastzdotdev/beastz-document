'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',

          // cancelButton:
          //   "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          cancelButton:
            'absolute top-1.5 right-1.5 !text-gray-500 hover:!text-gray-50 !transition-colors duration-200 !bg-inherit !text-inherit',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
