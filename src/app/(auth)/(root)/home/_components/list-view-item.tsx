import Link from 'next/link';
import { ItemDropdown } from '@/app/(auth)/(root)/home/_components/item-dropdown';
import { FileStructure } from '@/lib/api/type';
import { formatDate, getRedirectUrl } from '@/lib/utils';
import { CardIcon } from '@/app/(auth)/(root)/home/_components/card-icon';

export const ListViewItem = ({ item }: { item: FileStructure }) => {
  return (
    <Link href={getRedirectUrl(item)}>
      <div className="flex items-center justify-between p-3 border-b border-gray-700 hover:bg-gray-800/35 cursor-pointer">
        <div className="flex items-center gap-3">
          <CardIcon item={item} className="text-gray-400" />

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
