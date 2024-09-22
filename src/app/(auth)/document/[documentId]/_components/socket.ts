'use client';

import { io } from 'socket.io-client';
export const docEditSocket = io('ws://localhost:4000/document', {
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

    // cb({  });
    cb({ filesStructureId });
  },

  reconnectionAttempts: 3,
  // reconnectionAttempts: 15,
  reconnection: true,
  multiplex: true,
});
