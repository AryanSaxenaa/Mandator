import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { initDB } from './db.js';
import { createRoutes } from './routes.js';
import { startCronJobs } from './cron.js';

const PORT = process.env.PORT || 3001;

async function main() {
  await initDB();

  const app = express();
  app.use(cors({ origin: '*' }));
  app.use(express.json());

  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: '*' } });

  io.on('connection', (socket) => {
    console.log(`[socket] Client connected: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`[socket] Client disconnected: ${socket.id}`);
    });
  });

  app.use('/api', createRoutes(io));

  app.get('/health', (req, res) => res.json({ status: 'ok' }));

  startCronJobs(io);

  server.listen(PORT, () => {
    console.log(`[server] Mandator backend running on http://localhost:${PORT}`);
  });
}

main().catch(console.error);
