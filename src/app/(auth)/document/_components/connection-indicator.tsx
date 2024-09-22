'use client';

import { docEditSocket } from '@/app/(auth)/document/[documentId]/_components/socket';
import { useSocketStore } from '@/app/(auth)/document/[documentId]/state';
import { BasicTooltip } from '@/components/app/basic-tooltip';
import { Icon } from '@iconify/react';

export const ConnectionIndicator = () => {
  const socketStatus = useSocketStore(state => state.status);

  switch (socketStatus) {
    case 'connected':
      return (
        <BasicTooltip content={<>Connection is successfull</>}>
          <Icon
            icon="fluent:plug-disconnected-48-regular"
            className="text-xl text-green-400 cursor-default"
          />
        </BasicTooltip>
      );
    case 'reconnecting':
      return (
        <BasicTooltip content={<>Attempting reconnection</>}>
          <Icon
            icon="fluent:plug-disconnected-48-regular"
            className="text-xl text-orange-400 cursor-default"
          />
        </BasicTooltip>
      );
    case 'disconnected':
      return (
        <BasicTooltip content={<>Disconnected, click to retry</>}>
          <Icon
            icon="fluent:plug-disconnected-48-regular"
            className="text-xl text-red-400 cursor-pointer"
            onClick={() => docEditSocket.connect()}
          />
        </BasicTooltip>
      );
    default:
      return null;
  }
};
