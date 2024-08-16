import Link from 'next/link';
import { UrlObject } from 'url';
import { DocumentIcon } from '@/components/icons';
import { useMemo } from 'react';
import { constants } from '@/lib/constants';
import { ItemDropdown } from '@/app/(auth)/(root)/home/_components/item-dropdown';
import { FileStructure } from '@/lib/api/type';
import { formatDate } from '@/lib/utils';

export const ListViewItem = ({ item }: { item: FileStructure }) => {
  const url = useMemo(() => {
    const queryParams = new URLSearchParams({
      [constants.general.queryTitleForDocument]: item.title,
    });

    return `/document/${item.id}?${queryParams.toString()}`;
  }, [item.id, item.title]);

  return (
    <Link href={url as unknown as UrlObject}>
      <div className="flex items-center justify-between p-3 border-b border-gray-700 hover:bg-gray-800/35 cursor-pointer">
        <div className="flex items-center gap-3">
          <DocumentIcon className="text-gray-400" />

          <div>
            <h1 className="text-gray-200 text-sm font-medium">{item.title}</h1>

            <p className="text-xs text-gray-400 flex-1">
              {formatDate(new Date(item.lastModifiedAt))}
            </p>
          </div>
        </div>

        <ItemDropdown item={item} />
      </div>
    </Link>
  );
};
