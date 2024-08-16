'use client';

import { io } from 'socket.io-client';

export const docEditSocket = io('ws://localhost:4000/document', {
  withCredentials: true,
  autoConnect: false,
  transports: ['websocket'],
  query: {
    platform: 'WEB',
  },
  reconnectionAttempts: 15,
  reconnection: true,
  multiplex: true,
});
