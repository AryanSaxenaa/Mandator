# Vibe Log

## Session 1

**Prompt received:** "Build a full-stack web application called Mandator. It is a visual drag-and-drop pipeline builder
for autonomous spending agents. 
Follow the rules.
The Attached Files are for the reference of UI in dark and light mode where light mode is default.
Here is the complete specification:


STACK: React 18 + Vite, React Flow v11, Tailwind CSS v3 (dark theme, accent colour var),
Framer Motion, Zustand, TanStack Query, Recharts, Lucide React.
Backend: Node.js + Express, node-cron, axios, lowdb, dotenv, cors, socket.io.


ARCHITECTURE:
- /frontend/src/adapters/interface.js — defines the chain adapter interface with 4 functions:
  connectWallet(), getVaultBalance(address), sendTransaction(to, amount, memo), topUpVault(amount)
- /frontend/src/adapters/mock.js — mock adapter returning fake data (used during development)
- /frontend/src/adapters/bitcoin-midl.js — stub (to be filled with Midl RPC + Xverse SDK)
- /frontend/src/adapters/arbitrum.js — stub (to be filled with ethers.js + contract calls)
- /frontend/src/adapters/aya-multichain.js — stub (EVM fallback, Aya SDK ready hook)
- CHAIN_ADAPTER env var selects which adapter loads at runtime


PAGES (React Router v6):
1. /landing — dark hero, accent CTA, connect wallet button, animated CSS background grid
2. /dashboard — vault card, agent list, tx feed, quick stats, sidebar nav
3. /canvas — React Flow canvas, 3-column layout (node panel | canvas | config panel)
4. /agent/:id — live monitor, read-only pipeline, execution log, sparkline, tx table
5. /settings — wallet info, preferences, network toggle, danger zone


NODE TYPES (16 total, each is a React Flow custom node):
Entry/Exit: START, END
Triggers: TIME_TRIGGER, BALANCE_TRIGGER, WEBHOOK_TRIGGER, MANUAL_TRIGGER
Logic: SPEND_LIMIT_CHECK (outputs: PASS/BLOCK), DAILY_BUDGET_GATE (PASS/BLOCK),
       WHITELIST_CHECK (APPROVED/REJECTED), COOLDOWN_TIMER (READY/WAIT)
AI: AI_DECISION (outputs: YES/NO, calls Groq API with context + user prompt)
Actions: PAY, AUTO_TOPUP, ALERT, LOG, PAUSE_PIPELINE


BACKEND EXECUTOR (/backend/executor.js):
- Receives pipeline JSON (array of nodes + edges from React Flow)
- Builds runtime context: { vault_balance, daily_spent, last_tx_amount,
  last_tx_recipient, pipeline_id, agent_name, timestamp, trigger_type, trigger_payload }
- Walks node graph from START, evaluates each node type
- CONDITION nodes: evaluate rule against context, follow matching edge
- AI_DECISION: POST to Groq API, get YES/NO, follow matching edge
- PAY: call adapter.sendTransaction(), log txid to lowdb journal
- Emits socket.io events after each step: node:executing, node:complete, tx:confirmed, balance:update


WEBHOOK TRIGGER backend: Express route POST /webhook/:agentId
TIME TRIGGER: node-cron job polls pipelines every minute
BALANCE TRIGGER: TanStack Query polls adapter.getVaultBalance() every 60s


AI DECISION NODE config: { prompt: string (user-written), model: 'llama-3.1-8b-instant' }
Groq API call: POST https://api.groq.com/openai/v1/chat/completions
System message: 'You are a spending policy evaluator. Respond YES or NO only.'
Returns YES or NO → executor follows matching edge


STORAGE (lowdb, JSON files):
- pipelines.json: { id, name, nodes[], edges[], status, createdAt, updatedAt }
- journal.json: { id, pipelineId, timestamp, node, result, txid, amount, recipient }
- agents.json: { id, name, pipelineId, status, vaultAddress, lastRun, dailySpent }


STYLING: Tailwind dark theme. CSS variable --accent for hackathon colour swapping.
Default accent: #7C3AED (neutral purple). Each hackathon swaps to their brand colour.
Lucide React icons for all node types. Framer Motion for card/node entrance animations.


Generate: complete file tree, all page components, all 16 custom React Flow node components,
the backend executor, all Express routes, the Zustand store, TanStack Query hooks,
the socket.io setup, the Groq API integration, all adapter stubs, Tailwind config,
and a README.md with Vibe Log section. Use TypeScript where practical."

**What was done:**
- Scaffolded full project structure: `/backend` and `/frontend` directories
- Backend:
  - Created Express server with cors, socket.io, lowdb JSON storage
  - Built pipeline executor engine that walks node graphs from START, evaluates conditions, calls Groq API for AI decisions, logs payments to journal
  - Created full CRUD routes for pipelines, agents, journal
  - Added webhook trigger route (POST /webhook/:agentId)
  - Added node-cron scheduler that polls active pipelines every minute
  - Set up lowdb with pipelines.json, journal.json, agents.json
- Frontend:
  - Set up Vite + React 18 with Tailwind CSS v3, PostCSS, Google Fonts
  - Configured CSS variables for light mode (default, orange accent) and dark mode (purple accent) matching reference UI files
  - Created 4 chain adapter stubs (mock, bitcoin-midl, arbitrum, aya-multichain) plus adapter interface
  - Built Zustand store for app state (wallet, dark mode, vault balance, selected node)
  - Built TanStack Query hooks for all API endpoints + vault balance polling (60s)
  - Created socket.io client setup
  - Built 16 custom React Flow node components (START, END, 4 triggers, 4 logic gates, AI_DECISION, PAY, AUTO_TOPUP, ALERT, LOG, PAUSE_PIPELINE)
  - Built shared UI components (TechCard, AppButton, Badge) with tech/cyberpunk styling
  - Built 5 pages:
    1. Landing - animated hero with Connect Wallet CTA, CSS grid background
    2. Dashboard - stats cards, vault sparkline (Recharts), agent list, transaction feed
    3. Canvas - 3-column layout with drag-and-drop node library, React Flow canvas, node config panel
    4. Agent Monitor - live stats, sparkline, read-only pipeline view, execution log table
    5. Settings - wallet info, dark/light toggle, network selector, danger zone
  - Set up React Router v6 with app layout (sidebar + content)
  - Built Sidebar with nav, dark mode toggle, vault balance display
- Created README.md and VIBELOG.md
