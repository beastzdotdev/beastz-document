import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { ItemDropdown } from '@/app/(auth)/(root)/home/_components/item-dropdown';
import { FileStructure } from '@/lib/api/type';
import { formatDate, getDocumentRedirectUrl } from '@/lib/utils';
import { CardIcon } from '@/app/(auth)/(root)/home/_components/card-icon';
import { Icon } from '@iconify/react/dist/iconify.js';

export const GridViewItem = ({ item }: { item: FileStructure }): JSX.Element => {
  return (
    <Card className="h-fit w-fit rounded-lg bg-[#282C34]" key={item.id}>
      <Link href={getDocumentRedirectUrl(item)} className="w-[218px] h-[263px] block select-none">
        {item.documentImagePreviewPath ? (
          <Image
            src={item.documentImagePreviewPath}
            className="rounded-t-md w-full h-full"
            unoptimized
            alt="Logo"
            priority
            width="0"
            height="0"
          />
        ) : (
          <div className="flex justify-center items-center w-full h-full">
            <Icon icon="hugeicons:image-not-found-01" className="text-5xl" />
          </div>
        )}
      </Link>

      <div className="flex flex-col p-3">
        <h1 className="text-gray-200 text-sm font-medium">{item.title}</h1>

        <div className="flex items-center mt-2">
          <CardIcon item={item} />

          <p className="ml-2 text-xs text-gray-400 flex-1">
            {formatDate(new Date(item.lastModifiedAt))}
          </p>

          <ItemDropdown item={item} className="ml-1" />
        </div>
      </div>
    </Card>
  );
};
