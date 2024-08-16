import Image from 'next/image';
import Link from 'next/link';
import { UrlObject } from 'url';
import { Card } from '@/components/ui/card';
import { DocumentIcon } from '@/components/icons';
import { useMemo } from 'react';
import { constants } from '@/lib/constants';
import { ItemDropdown } from '@/app/(auth)/(root)/home/_components/item-dropdown';
import { FileStructure } from '@/lib/api/type';
import { formatDate } from '@/lib/utils';

//TODO: resolve this issue
const imgUrl = 'https://miro.medium.com/v2/resize:fit:1087/1*37nudw5YFzaQOo3RYcKrZA.png';

export const GridViewItem = ({ item }: { item: FileStructure }): JSX.Element => {
  const url = useMemo(() => {
    const queryParams = new URLSearchParams({
      [constants.general.queryTitleForDocument]: item.title,
    });

    return `/document/${item.id}?${queryParams.toString()}`;
  }, [item.id, item.title]);

  return (
    <Card className="h-fit w-fit border rounded-md border-gray-700" key={item.id}>
      <Link href={url as unknown as UrlObject} className="w-[218px] h-[263px] block select-none">
        <Image
          src={imgUrl}
          width="0"
          height="0"
          sizes="100vw"
          className="w-full h-full rounded-t-md"
          alt="Follow us on Twitter"
          priority
        />
      </Link>

      <div className="flex flex-col p-3">
        <h1 className="text-gray-200 text-sm font-medium">{item.title}</h1>

        <div className="flex items-center mt-2">
          <DocumentIcon />

          <p className="ml-2 text-xs text-gray-400 flex-1">
            {formatDate(new Date(item.lastModifiedAt))}
          </p>

          <ItemDropdown item={item} className="ml-1" />
        </div>
      </div>
    </Card>
  );
};
