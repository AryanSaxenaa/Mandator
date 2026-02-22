import { io as ioClient, Socket } from 'socket.io-client';

const RAILWAY_URL = 'https://mandator-production.up.railway.app';

function resolveSocketUrl(): string {
  let url = (import.meta.env.VITE_API_URL as string | undefined) ?? '';
  url = url.replace(/\/$/, '').trim();
  if (!url || url.includes('vercel.app') || url.includes('localhost:5173')) {
    return (import.meta.env.DEV as boolean) ? 'http://localhost:3001' : RAILWAY_URL;
  }
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
