import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { initDb } from './db.js';
import { createAgentsRouter } from './routes/agents.js';
import pipelinesRouter from './routes/pipelines.js';
import transactionsRouter from './routes/transactions.js';
import { createWebhookRouter } from './webhookRouter.js';
import scheduler from './scheduler.js';

const PORT = process.env.PORT || 3001;
const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');

// Allow the configured origin plus any *.vercel.app preview URL
function isAllowedOrigin(origin) {
  if (!origin) return true; // non-browser (curl, Postman, server-to-server)
  if (origin === FRONTEND_URL) return true;
  if (/^https:\/\/[a-z0-9-]+-[a-z0-9]+-[a-z0-9]+\.vercel\.app$/.test(origin)) return true;
  if (/^https:\/\/mandator[a-z0-9-]*\.vercel\.app$/.test(origin)) return true;
  return false;
}

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: isAllowedOrigin },
});

// Log every request so Railway shows CORS failures and route hits
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} | origin: ${req.headers.origin || '-'}`);
  next();
});

app.use(cors({
  origin: (origin, cb) => {
    if (isAllowedOrigin(origin)) {
      cb(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin} (FRONTEND_URL=${FRONTEND_URL})`);
      cb(new Error(`CORS: origin not allowed: ${origin}`));
    }
  },
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  credentials: true,
}));
app.use(express.json());

io.on('connection', (socket) => {
  socket.on('join:agent', (agentId) => socket.join(agentId));
  socket.on('leave:agent', (agentId) => socket.leave(agentId));

  socket.on('tx:signed', ({ journalId, txHash, explorerUrl }) => {
    io.emit(`tx:signed:${journalId}`, { txHash, explorerUrl });
  });

  socket.on('tx:rejected', ({ journalId, reason }) => {
    io.emit(`tx:rejected:${journalId}`, { reason });
  });
});

app.use('/api/agents', createAgentsRouter(io, scheduler));
app.use('/api/pipelines', pipelinesRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/webhook', createWebhookRouter(io));

async function start() {
  await initDb();
  await scheduler.initScheduler(io);
  httpServer.listen(PORT, () => {
    console.log(`Mandator backend running on ${PORT}`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
