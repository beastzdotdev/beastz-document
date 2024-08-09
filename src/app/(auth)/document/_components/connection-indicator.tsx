'use client';

import { BasicTooltip } from '@/components/app/basic-tooltip';
import { bus } from '@/lib/bus';
import { sleep } from '@/lib/utils';
import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';

export const ConnectionIndicator = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // native listener in different file !
    bus.on('socket:connected', async () => {
      await sleep(1000);
      setShow(true);
    });
  }, []);

  if (!show) {
    return null;
  }

  return (
    <BasicTooltip content={<>Connection is successfull</>}>
      <Icon icon="fluent:plug-disconnected-48-regular" className="text-xl text-green-400" />
    </BasicTooltip>
  );
};
