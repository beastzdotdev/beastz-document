'use client';

import { io } from 'socket.io-client';

export const docEditSocket = io('ws://localhost:4000/doc-edit', {
  withCredentials: true,
  autoConnect: false,
  extraHeaders: {
    platform: 'WEB',
  },
});
