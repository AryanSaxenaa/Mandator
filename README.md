# Mandator

Visual Pipeline Builder for Autonomous Spending Agents.

**SECURE - MODULAR - CHAIN-AGNOSTIC**

## Overview

Mandator is a full-stack web application that lets you visually build, configure, and execute pipelines for autonomous spending agents. Drag-and-drop nodes to create spending policies, AI decision gates, triggers, and payment actions. All transactions are signed via your real EVM wallet (MetaMask, Coinbase Wallet, Rabby, Brave).

## Stack

### Frontend
- React 18 + Vite 5 + TypeScript
- React Flow v11 (drag-and-drop pipeline canvas)
- Tailwind CSS v3 (light/dark theme with CSS variable accent)
- Framer Motion (animations)
- Zustand 4 (state management)
- socket.io-client (real-time execution events)
- Recharts (sparklines and charts)
- Lucide React (icons)

### Backend
- Node.js + Express (ESM)
- socket.io (real-time events)
- lowdb 7 (JSON file storage)
- node-cron (scheduled pipeline execution)
- axios (Groq API calls)
- dotenv, cors, uuid

## Architecture

### EVM Wallet Adapter
Located in `/frontend/src/adapters/`. Uses the EIP-1193 `window.ethereum` provider directly:

- Real `eth_requestAccounts` for wallet connection
- Real `eth_getBalance` for balance queries
- Real `eth_sendTransaction` for payments (with user confirmation popup)
- Account/chain/disconnect event listeners
- Supports: Ethereum Mainnet, Sepolia, Arbitrum One, Arbitrum Sepolia

### Node Types (16)
| Category | Types |
|----------|-------|
| Entry/Exit | START, END |
| Triggers | TIME_TRIGGER, BALANCE_TRIGGER, WEBHOOK_TRIGGER, MANUAL_TRIGGER |
| Logic | SPEND_LIMIT_CHECK, DAILY_BUDGET_GATE, WHITELIST_CHECK, COOLDOWN_TIMER |
| AI | AI_DECISION (Groq API, APPROVE/REJECT) |
| Actions | PAY, AUTO_TOPUP, ALERT, LOG, PAUSE_PIPELINE |

### Transaction Signing Flow
1. Pipeline executor reaches a PAY or AUTO_TOPUP node
2. Server emits `tx:sign_required` to the connected client via socket.io
3. Frontend shows TransactionSignModal with tx details
4. User clicks Approve → wallet popup (MetaMask etc.) → signs real transaction
5. Client emits `tx:signed` with txHash back to server
6. Server records confirmation in journal and continues pipeline
7. If user rejects, `tx:rejected` is emitted and pipeline records rejection

### Pages
1. `/` - Landing page with Connect Wallet CTA
2. `/dashboard` - Agent list, pipeline grid, tx feed, stats cards
3. `/canvas` - React Flow canvas with 3-column layout (node library | canvas | config panel)
4. `/agent/:id` - Live agent monitor with read-only pipeline, execution log, transaction table
5. `/settings` - Wallet info, theme toggle, network display

### Backend Executor
The executor (`/backend/executor.js`) loads pipeline JSON, builds runtime context (agent, balance, daily spend), and walks the node graph from START following edges. Each node type has a real handler. AI_DECISION calls the Groq API. PAY nodes initiate the tx:sign_required flow. All events stream to the frontend via socket.io.

## Getting Started

### 1. Backend
```bash
cd backend
npm install
# Edit .env and add your GROQ_API_KEY
npm run dev
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

### 3. Test Webhook
```bash
curl -X POST http://localhost:3001/api/webhook/<agentId> \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: <secret>" \
  -d '{"event": "test"}'
```

## Environment Variables

### Backend (`/backend/.env`)
- `PORT` - Server port (default: 3001)
- `GROQ_API_KEY` - Your Groq API key for AI Decision nodes
- `FRONTEND_URL` - Frontend origin for CORS (default: http://localhost:5173)

### Frontend
Uses Vite's dev proxy (`/api` → localhost:3001, `/socket.io` → ws://localhost:3001).

## Theme
Default accent is `#F97316` (orange, light mode) / `#9d4edd` (purple, dark mode). Change the CSS variables in `index.css` to match your brand.

## Vibe Log
See [VIBELOG.md](./VIBELOG.md) for development history.
