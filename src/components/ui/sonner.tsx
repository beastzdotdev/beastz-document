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
      // main defaults
      position="top-right"
      closeButton={true}
      duration={3000}
      //
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',

          closeButton:
            'left-initial transform-none border-none absolute top-1.5 right-1.5 !bg-inherit [&>svg]:w-4 [&>svg]:h-4 [&>svg]:stroke-gray-400 hover:[&>svg]:stroke-gray-100',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
