import { DeleteIcon, OpenNewTab, RenameIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { ExternalLink } from '@/components/app/external-link';
import { FileStructure } from '@/lib/api/type';
import { getRedirectUrl } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Props = {
  item: FileStructure;
  className?: string;
};

export const ItemDropdown = ({ item, className }: Props): JSX.Element => {
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
        <ExternalLink href={getRedirectUrl(item)} noUnderline>
          <DropdownMenuItem onClick={e => e.stopPropagation()}>
            <OpenNewTab className="mr-1.5" />
            Open in new tab
          </DropdownMenuItem>
        </ExternalLink>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
