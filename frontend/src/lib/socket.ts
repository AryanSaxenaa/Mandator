import { io as ioClient, Socket } from 'socket.io-client';

const SOCKET_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || 'http://localhost:3001';

export const socket: Socket = ioClient(SOCKET_URL, { autoConnect: false });

export function joinAgent(agentId: string) {
  socket.emit('join:agent', agentId);
}

export function leaveAgent(agentId: string) {
  socket.emit('leave:agent', agentId);
}
