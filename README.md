# Mandator

Visual Pipeline Builder for Autonomous Spending Agents.

**SECURE - MODULAR - CHAIN-AGNOSTIC**

## Overview

Mandator is a full-stack web application that lets you visually build, configure, and execute pipelines for autonomous spending agents. Drag-and-drop nodes to create spending policies, AI decision gates, triggers, and payment actions.

## Stack

### Frontend
- React 18 + Vite
- React Flow v11 (drag-and-drop pipeline canvas)
- Tailwind CSS v3 (light/dark theme with CSS variable accent)
- Framer Motion (animations)
- Zustand (state management)
- TanStack Query (server state)
- Recharts (sparklines and charts)
- Lucide React (icons)

### Backend
- Node.js + Express
- socket.io (real-time events)
- lowdb (JSON file storage)
- node-cron (scheduled pipeline execution)
- axios (Groq API calls)
- dotenv, cors

## Architecture

### Chain Adapters
Located in `/frontend/src/adapters/`. The `VITE_CHAIN_ADAPTER` env var selects which adapter loads at runtime:

- `mock` - Mock adapter with fake data (default, for development)
- `bitcoin-midl` - Stub for Midl RPC + Xverse SDK
- `arbitrum` - Stub for ethers.js + contract calls
- `aya-multichain` - Stub for EVM fallback / Aya SDK

Each adapter implements 4 functions: `connectWallet()`, `getVaultBalance(address)`, `sendTransaction(to, amount, memo)`, `topUpVault(amount)`.

### Node Types (16)
| Category | Types |
|----------|-------|
| Entry/Exit | START, END |
| Triggers | TIME_TRIGGER, BALANCE_TRIGGER, WEBHOOK_TRIGGER, MANUAL_TRIGGER |
| Logic | SPEND_LIMIT_CHECK, DAILY_BUDGET_GATE, WHITELIST_CHECK, COOLDOWN_TIMER |
| AI | AI_DECISION (Groq API, YES/NO) |
| Actions | PAY, AUTO_TOPUP, ALERT, LOG, PAUSE_PIPELINE |

### Pages
1. `/landing` - Hero page with Connect Wallet CTA
2. `/dashboard` - Vault card, agent list, tx feed, stats
3. `/canvas` - React Flow canvas with 3-column layout (node panel | canvas | config panel)
4. `/agent/:id` - Live agent monitor with read-only pipeline, execution log, sparkline
5. `/settings` - Wallet info, preferences, network toggle, danger zone

### Backend Executor
The executor (`/backend/executor.js`) receives pipeline JSON, builds runtime context, and walks the node graph from START. AI_DECISION nodes call the Groq API. PAY nodes log to the journal.

## Getting Started

### 1. Backend
```bash
cd backend
npm install
cp .env .env.local  # Edit your GROQ_API_KEY
npm run dev
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Environment Variables

### Backend (`/backend/.env`)
- `PORT` - Server port (default: 3001)
- `GROQ_API_KEY` - Your Groq API key for AI Decision nodes
- `CHAIN_ADAPTER` - Adapter name (mock, bitcoin-midl, arbitrum, aya-multichain)

### Frontend (`/frontend/.env`)
- `VITE_CHAIN_ADAPTER` - Adapter name (default: mock)
- `VITE_API_URL` - Backend URL (default: http://localhost:3001)

## Hackathon Accent Swapping
Default accent is `#F97316` (orange, light mode) / `#9d4edd` (purple, dark mode). Change the CSS variables in `index.css` to match your hackathon brand.

## Vibe Log
See [VIBELOG.md](./VIBELOG.md) for development history.
