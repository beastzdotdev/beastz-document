'use client';

import { constants } from '@/lib/constants';
import { ManagerOptions, SocketOptions, io } from 'socket.io-client';

const config: Partial<ManagerOptions & SocketOptions> = {
  withCredentials: true,
  autoConnect: false,
  transports: ['websocket'],
  query: {
    platform: 'WEB',
  },
  auth(cb) {
    const filesStructureId = parseInt(window.location.pathname.split('/').pop() ?? '');

    if (typeof filesStructureId !== 'number') {
      throw new Error('Something went wrong');
    }

    cb({ filesStructureId });
  },

  reconnectionAttempts: 20,
  reconnection: true,
  multiplex: true,
};

export const docEditSocket = io(constants.socket.documentSocketUrl, config);
export const docEditSocketPublic = io(constants.socket.documentSocketUrl, {
  ...config,
  withCredentials: false,
  auth(cb) {
    const searchParams = new URLSearchParams(window.location.search);
    const sharedUniqueHash = searchParams.get('sharedUniqueHash');
    const filesStructureId = searchParams.get('fsId');

    if (typeof sharedUniqueHash !== 'string' || !sharedUniqueHash.length) {
      throw new Error('Something went wrong');
    }

    cb({ sharedUniqueHash, filesStructureId });
  },
});
