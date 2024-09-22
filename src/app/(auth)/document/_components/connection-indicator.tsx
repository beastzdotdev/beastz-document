'use client';

import { useSocketStore } from '@/app/(auth)/document/[documentId]/state';
import { BasicTooltip } from '@/components/app/basic-tooltip';
import { Icon } from '@iconify/react';

export const ConnectionIndicator = () => {
  const socketStatus = useSocketStore(state => state.status);

  if (socketStatus === 'reconnecting') {
    return (
      <BasicTooltip content={<>Attempting reconnection</>}>
        <Icon icon="fluent:plug-disconnected-48-regular" className="text-xl text-orange-400" />
      </BasicTooltip>
    );
  }

  if (socketStatus === 'connected') {
    return (
      <BasicTooltip content={<>Connection is successfull</>}>
        <Icon icon="fluent:plug-disconnected-48-regular" className="text-xl text-green-400" />
      </BasicTooltip>
    );
  }

  return null;
};
