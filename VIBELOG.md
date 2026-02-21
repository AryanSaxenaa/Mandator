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

## Session 2

**Prompt received:** "You are fixing and completing the Mandator codebase. The current state has UI scaffolding but zero real functionality. Your job is to make everything actually work. Do not create mocks. Do not create stubs. Implement real, working code for every feature.

════════════════════════════════════════════════════════════
WALLET LAYER — REAL, SWAPPABLE, NO CHAIN-SPECIFIC SDK
════════════════════════════════════════════════════════════

Delete all existing adapter files. Replace with this architecture:

/frontend/src/adapters/interface.ts
  Export this interface — everything else depends only on this:

  export interface WalletAdapter {
    connect(): Promise<{ address: string; balance: string; chainId: string; networkName: string }>;
    disconnect(): void;
    getBalance(address: string): Promise<string>; // human-readable e.g. "0.042 ETH"
    getBalanceRaw(address: string): Promise<bigint>;
    isConnected(): boolean;
    getAddress(): string | null;
    onAccountChanged(cb: (address: string | null) => void): void;
    onChainChanged(cb: (chainId: string) => void): void;
    onDisconnect(cb: () => void): void;
  }

  export interface TransactionAdapter {
    sendPayment(params: {
      to: string;
      amountWei: bigint;
      memo?: string;
    }): Promise<{ txHash: string; explorerUrl: string }>;
    estimateGas(params: { to: string; amountWei: bigint }): Promise<bigint>;
    getExplorerUrl(txHash: string): string;
  }

  export interface MandatorAdapter extends WalletAdapter, TransactionAdapter {}

/frontend/src/adapters/evm-injected.ts
  This is the ONLY adapter you implement. It uses window.ethereum (EIP-1193).
  Works with MetaMask, Coinbase Wallet, Rabby, Brave Wallet — any injected EVM wallet.
  This is the swap point. Later, one file gets swapped for a different wallet SDK.

  Implement every method for real:

  connect():
    - Check if window.ethereum exists, throw WalletNotFoundError if not
    - Call window.ethereum.request({ method: 'eth_requestAccounts' })
    - Get balance: window.ethereum.request({ method: 'eth_getBalance', params: [accounts[0], 'latest'] })
    - Get chainId: window.ethereum.request({ method: 'eth_chainId' })
    - Convert balance hex to bigint, format with formatEther equivalent (divide by 1e18, 4 decimal places)
    - Map chainId to networkName: '0x1'→'Ethereum', '0xaa36a7'→'Sepolia', '0x66eee'→'Arbitrum Sepolia', '0xa4b1'→'Arbitrum One', default→'Unknown Network'
    - Store address and chainId in module-level variables
    - Return { address, balance, chainId, networkName }

  disconnect():
    - Clear stored address and chainId
    - This is client-side only — EIP-1193 has no disconnect method

  getBalance(address):
    - eth_getBalance call, format result to 4 decimal places + symbol

  getBalanceRaw(address):
    - eth_getBalance, return as bigint

  isConnected(): return stored address !== null
  getAddress(): return stored address

  onAccountChanged(cb): window.ethereum.on('accountsChanged', accounts => cb(accounts[0] || null))
  onChainChanged(cb): window.ethereum.on('chainChanged', cb)
  onDisconnect(cb): window.ethereum.on('disconnect', cb)

  sendPayment({ to, amountWei, memo }):
    - Validate: to is valid ethereum address (0x + 40 hex chars), amountWei > 0
    - Build tx: { from: storedAddress, to, value: '0x' + amountWei.toString(16), data: memo ? '0x' + Buffer.from(memo).toString('hex') : '0x' }
    - Call window.ethereum.request({ method: 'eth_sendTransaction', params: [tx] })
    - Returns txHash string
    - explorerUrl: based on stored chainId, construct correct block explorer URL
    - Supported explorers: Ethereum→etherscan.io, Sepolia→sepolia.etherscan.io, Arbitrum Sepolia→sepolia.arbiscan.io, Arbitrum One→arbiscan.io, default→etherscan.io
    - Return { txHash, explorerUrl: `${baseUrl}/tx/${txHash}` }

  estimateGas({ to, amountWei }):
    - eth_estimateGas call
    - Return as bigint

  getExplorerUrl(txHash):
    - Return based on stored chainId

  Export singleton: export const adapter = new EVMInjectedAdapter()
  Export factory: export function getAdapter(): MandatorAdapter { return adapter }

