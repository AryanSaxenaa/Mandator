import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import { ArrowLeft, Pause, Play, Trash2, ExternalLink, RefreshCw } from 'lucide-react';
import { nodeTypes } from '../components/nodes';
import { useAgentStore } from '../store/agentStore';
import { usePipelineStore } from '../store/pipelineStore';
import { useExecutionStore } from '../store/executionStore';
import { useWalletStore } from '../store/walletStore';
import { useAgentSocket } from '../hooks/useAgentSocket';
import { TechCard, AppButton } from '../components/ui/TechCard';
import TransactionSignModal from '../components/TransactionSignModal';
import * as api from '../lib/api';

interface TxEntry {
  id: string;
  agentId: string;
  pipelineId: string;
  nodeId: string;
  nodeType: string;
  status: string;
  txHash?: string;
  amount?: string;
  to?: string;
  error?: string;
  ts: string;
}

export default function AgentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const agentStore = useAgentStore();
  const pipelineStore = usePipelineStore();
  const executionStore = useExecutionStore();
  const walletStore = useWalletStore();

  const [transactions, setTransactions] = useState<TxEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const logEndRef = useRef<HTMLDivElement>(null);

  useAgentSocket(id || null);

  const agent = agentStore.agents.find(a => a.id === id);
  const pipeline = pipelineStore.pipelines.find(p => p.id === agent?.pipelineId);

  const executingNodeIds = useExecutionStore(s => s.executingNodeIds);
  const completedNodeIds = useExecutionStore(s => s.completedNodeIds);
  const errorNodeIds = useExecutionStore(s => s.errorNodeIds);
  const blockedNodeIds = useExecutionStore(s => s.blockedNodeIds);
  const executionLog = useExecutionStore(s => s.executionLog);

  useEffect(() => {
    agentStore.fetchAgents();
    pipelineStore.fetchPipelines();
  }, []);

  useEffect(() => {
    if (id) {
      api.listTransactions(id, { limit: 50 }).then(r => setTransactions(r.entries || [])).catch(() => {});
      setLoading(false);
    }
  }, [id]);

  // Auto-scroll log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [executionLog]);

  // Refresh transactions when execution events arrive
  useEffect(() => {
    if (id && completedNodeIds.size > 0) {
      api.listTransactions(id, { limit: 50 }).then(r => setTransactions(r.entries || [])).catch(() => {});
    }
  }, [completedNodeIds.size]);

  const decoratedNodes = useMemo(() => {
    return (pipeline?.nodes || []).map((n: any) => ({
      ...n,
      data: {
        ...n.data,
        _executing: executingNodeIds.has(n.id),
        _completed: completedNodeIds.has(n.id),
        _errored: errorNodeIds.has(n.id),
        _blocked: blockedNodeIds.has(n.id),
      },
    }));
  }, [pipeline, executingNodeIds, completedNodeIds, errorNodeIds, blockedNodeIds]);

  const handleRun = async () => {
    if (!id) return;
    executionStore.resetExecution();
    await agentStore.runAgent(id);
  };

  const handleTogglePause = async () => {
    if (!id || !agent) return;
    if (agent.status === 'active') {
      await agentStore.pauseAgent(id);
    } else {
      await agentStore.deployAgent(id);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    await agentStore.deleteAgent(id);
    navigate('/dashboard');
  };

  const handleRefreshBalance = async () => {
    if (!id) return;
    try {
      const balance = await walletStore.refreshBalance();
      if (balance !== undefined) {
        await api.updateAgentBalance(id, balance);
      }
    } catch {}
  };

  if (!agent) {
    return (
      <div className="flex items-center justify-center h-full" style={{ color: 'var(--text-dim)' }}>
        <p className="font-mono text-sm">{loading ? 'Loading...' : 'Agent not found'}</p>
      </div>
    );
  }

  const statusColor = agent.status === 'active' ? 'var(--success)' : agent.status === 'paused' ? 'var(--warning)' : 'var(--text-dim)';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3" style={{ borderBottom: '1px solid var(--border-tech)', background: 'var(--bg-panel)' }}>
        <Link to="/dashboard" className="hover:opacity-80">
          <ArrowLeft size={18} style={{ color: 'var(--text-main)' }} />
        </Link>
        <div className="flex-1">
          <h2 className="font-rajdhani font-bold text-lg uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
            {agent.name}
          </h2>
          <div className="flex items-center gap-3 text-[10px] font-mono" style={{ color: 'var(--text-dim)' }}>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full" style={{ background: statusColor }} />
              {agent.status}
            </span>
            <span>ID: {agent.id?.slice(0, 8)}</span>
            {agent.lastRun && <span>Last run: {new Date(agent.lastRun).toLocaleString()}</span>}
          </div>
        </div>
        <AppButton variant="secondary" icon={RefreshCw} onClick={handleRefreshBalance}>Balance</AppButton>
        <AppButton variant="secondary" icon={Play} onClick={handleRun}>Run</AppButton>
        <AppButton
          variant="secondary"
          icon={agent.status === 'active' ? Pause : Play}
          onClick={handleTogglePause}
        >
          {agent.status === 'active' ? 'Pause' : 'Resume'}
        </AppButton>
        <AppButton variant="secondary" icon={Trash2} onClick={handleDelete}>Delete</AppButton>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Pipeline view */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1">
            <ReactFlow
              nodes={decoratedNodes}
              edges={pipeline?.edges || []}
              nodeTypes={nodeTypes}
              fitView
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
            >
              <Background color="var(--dot-color)" gap={20} size={1} />
              <Controls showInteractive={false} />
              <MiniMap
                style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-tech)' }}
                maskColor="rgba(0,0,0,0.2)"
              />
            </ReactFlow>
          </div>

          {/* Execution log */}
          {executionLog.length > 0 && (
            <div className="h-40 overflow-y-auto p-3 font-mono text-[11px]" style={{ borderTop: '1px solid var(--border-tech)', background: 'var(--bg-dark)' }}>
              {executionLog.map((entry, i) => {
                const color =
                  entry.event === 'error'   ? 'var(--danger)'   :
                  entry.event === 'blocked' ? 'var(--warning)'  :
                  entry.event === 'complete' || entry.event === 'tx_confirmed' ? 'var(--success)' :
                  'var(--text-main)';
                const label = entry.nodeName || entry.nodeType || entry.nodeId || '?';
                const detail =
                  entry.message  ? entry.message  :
                  entry.error    ? entry.error    :
                  entry.result   ? `→ ${entry.result}` :
                  entry.txHash   ? `tx ${entry.txHash.slice(0, 10)}…` :
                  entry.event;
                const ts = entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString() : '--:--:--';
                return (
                  <div key={i} className="flex gap-2 py-0.5">
                    <span style={{ color: 'var(--text-dim)', flexShrink: 0 }}>{ts}</span>
                    <span style={{ color, flexShrink: 0 }}>[{entry.event?.toUpperCase()}]</span>
                    <span style={{ color: 'var(--text-dim)', flexShrink: 0 }}>{label}</span>
                    <span style={{ color }}>{detail}</span>
                  </div>
                );
              })}
              <div ref={logEndRef} />
            </div>
          )}
        </div>

        {/* Right: Stats & Transactions */}
        <div className="w-80 shrink-0 overflow-y-auto p-4 space-y-4" style={{ borderLeft: '1px solid var(--border-tech)', background: 'var(--bg-panel)' }}>
          {/* Stats */}
          <TechCard>
            <h4 className="font-rajdhani font-bold text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--text-main)' }}>Agent Stats</h4>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-dim)' }}>Vault</span>
                <span style={{ color: 'var(--text-main)' }}>{agent.vaultAddress?.slice(0, 6)}...{agent.vaultAddress?.slice(-4)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-dim)' }}>Balance</span>
                <span style={{ color: 'var(--text-main)' }}>{agent.lastKnownBalance || '--'} ETH</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-dim)' }}>Daily Spent</span>
                <span style={{ color: 'var(--text-main)' }}>{agent.dailySpent || '0'} ETH</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-dim)' }}>Total Spent</span>
                <span style={{ color: 'var(--text-main)' }}>{agent.totalSpent || '0'} ETH</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-dim)' }}>Pipeline</span>
                <Link to={`/canvas?id=${agent.pipelineId}`} className="hover:underline" style={{ color: 'var(--accent)' }}>
                  {pipeline?.name || agent.pipelineId?.slice(0, 8)}
                </Link>
              </div>
            </div>
          </TechCard>

          {/* Transactions */}
          <TechCard>
            <h4 className="font-rajdhani font-bold text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--text-main)' }}>
              Transactions ({transactions.length})
            </h4>
            {transactions.length === 0 ? (
              <p className="text-xs font-mono" style={{ color: 'var(--text-dim)' }}>No transactions yet</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {transactions.map(tx => (
                  <div key={tx.id} className="p-2 text-[10px] font-mono" style={{ border: '1px solid var(--border-tech)', background: 'var(--bg-dark)' }}>
                    <div className="flex justify-between mb-1">
                      <span style={{
                        color: tx.status === 'confirmed' ? 'var(--success)' :
                               tx.status === 'failed' ? 'var(--error)' :
                               tx.status === 'rejected' ? 'var(--warning)' :
                               'var(--text-main)',
                      }}>
                        {tx.status.toUpperCase()}
                      </span>
                      <span style={{ color: 'var(--text-dim)' }}>{tx.nodeType}</span>
                    </div>
                    {tx.amount && (
                      <div style={{ color: 'var(--text-main)' }}>
                        {tx.amount} ETH → {tx.to?.slice(0, 8)}...
                      </div>
                    )}
                    {tx.txHash && (
                      <a
                        href={`https://etherscan.io/tx/${tx.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 mt-1 hover:underline"
                        style={{ color: 'var(--accent)' }}
                      >
                        {tx.txHash.slice(0, 10)}... <ExternalLink size={10} />
                      </a>
                    )}
                    {tx.error && (
                      <div className="mt-1" style={{ color: 'var(--error)' }}>{tx.error}</div>
                    )}
                    <div className="mt-1" style={{ color: 'var(--text-dim)' }}>
                      {tx.ts || tx.timestamp ? new Date(tx.ts || tx.timestamp).toLocaleString() : '--'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TechCard>
        </div>
      </div>

      <TransactionSignModal />
    </div>
  );
}
