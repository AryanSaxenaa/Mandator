import { io as ioClient, Socket } from 'socket.io-client';

const URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const socket: Socket = ioClient({ autoConnect: false });

export function joinAgent(agentId: string) {
  socket.emit('join:agent', agentId);
}

export function leaveAgent(agentId: string) {
  socket.emit('leave:agent', agentId);
}