/frontend/src/adapters/index.ts
  import { adapter } from './evm-injected'
  export { adapter }
  export type { MandatorAdapter, WalletAdapter, TransactionAdapter } from './interface'

  ← This is the only import other files use. When swapping wallet SDK later, only this file changes.

/frontend/src/adapters/errors.ts
  export class WalletNotFoundError extends Error { constructor() { super('No wallet extension detected. Please install MetaMask or another EVM wallet.') } }
  export class UserRejectedError extends Error { constructor() { super('Transaction rejected by user.') } }
  export class InsufficientFundsError extends Error { constructor() { super('Insufficient funds for this transaction.') } }
  export class WalletNotConnectedError extends Error { constructor() { super('Wallet not connected.') } }

════════════════════════════════════════════════════════════
ZUSTAND STORES — REAL STATE, REAL API CALLS
════════════════════════════════════════════════════════════

/frontend/src/store/walletStore.ts
  State: { address: string|null, balance: string, balanceRaw: bigint, chainId: string|null, networkName: string, isConnecting: boolean, isConnected: boolean, error: string|null }

  Actions — all real implementations:
  connect():
    - Set isConnecting=true, error=null
    - Call adapter.connect()
    - On success: set all fields, set isConnected=true
    - Register adapter.onAccountChanged: if null, run disconnect(); else update address, refetch balance
    - Register adapter.onChainChanged: update chainId and networkName, refetch balance
    - On error: set error=err.message (show friendly message for WalletNotFoundError)
    - Set isConnecting=false

  disconnect():
    - Call adapter.disconnect()
    - Reset all state to defaults
    - Navigate to /landing

  refreshBalance():
    - If not connected: return
    - Call adapter.getBalance(address)
    - Update balance and balanceRaw in state

/frontend/src/store/agentStore.ts
  State: { agents: Agent[], isLoading, error }
  Agent type: { id, name, pipelineId, status: 'active'|'paused'|'error'|'idle', vaultAddress, lastRun: string|null, dailySpent: number, totalSpent: number, createdAt, webhookUrl: string }

  fetchAgents(): GET /api/agents → set agents
  createAgent(data): POST /api/agents → append to agents, return new agent
  updateAgent(id, patch): PATCH /api/agents/:id → update in array
  deleteAgent(id): DELETE /api/agents/:id → remove from array
  deployAgent(id): POST /api/agents/:id/deploy → update status='active'
  pauseAgent(id): POST /api/agents/:id/pause → update status='paused'
  runAgent(id): POST /api/agents/:id/run → triggers manual execution

/frontend/src/store/pipelineStore.ts
  State: { pipelines: Pipeline[], activePipelineId: string|null, isDirty: boolean }
  Pipeline type: { id, name, nodes: Node[], edges: Edge[], createdAt, updatedAt }

  fetchPipelines(): GET /api/pipelines
  savePipeline(id, nodes, edges): PUT /api/pipelines/:id with { nodes, edges, updatedAt: now }
  createPipeline(name): POST /api/pipelines → returns new pipeline with empty nodes/edges
  deletePipeline(id): DELETE /api/pipelines/:id
  setActivePipeline(id): set activePipelineId
  markDirty(): set isDirty=true
  markClean(): set isDirty=false

/frontend/src/store/executionStore.ts
  State: {
    executingNodeIds: Set<string>,   // nodes currently highlighted
    completedNodeIds: Map<string, { result: string, edge: string }>,
    errorNodeIds: Map<string, string>,
    blockedNodeIds: Set<string>,
    executionLog: LogEntry[],        // ordered list of events
    pendingSignature: PendingTx|null // when tx:sign_required fires
  }
  LogEntry: { id, timestamp, nodeId, nodeName, nodeType, event, result, edge, txHash, explorerUrl, error, message }
  PendingTx: { journalId, nodeId, to, amountWei: bigint, memo?: string }

  Actions:
  handleNodeExecuting(nodeId, nodeName, nodeType): add to executingNodeIds, append log entry
  handleNodeComplete(nodeId, result, edge): remove from executingNodeIds, add to completedNodeIds, append log
  handleNodeBlocked(nodeId, reason): remove from executingNodeIds, add to blockedNodeIds, append log
  handleNodeError(nodeId, error): move to errorNodeIds, append log
  handleTxSignRequired(data: PendingTx): set pendingSignature=data
  handleTxConfirmed(data): clear pendingSignature, append log with txHash
  handleTxFailed(data): clear pendingSignature, append log with error
  resetExecution(): clear all execution state (call before each new run)
  clearNode(nodeId): remove from all maps/sets

