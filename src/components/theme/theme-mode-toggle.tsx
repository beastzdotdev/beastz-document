'use client';

import { Icon } from '@iconify/react';
import { useMemo } from 'react';
import { CheckIcon, MixIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';
import { constants } from '@/lib/constants';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const ThemeModeToggle = (): JSX.Element => {
  const { theme, setTheme } = useTheme();
  const themeKeys = useMemo(() => Object.keys(constants.ui.themes), []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost">
          <Icon icon="mdi:theme" className="text-xl" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {themeKeys.map(key => (
          <DropdownMenuItem key={key} onClick={() => setTheme(constants.ui.themes[key])}>
            {key}
            {theme === constants.ui.themes[key] && <CheckIcon className="ml-1" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
