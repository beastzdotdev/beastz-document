import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import { Inter as FontSans } from 'next/font/google';
import { LandingPageContent } from '@/components/app/root';

import '../styles/globals.css';
import '../styles/theme.css';

const ThemeProvider = dynamic(() => import('@/components/theme/theme-provider'), { ssr: false });

export const metadata: Metadata = {
  title: 'Beastz Docs',
  description: 'Collaborative and Documentation tool for beastzs',
};

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const isAuthenticated = true;

  if (!isAuthenticated) {
    return (
      <>
        <html lang="en">
          <body>
            <LandingPageContent />
          </body>
        </html>
      </>
    );
  }

  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
          integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        {/* <link rel="icon" href="/favicon.ico" sizes="any" /> */}
      </head>

      <body
        className={cn('min-h-screen bg-background font-sans antialiased', fontSans.variable)}
        suppressHydrationWarning
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