════════════════════════════════════════════════════════════
BACKEND — FULLY IMPLEMENTED
════════════════════════════════════════════════════════════

/backend/db.ts
  Use lowdb 3.x (ESM). Create typed Low instances:

  interface DB {
    pipelines: Pipeline[]
    agents: Agent[]
    journal: JournalEntry[]
    notifications: Notification[]
  }

  const db = new Low(new JSONFile('./data/db.json'), {
    pipelines: [], agents: [], journal: [], notifications: []
  })

  Export helper functions:
  - getPipeline(id): return db.data.pipelines.find(p => p.id === id) or throw NotFoundError
  - getAgent(id): return db.data.agents.find(a => a.id === id) or throw NotFoundError
  - getAgentByPipelineId(pipelineId): find agent with matching pipelineId
  - saveJournalEntry(entry): db.data.journal.push(entry), await db.write()
  - saveNotification(notif): db.data.notifications.push(notif), await db.write()
  - updateAgent(id, patch): Object.assign(agent, patch), await db.write()
  - getDailySpent(agentId): sum journal entries where agentId matches, nodeType='PAY', timestamp > 24h ago, status='confirmed'

/backend/groq.ts
  async function callGroq(systemPrompt: string, userPrompt: string): Promise<string>
  - POST https://api.groq.com/openai/v1/chat/completions
  - Headers: { Authorization: 'Bearer ' + process.env.GROQ_API_KEY, 'Content-Type': 'application/json' }
  - Body: { model: 'llama-3.1-8b-instant', messages: [{role:'system', content: systemPrompt}, {role:'user', content: userPrompt}], max_tokens: 10, temperature: 0 }
  - On 429: wait 2000ms, retry once
  - On failure: throw with status code and message
  - Return: response.data.choices[0].message.content.trim()

