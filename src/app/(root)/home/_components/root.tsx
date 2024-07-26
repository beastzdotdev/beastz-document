'use client';

import Image from 'next/image';
import Link from 'next/link';
import { UrlObject } from 'url';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DocumentIcon } from '@/components/icons';
import { ItemDropdown } from '@/app/(root)/home/_components/item-dropdown';
import { BasicTooltip } from '@/components/app/basic-tooltip';
import { useCallback, useEffect, useState } from 'react';
import { constants } from '@/lib/constants';
import { bus } from '@/lib/bus';

export type Item = {
  id: number;
  title: string;
  icon: string;
  url: string;
  imgUrl: string;
  lastUpdatedAt: Date;
};

//TODO: remove this data
const tempData: Item[] = Array.from({ length: 12 }, (_, i) => {
  const title = `Item ${i}`;
  const queryParams = new URLSearchParams({
    [constants.general.queryTitleForDocument]: title,
  });

  return {
    id: i,
    title,
    url: `/document/${i}?${queryParams}`,
    imgUrl: 'https://miro.medium.com/v2/resize:fit:1087/1*37nudw5YFzaQOo3RYcKrZA.png',
    icon: 'fa-solid fa-file-lines',
    lastUpdatedAt: i < 6 ? getYesterday() : new Date(),
  };
});

function getYesterday() {
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  return yesterday;
}

function formatDate(date: Date): string {
  const now = new Date();
  const isToday = now.toDateString() === date.toDateString();

  const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
  const time = date.toLocaleTimeString([], options);

  if (isToday) {
    return `Opened ${time}`;
  } else {
    const dateOptions: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    };
    const formattedDate = date.toLocaleDateString('en-US', dateOptions);
    return `Opened ${formattedDate}`;
  }
}

const GridViewItems = ({ data }: { data: Item[] }) => {
  return (
    <div className="grid grid-cols-3 lg:grid-cols-4 gap-7">
      {data.map(e => (
        <Card className="h-fit w-fit border rounded-md border-gray-700" key={e.id}>
          <Link
            href={e.url as unknown as UrlObject}
            className="w-[218px] h-[263px] block select-none"
          >
            <Image
              src={e.imgUrl}
              width="0"
              height="0"
              sizes="100vw"
              className="w-full h-full rounded-t-md"
              alt="Follow us on Twitter"
              priority
            />
          </Link>

          <div className="flex flex-col p-3">
            <h1 className="text-gray-200 text-sm font-medium">{e.title}</h1>

            <div className="flex items-center mt-2">
              <DocumentIcon />

              <p className="ml-2 text-xs text-gray-400 flex-1">{formatDate(e.lastUpdatedAt)}</p>

              <ItemDropdown item={e} className="ml-1" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

const ListViewItems = ({ data }: { data: Item[] }) => {
  return (
    <>
      {data.map(e => (
        <Link href={e.url as unknown as UrlObject} key={e.id}>
          <div className="flex items-center justify-between p-3 border-b border-gray-700 hover:bg-gray-800/35 hover:border-gray-800/35 cursor-pointer">
            <div className="flex items-center gap-3">
              <DocumentIcon className="text-gray-400" />

              <div>
                <h1 className="text-gray-200 text-sm font-medium">{e.title}</h1>

                <p className="text-xs text-gray-400 flex-1">{formatDate(e.lastUpdatedAt)}</p>
              </div>
            </div>

            <ItemDropdown item={e} />
          </div>
        </Link>
      ))}
    </>
  );
};

type ViewType = 'list' | 'grid';

export const DashboardRoot = (): JSX.Element => {
  const [view, setView] = useState<ViewType | null>(null);

  const toggleView = useCallback(() => {
    const final: ViewType = view === 'list' ? 'grid' : 'list';
    setView(final);
    localStorage.setItem(constants.general.localStorageViewTypeKey, final);
  }, [view]);

  useEffect(() => {
    // fill local storage before render
    // default will be grid !
    const item = localStorage.getItem(constants.general.localStorageViewTypeKey) as ViewType | null;

    if (!item) {
      localStorage.setItem(constants.general.localStorageViewTypeKey, 'grid' as ViewType);
    }

    setView(item);
  }, []);

  return (
    <div className="max-w-[920px] mx-auto">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl text-gray-200">Recent documents</h1>

        <div>
          <BasicTooltip content={view === 'list' ? 'Grid view' : 'List view'} asChild>
            <Button variant="ghost" size="icon" onClick={toggleView}>
              {view === 'list' ? (
                <Icon icon="ic:round-grid-view" className="text-xl" />
              ) : (
                <Icon icon="ic:round-view-list" className="text-xl" />
              )}
            </Button>
          </BasicTooltip>

          <BasicTooltip content="Sort options" asChild>
            <Button variant="ghost" size="icon">
              <Icon icon="icon-park-outline:sort" className="text-xl" />
            </Button>
          </BasicTooltip>

          <BasicTooltip content="Open file" asChild>
            <Button variant="ghost" size="icon" onClick={() => bus.emit('open:file-modal')}>
              <Icon icon="ic:round-folder" className="text-xl" />
            </Button>
          </BasicTooltip>
        </div>
      </div>

      {view ? <RenderView view={view} data={tempData} /> : null}
    </div>
  );
};

const RenderView = ({ view, data }: { view: ViewType; data: Item[] }) => {
  return view === 'list' ? <ListViewItems data={data} /> : <GridViewItems data={tempData} />;
};
