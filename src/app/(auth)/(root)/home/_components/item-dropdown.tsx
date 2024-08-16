import { DeleteIcon, OpenNewTab, RenameIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { ExternalLink } from '@/components/app/external-link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FileStructure } from '@/lib/api/type';
import { useMemo } from 'react';
import { constants } from '@/lib/constants';

type Props = {
  item: FileStructure;
  className?: string;
};

export const ItemDropdown = ({ item, className }: Props): JSX.Element => {
  const url = useMemo(() => {
    const queryParams = new URLSearchParams({
      [constants.general.queryTitleForDocument]: item.title,
    });

    return `/document/${item.id}?${queryParams.toString()}`;
  }, [item.id, item.title]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className={className}>
        <Button variant="ghost" size="icon">
          <Icon icon="bi:three-dots-vertical" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={e => e.stopPropagation()}>
          <RenameIcon className="mr-1.5" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem onClick={e => e.stopPropagation()}>
          <DeleteIcon className="mr-1.5" />
          Remove
        </DropdownMenuItem>
        <ExternalLink href={url} noUnderline>
          <DropdownMenuItem onClick={e => e.stopPropagation()}>
            <OpenNewTab className="mr-1.5" />
            Open in new tab
          </DropdownMenuItem>
        </ExternalLink>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