/backend/executor.ts — THE CORE ENGINE, fully implemented

  export async function executePipeline(
    pipelineId: string,
    triggerType: string,
    triggerPayload: object = {},
    io: Server
  ): Promise<void>

  Implementation:

  1. Load pipeline from db. If not found: throw.
  2. Load agent from db by pipelineId. If not found: throw.
  3. Update agent.lastRun = new Date().toISOString(), agent.status = 'active'. await db.write().
  4. Build context:
     const context = {
       agentId: agent.id,
       agentName: agent.name,
       pipelineId,
       vaultAddress: agent.vaultAddress,
       dailySpent: await getDailySpent(agent.id),
       timestamp: new Date().toISOString(),
       triggerType,
       triggerPayload
     }
  5. Find START node: pipeline.nodes.find(n => n.type === 'START'). If none: throw 'Pipeline has no START node'.
  6. Build adjacency map:
     const edgeMap = new Map<string, Edge[]>()
     pipeline.edges.forEach(edge => {
       if (!edgeMap.has(edge.source)) edgeMap.set(edge.source, [])
       edgeMap.get(edge.source)!.push(edge)
     })
  7. Node walker:
     let currentNode = startNode
     let safetyCounter = 0
     while (currentNode && safetyCounter < 50) {
       safetyCounter++
       const result = await evaluateNode(currentNode, context, io)
       await saveJournalEntry({ id: uuid(), agentId: agent.id, pipelineId, nodeId: currentNode.id, nodeName: currentNode.data.label, nodeType: currentNode.type, ...result, timestamp: new Date().toISOString() })
       if (result.halt) break
       const edges = edgeMap.get(currentNode.id) || []
       const nextEdge = edges.find(e => e.sourceHandle === result.edge) || edges[0]
       if (!nextEdge) break
       currentNode = pipeline.nodes.find(n => n.id === nextEdge.target)!
     }
  8. On completion: update agent.status = 'idle', await db.write()
  9. Wrap everything in try/catch: on error, update agent.status = 'error', emit 'node:error', save journal entry with error

  async function evaluateNode(node, context, io): Promise<{ edge: string, result: string, halt?: boolean, txHash?: string, amount?: bigint, recipient?: string, error?: string }>

  For each node type — ALL REAL:

  START:
    emit io.to(context.agentId).emit('node:executing', { nodeId: node.id, nodeName: node.data.label, nodeType: node.type })
    await delay(200)
    emit 'node:complete' with { nodeId, result: 'started', edge: 'default' }
    return { edge: 'default', result: 'started' }

  END:
    emit 'node:executing', await delay(200), emit 'node:complete'
    return { edge: 'default', result: 'completed', halt: true }

  TIME_TRIGGER / WEBHOOK_TRIGGER / MANUAL_TRIGGER:
    emit executing + complete
    return { edge: 'default', result: 'triggered' }

  BALANCE_TRIGGER:
    emit executing
    NOTE: Backend cannot call window.ethereum. Use agent.vaultAddress as a label only.
    Use context.dailySpent and any stored balance from db as proxy.
    Actually: read agent.lastKnownBalance from db (frontend updates this via API after wallet connection)
    const balance = agent.lastKnownBalance || 0
    const threshold = node.data.config.thresholdWei || 0
    const direction = node.data.config.direction || 'above'
    const passes = direction === 'above' ? balance >= threshold : balance <= threshold
    if (!passes) { emit 'node:blocked'; return { edge: 'BLOCKED', result: 'balance_condition_not_met', halt: true } }
    emit 'node:complete'
    return { edge: 'default', result: 'balance_condition_met' }

  SPEND_LIMIT_CHECK:
    emit executing
    const limit = BigInt(node.data.config.maxAmountWei || '0')
    const nextPayNode = findNextPayNode(node.id, pipeline)  // look ahead in graph
    const payAmount = nextPayNode ? BigInt(nextPayNode.data.config.amountWei || '0') : 0n
    const passes = limit === 0n || payAmount <= limit
    const edge = passes ? 'PASS' : 'BLOCK'
    emit passes ? 'node:complete' : 'node:blocked'
    return { edge, result: passes ? 'within_limit' : 'exceeds_limit' }

  DAILY_BUDGET_GATE:
    emit executing
    const dailyLimit = BigInt(node.data.config.dailyLimitWei || '0')
    const spent = BigInt(context.dailySpent || 0)
    const nextPayAmount = BigInt(findNextPayNode(node.id, pipeline)?.data?.config?.amountWei || '0')
    const wouldExceed = dailyLimit > 0n && (spent + nextPayAmount) > dailyLimit
    const edge = wouldExceed ? 'BLOCK' : 'PASS'
    emit accordingly
    return { edge, result: wouldExceed ? `would_exceed_daily_limit` : 'within_daily_budget' }

  WHITELIST_CHECK:
    emit executing
    const whitelist: string[] = node.data.config.recipients || []
    const nextPayNode = findNextPayNode(node.id, pipeline)
    const recipient = nextPayNode?.data?.config?.recipientAddress || ''
    const normalizedWhitelist = whitelist.map(a => a.toLowerCase().trim())
    const approved = whitelist.length === 0 || normalizedWhitelist.includes(recipient.toLowerCase().trim())
    const edge = approved ? 'APPROVED' : 'REJECTED'
    emit accordingly
    return { edge, result: approved ? 'address_approved' : 'address_rejected', recipient }

  COOLDOWN_TIMER:
    emit executing
    const cooldownMs = (node.data.config.cooldownMinutes || 60) * 60 * 1000
    const lastRun = agent.lastRun ? new Date(agent.lastRun).getTime() : 0
    const elapsed = Date.now() - lastRun
    const ready = elapsed >= cooldownMs
    const edge = ready ? 'READY' : 'WAIT'
    if (!ready) {
      const remainingMin = Math.ceil((cooldownMs - elapsed) / 60000)
      emit 'node:blocked' with message `Cooldown active. ${remainingMin} minutes remaining.`
      return { edge: 'WAIT', result: `cooldown_active_${remainingMin}min_remaining`, halt: true }
    }
    emit 'node:complete'
    return { edge: 'READY', result: 'cooldown_elapsed' }

  AI_DECISION:
    emit executing
    const systemPrompt = 'You are a spending policy evaluator. Your only job is to evaluate whether a transaction should proceed. Respond with exactly one word: YES or NO. Nothing else.'
    const userPrompt = `Pipeline context: ${JSON.stringify(context, null, 2)}\n\nUser policy question: ${node.data.config.prompt}\n\nRespond YES or NO only.`
    let decision: string
    try {
      const raw = await callGroq(systemPrompt, userPrompt)
      decision = raw.toUpperCase().includes('YES') ? 'YES' : 'NO'
    } catch (err) {
      decision = 'NO'
      await saveJournalEntry({ ...baseEntry, result: 'ai_error', error: err.message })
    }
    emit 'node:complete' with { result: decision, edge: decision }
    return { edge: decision, result: `ai_decided_${decision.toLowerCase()}` }

  PAY:
    emit 'node:executing'
    const journalId = uuid()
    const to = node.data.config.recipientAddress
    const amountWei = BigInt(node.data.config.amountWei || '0')
    const memo = node.data.config.memo || ''

    Validate:
    - to must be valid ethereum address format: /^0x[0-9a-fA-F]{40}$/.test(to)
    - amountWei must be > 0
    - If invalid: emit 'node:error', return halt=true

    Write PENDING journal entry: { id: journalId, status: 'pending_signature', nodeType: 'PAY', to, amountWei: amountWei.toString(), memo }

    Emit to client: io.to(context.agentId).emit('tx:sign_required', { journalId, nodeId: node.id, to, amountWei: amountWei.toString(), memo })

    Wait for client response (Promise with 60s timeout):
    const txResult = await new Promise<{txHash: string, explorerUrl: string} | {error: string}>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Transaction signature timeout after 60 seconds')), 60000)
      io.once(`tx:signed:${journalId}`, (data) => { clearTimeout(timeout); resolve(data) })
      io.once(`tx:rejected:${journalId}`, (data) => { clearTimeout(timeout); resolve({ error: data.reason || 'User rejected transaction' }) })
    })

    NOTE: Frontend socket handler must emit 'tx:signed:{journalId}' or 'tx:rejected:{journalId}'

    If error in txResult:
      Update journal entry: status='rejected', error
      Emit 'tx:failed' with { journalId, nodeId, reason }
      Update agent.dailySpent unchanged
      return { edge: 'default', result: 'payment_rejected', halt: true }

    On success:
      Update journal entry: status='confirmed', txHash, explorerUrl
      Update agent.dailySpent += Number(amountWei), agent.totalSpent += Number(amountWei)
      await db.write()
      Emit 'tx:confirmed' with { journalId, nodeId, txHash, explorerUrl, amount: amountWei.toString(), to }
      Emit 'balance:update' signal to client (client should refresh balance from wallet)
      return { edge: 'default', result: 'payment_confirmed', txHash, amount: amountWei, recipient: to }

  AUTO_TOPUP:
    Same pattern as PAY — emit tx:sign_required, wait for signature
    journalEntry nodeType = 'AUTO_TOPUP'
    to = agent.vaultAddress (self top-up from external source to vault)
    return same structure

  ALERT:
    emit executing
    const template = node.data.config.message || 'Alert triggered'
    const resolved = template
      .replace('{agentName}', context.agentName)
      .replace('{amount}', context.lastTxAmount || '0')
      .replace('{address}', context.lastTxRecipient || '')
      .replace('{timestamp}', context.timestamp)
      .replace('{dailySpent}', context.dailySpent?.toString() || '0')
    const severity = node.data.config.severity || 'info'
    const notif = { id: uuid(), agentId: context.agentId, message: resolved, severity, read: false, createdAt: new Date().toISOString() }
    await saveNotification(notif)
    io.to(context.agentId).emit('notification:new', notif)
    emit 'node:complete'
    return { edge: 'default', result: 'alert_sent' }

  LOG:
    emit executing
    const template = node.data.config.message || 'Log entry'
    const resolved = template.replace(/{(\w+)}/g, (_, key) => context[key]?.toString() || '')
    — save journal entry with nodeType='LOG', result=resolved
    emit 'node:complete'
    return { edge: 'default', result: 'logged' }

  PAUSE_PIPELINE:
    emit executing
    const message = node.data.config.message || 'Pipeline paused by policy'
    await updateAgent(context.agentId, { status: 'paused' })
    await saveNotification({ id: uuid(), agentId: context.agentId, message, severity: 'warning', read: false, createdAt: new Date().toISOString() })
    io.to(context.agentId).emit('agent:paused', { agentId: context.agentId, message })
    emit 'node:complete'
    return { edge: 'default', result: 'pipeline_paused', halt: true }

  Helper function — findNextPayNode(sourceNodeId, pipeline):
    Do a BFS/DFS from sourceNodeId through edges until you find a node with type PAY or exhaust the graph
    Return the PAY node or null

