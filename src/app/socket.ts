'use client';

import { io } from 'socket.io-client';

// export const socket = io('ws://localhost:3001', { transports: ['websocket'] });
export const socket = io('ws://localhost:4000', { transports: ['websocket'] });
