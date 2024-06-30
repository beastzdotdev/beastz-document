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
      <body className={cn('min-h-screen bg-background font-sans antialiased', fontSans.variable)}>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <CustomThemeProvider defaultTheme="neutral" storageKey="vite-ui-custom-theme">
            <AppLayout userInfo={userInfo}>{children}</AppLayout>
          </CustomThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