/backend/scheduler.ts
  Map<string, cron.ScheduledTask> to track active jobs

  async function initScheduler(io: Server):
    Load all agents from db where status === 'active'
    For each agent: load its pipeline, find TIME_TRIGGER node, parse config, register job

  function registerCronJob(agentId, pipelineId, cronExpression, io):
    Cancel existing job if any
    Register: cron.schedule(cronExpression, () => executePipeline(pipelineId, 'cron', {}, io))
    Store in map

  function cancelCronJob(agentId): destroy job, delete from map

  function parseTriggerToCron(config: TimeTriggerConfig): string
    - config.intervalType: 'minutes'|'hours'|'days'
    - config.intervalValue: number
    - 'minutes' → `*/${value} * * * *`
    - 'hours'   → `0 */${value} * * *`
    - 'days'    → `0 0 */${value} * *`
    - config.specificTime: 'HH:MM' → parse and set cron accordingly
    - Validate: minutes 1-59, hours 1-23, days 1-30
    - Default if invalid: '0 * * * *' (every hour)

/backend/webhookRouter.ts
  Router.post('/:agentId', async (req, res) => {
    Load agent by id. If not found: 404.
    If status !== 'active': return 409 { error: 'Agent is not active' }
    If agent.webhookSecret && req.headers['x-webhook-secret'] !== agent.webhookSecret: return 401
    res.status(200).json({ received: true, agentId, timestamp: new Date().toISOString() })
    setImmediate(() => executePipeline(agent.pipelineId, 'webhook', req.body, io))
  })
  This router needs access to io — pass it in as a closure: export function createWebhookRouter(io) { return router }

