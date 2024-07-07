import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import { Inter as FontSans } from 'next/font/google';
import { getSignInUrl, getSignUpUrl, getUser } from '@workos-inc/authkit-nextjs';
import { LandingPageContent } from '@/components/app/root';
import { AppLayout } from '@/components/app/app-layout';

import '../styles/globals.css';
import '../styles/theme.css';
import CustomThemeProvider from '@/components/theme/custom-theme-provider';

const ThemeProvider = dynamic(() => import('../components/theme-provider'), { ssr: false });

export const metadata: Metadata = {
  title: 'Beastz Doc',
  description: 'Collaborative and Documentation tool for beastzs',
};

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [userInfo, signInUrl, signUpUrl] = await Promise.all([
    getUser(),
    getSignInUrl(),
    getSignUpUrl(),
  ]);

  if (!userInfo.user) {
    //TODO: static page here
    //! here will be like opening page like static page

    return (
      <>
        <html lang="en">
          <body>
            <LandingPageContent signInUrl={signInUrl} signUpUrl={signUpUrl} />
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
      </head>

      <body
        className={cn('min-h-screen bg-background font-sans antialiased', fontSans.variable)}
        suppressHydrationWarning
      >
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <CustomThemeProvider defaultTheme="neutral" storageKey="vite-ui-custom-theme">
            <AppLayout userInfo={userInfo}>{children}</AppLayout>
          </CustomThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
