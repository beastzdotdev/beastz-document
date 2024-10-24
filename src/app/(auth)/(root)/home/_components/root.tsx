'use client';

import { toast } from 'sonner';
import { bus } from '@/lib/bus';
import { Icon, loadIcons } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { BasicTooltip } from '@/components/app/basic-tooltip';
import { useCallback, useEffect, useState } from 'react';
import { constants } from '@/lib/constants';
import { useDocumentsStore } from '@/app/(auth)/(root)/home/state';
import { getFileStructures } from '@/lib/api/definitions';
import { ListViewItem } from '@/app/(auth)/(root)/home/_components/list-view-item';
import { GridViewItem } from '@/app/(auth)/(root)/home/_components/grid-view-item';
import { ViewType } from '@/lib/types';

export const DashboardRoot = (): JSX.Element => {
  const documentStore = useDocumentsStore();
  const [view, setView] = useState<ViewType | null>(null);

  const toggleView = useCallback(() => {
    const final: ViewType = view === 'list' ? 'grid' : 'list';
    setView(final);
    localStorage.setItem(constants.general.localStorageViewTypeKey, final);
  }, [view]);

  const setInitialDocuments = useCallback(async () => {
    const { data, error } = await getFileStructures();

    if (data) {
      documentStore.setDocuments(data);
    }

    if (error) {
      toast.error('Failed to get documents');
    }
  }, [documentStore]);

  useEffect(
    () => {
      // preload icons
      loadIcons(['ic:round-grid-view', 'ic:round-view-list']);

      // fill local storage before render
      // default will be grid !
      const item = localStorage.getItem(
        constants.general.localStorageViewTypeKey,
      ) as ViewType | null;

      if (!item) {
        localStorage.setItem(constants.general.localStorageViewTypeKey, 'grid' as ViewType);
      }

      setView(item);

      setInitialDocuments();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

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

          {/* <BasicTooltip content="Sort options" asChild>
            <Button variant="ghost" size="icon">
              <Icon icon="icon-park-outline:sort" className="text-xl" />
            </Button>
          </BasicTooltip> */}

          <BasicTooltip content="Open file" asChild>
            <Button variant="ghost" size="icon" onClick={() => bus.emit('open:file-modal')}>
              <Icon icon="ic:round-folder" className="text-xl" />
            </Button>
          </BasicTooltip>
        </div>
      </div>

      {view === 'list' ? (
        documentStore.documents.map(e => <ListViewItem item={e} key={e.id} />)
      ) : (
        <div className="grid grid-cols-3 lg:grid-cols-4 gap-7">
          {documentStore.documents.map(e => (
            <GridViewItem item={e} key={e.id} />
          ))}
        </div>
      )}
    </div>
  );
};