/backend/routes/agents.ts — all routes fully implemented:

  GET /api/agents
    Load all agents, for each: compute dailySpent from journal, attach last 5 journal entries
    Return sorted by createdAt desc

  POST /api/agents
    Body: { name, pipelineId, vaultAddress }
    Validate all required
    Verify pipelineId exists in db
    id = uuid()
    webhookUrl = `/webhook/${id}`
    webhookSecret = uuid() (auto-generated)
    status = 'idle'
    Insert into db.agents, await db.write()
    Return 201 with new agent

  GET /api/agents/:id
    Return agent + last 20 journal entries for this agent

  PATCH /api/agents/:id
    Allow patching: name, vaultAddress, status
    Don't allow patching id, pipelineId directly
    await db.write(), return updated agent

  DELETE /api/agents/:id
    cancelCronJob(id)
    Remove from db.agents, remove related journal entries
    await db.write(), return 204

  POST /api/agents/:id/deploy
    Set status='active', lastRun=null
    Register cron job if pipeline has TIME_TRIGGER
    Return updated agent

  POST /api/agents/:id/pause
    Set status='paused'
    cancelCronJob(id)
    Return updated agent

  POST /api/agents/:id/run
    If status === 'paused': return 409 'Agent is paused'
    Set status='active'
    Call executePipeline(agent.pipelineId, 'manual', {}, io) without await
    Return 202 { message: 'Execution started' }

  POST /api/agents/:id/balance — called by frontend to store last-known balance
    Body: { balanceWei: string }
    Update agent.lastKnownBalance = balanceWei in db
    Return 200

/backend/routes/pipelines.ts — all routes:
  GET /api/pipelines — list all, sorted by updatedAt desc
  POST /api/pipelines — create { name, nodes:[], edges:[] }, id=uuid(), timestamps now, return 201
  GET /api/pipelines/:id — return pipeline or 404
  PUT /api/pipelines/:id — replace nodes and edges entirely, set updatedAt=now, return updated
  DELETE /api/pipelines/:id — check no active agents depend on it (return 409 if so), delete, 204

/backend/routes/transactions.ts
  GET /api/transactions
    Query: agentId? (required), limit=50, offset=0, nodeType?
    Filter journal by agentId, optional nodeType
    Sort by timestamp desc
    Return { entries: JournalEntry[], total: number, limit, offset }

  GET /api/notifications
    Query: agentId?, unread=false
    Return filtered notifications

  PATCH /api/notifications/:id/read
    Set notification.read=true, await db.write()
    Return updated notification

