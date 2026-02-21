import { io as ioClient, Socket } from 'socket.io-client';

function resolveSocketUrl(): string {
  let url = (import.meta.env.VITE_API_URL as string | undefined) ?? '';
  if (!url) return 'http://localhost:3001';
  url = url.replace(/\/$/, '');
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  return url;
}
const SOCKET_URL = resolveSocketUrl();

export const socket: Socket = ioClient(SOCKET_URL, { autoConnect: false });

export function joinAgent(agentId: string) {
  socket.emit('join:agent', agentId);
}

export function leaveAgent(agentId: string) {
  socket.emit('leave:agent', agentId);
}
