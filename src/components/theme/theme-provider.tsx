'use client';

import React, { createContext, useEffect, useState } from 'react';
import { constants } from '@/lib/constants';
import { ReactChildren } from '@/lib/types';

type ThemeProviderState = {
  theme: string;
  setTheme: (theme: string) => void;
};

const storageKey = 'app-ui-theme';
const defaultTheme = 'light';
const themeValues = Object.values(constants.ui.themes);
export const ThemeProviderContext = createContext<ThemeProviderState>({
  theme: 'system',
  setTheme: () => null,
});

export default function ThemeProvider(props: ReactChildren): JSX.Element {
  const [theme, setTheme] = useState<string>(
    () => window.localStorage.getItem(storageKey) || defaultTheme
  );

  useEffect(() => {
    const body = window.document.body;

    body.classList.remove(...themeValues);

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';

      body.classList.add(systemTheme);
      return;
    }

    body.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: string) => {
      window.localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider value={value}>{props.children}</ThemeProviderContext.Provider>
  );
}