/backend/server.ts
  Setup:
  - Express app
  - http.createServer(app) → httpServer
  - new Server(httpServer, { cors: { origin: process.env.FRONTEND_URL || 'http://localhost:5173' } })
  - app.use(cors({ origin: process.env.FRONTEND_URL }))
  - app.use(express.json())

  Socket.io:
  io.on('connection', (socket) => {
    socket.on('join:agent', (agentId) => socket.join(agentId))
    socket.on('leave:agent', (agentId) => socket.leave(agentId))
    socket.on('tx:signed', ({ journalId, txHash, explorerUrl }) => {
      io.emit(`tx:signed:${journalId}`, { txHash, explorerUrl })
    })
    socket.on('tx:rejected', ({ journalId, reason }) => {
      io.emit(`tx:rejected:${journalId}`, { reason })
    })
  })

  Mount routes:
  app.use('/api/agents', createAgentsRouter(io, scheduler))
  app.use('/api/pipelines', pipelinesRouter)
  app.use('/api/transactions', transactionsRouter)
  app.use('/webhook', createWebhookRouter(io))

  Start:
  await db.read()
  await initScheduler(io)
  httpServer.listen(PORT, () => console.log(`Mandator backend running on ${PORT}`))

════════════════════════════════════════════════════════════
FRONTEND WIRING — REAL DATA, REAL SOCKET EVENTS
════════════════════════════════════════════════════════════

/frontend/src/lib/socket.ts
  import { io } from 'socket.io-client'
  export const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001', { autoConnect: false })
  export function joinAgent(agentId: string) { socket.emit('join:agent', agentId) }
  export function leaveAgent(agentId: string) { socket.emit('leave:agent', agentId) }

/frontend/src/lib/api.ts
  Base URL: import.meta.env.VITE_API_URL || 'http://localhost:3001'
  Export typed fetch functions for every endpoint listed above.
  All functions: async, throw on non-2xx (parse error body), return typed data.
  Include: createPipeline, updatePipeline, getPipeline, listPipelines, deletePipeline,
           createAgent, listAgents, getAgent, updateAgent, deleteAgent,
           deployAgent, pauseAgent, runAgent, updateAgentBalance,
           listTransactions, listNotifications, markNotificationRead

/frontend/src/hooks/useAgentSocket.ts
  Hook: useAgentSocket(agentId: string | null)
  - On mount: if agentId, socket.connect(), joinAgent(agentId)
  - Listen for all execution events, dispatch to executionStore:
    'node:executing' → handleNodeExecuting
    'node:complete'  → handleNodeComplete
    'node:blocked'   → handleNodeBlocked
    'node:error'     → handleNodeError
    'tx:sign_required' → handleTxSignRequired — ALSO immediately call the signing flow (see below)
    'tx:confirmed'   → handleTxConfirmed
    'tx:failed'      → handleTxFailed
    'agent:paused'   → trigger agentStore.updateAgent
    'notification:new' → append to local notification state
  - On unmount: leaveAgent(agentId), relevant event listeners off
  - Return { executionLog, executingNodeIds, pendingSignature, completedNodeIds, errorNodeIds }

TRANSACTION SIGNING FLOW (critical — this is how PAY actually works):
When 'tx:sign_required' fires, the frontend must:
1. Show a modal: "Agent requests transaction — To: {to}, Amount: {formattedAmount}, Memo: {memo} — [Approve] [Reject]"
2. If user clicks Approve:
   a. Call adapter.sendPayment({ to, amountWei: BigInt(amountWei), memo })
   b. On success: socket.emit('tx:signed', { journalId, txHash, explorerUrl })
   c. On error (user rejected in wallet, insufficient funds): socket.emit('tx:rejected', { journalId, reason: err.message })
3. If user clicks Reject in modal: socket.emit('tx:rejected', { journalId, reason: 'User rejected in UI' })
4. Also call api.updateAgentBalance(agentId, newBalance) after tx confirmed to sync balance to backend

Implement this as a component: /frontend/src/components/TransactionSignModal.tsx
- Reads pendingSignature from executionStore
- Renders as an overlay modal when pendingSignature !== null
- Handles the full approve/reject flow above
- Shows loading state while wallet popup is open
- Shows formatted ETH amount (convert from wei: amountWei / 1e18, show 6 decimal places)

/frontend/src/pages/Canvas.tsx — fully wired:
  - Load activePipeline from pipelineStore (fetch from API on mount)
  - React Flow nodes and edges come from pipeline.nodes and pipeline.edges
  - On every change to nodes/edges: pipelineStore.markDirty()
  - Save button: call pipelineStore.savePipeline(id, nodes, edges), markClean()
  - Auto-save: debounced 2000ms after any change
  - Deploy button: 
    1. Save pipeline
    2. If no agent linked: show CreateAgentModal (name + vault address inputs)
    3. Call agentStore.createAgent if needed
    4. Call agentStore.deployAgent(agentId)
    5. Navigate to /agent/:agentId
  - Run button: call agentStore.runAgent(agentId)
  - Node config right panel: when a node is selected, show config form for that node type (see node configs below)
  - Dirty indicator: show unsaved dot next to pipeline name when isDirty

/frontend/src/pages/AgentDetail.tsx — fully wired:
  - Fetch agent from API on mount: GET /api/agents/:id
  - Connect socket and join agent room via useAgentSocket(agentId)
  - Fetch transactions: GET /api/transactions?agentId=:id&limit=20
  - Pipeline View: render React Flow in read-only mode (nodesDraggable=false, nodesConnectable=false, elementsSelectable=false)
  - Real-time node highlighting: executingNodeIds drives a 'node-executing' CSS class, completedNodeIds drives 'node-complete', errorNodeIds drives 'node-error'
  - Execution Log: render executionLog entries in order, auto-scroll to bottom, timestamp + icon + message per entry
  - Vault Balance sparkline: poll GET /api/transactions?agentId&nodeType=PAY every 30s, derive balance over time from journal
  - Policy Status: for each LOGIC node in pipeline, show current status based on latest journal entry
  - Transaction table: list confirmed PAY entries with txHash as clickable link to explorerUrl
  - Controls: Pause button → agentStore.pauseAgent, Resume → deployAgent, Delete → deleteAgent + navigate to /dashboard

NODE CONFIG FORMS — every node type needs a real config form in the right panel:

  START: No config. Show "Entry point of pipeline. Every pipeline starts here."
  END: Optional label field.
  TIME_TRIGGER: intervalType select (minutes/hours/days), intervalValue number input, specificTime time input (optional). Show generated cron expression preview.
  BALANCE_TRIGGER: direction select (above/below), threshold input (ETH, convert to wei on save), helper text showing current balance.
  WEBHOOK_TRIGGER: Show auto-generated webhook URL (read-only). Show generated secret (read-only). Copy buttons for both.
  MANUAL_TRIGGER: buttonLabel text input, requireConfirmation toggle.
  SPEND_LIMIT_CHECK: maxAmount input (ETH, store as wei). Show formatted limit.
  DAILY_BUDGET_GATE: dailyLimit input (ETH, store as wei). Show today's spend vs limit.
  WHITELIST_CHECK: textarea of addresses (one per line). Validate each is valid ethereum address on blur. Show count.
  COOLDOWN_TIMER: cooldownMinutes number input. Show time since last run.
  AI_DECISION: prompt textarea (multi-line), model display (read-only: llama-3.1-8b-instant), test button that calls Groq with dummy context and shows response.
  PAY: recipientAddress input (validate format on blur), amount input (ETH, convert to wei), memo text input.
  AUTO_TOPUP: amount input (ETH), threshold input (trigger when balance drops below this).
  ALERT: message textarea with variable hints ({agentName} {amount} {address} {timestamp}), severity select.
  LOG: message textarea with variable hints.
  PAUSE_PIPELINE: message textarea explaining why pipeline paused.

  All config forms: onChange saves to node.data.config immediately (updates React Flow node data), triggers markDirty.

════════════════════════════════════════════════════════════
ENVIRONMENT
════════════════════════════════════════════════════════════

/backend/.env:
  PORT=3001
  FRONTEND_URL=http://localhost:5173
  GROQ_API_KEY=           ← user must fill this
  NODE_ENV=development

/frontend/.env:
  VITE_API_URL=http://localhost:3001
  VITE_APP_NAME=Mandator

════════════════════════════════════════════════════════════
WHAT NOT TO DO
════════════════════════════════════════════════════════════

- Do NOT use setTimeout to simulate async operations
- Do NOT return hardcoded/mock data from any API route
- Do NOT use Math.random() to fake transaction hashes
- Do NOT skip error handling — every async call has try/catch
- Do NOT use localStorage for pipeline or agent data (only backend db.json)
- Do NOT import window.ethereum anywhere except evm-injected.ts
- Do NOT make the PAY node "just log something" — it must go through the full sign_required flow
- Do NOT generate fake txHash strings — they come from the wallet only

════════════════════════════════════════════════════════════
DELIVERABLE
════════════════════════════════════════════════════════════

Generate every file completely. No "// TODO" comments. No "implement this later".
If a feature needs a UI component that doesn't exist yet, create it.
Include package.json for both frontend and backend with exact dependency versions.
Include a concise README.md with: setup instructions, how to get Groq API key, how to run both servers, how to test the webhook trigger with curl."

