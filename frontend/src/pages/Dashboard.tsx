import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, Layers, Activity, Wallet, Plus, Clock, ArrowRight } from 'lucide-react';
import { useAgentStore } from '../store/agentStore';
import { usePipelineStore } from '../store/pipelineStore';
import { useWalletStore } from '../store/walletStore';
import { TechCard, AppButton } from '../components/ui/TechCard';
import * as api from '../lib/api';

interface TxEntry {
  id: string;
  agentId: string;
  nodeType: string;
  status: string;
  amount?: string;
  to?: string;
  txHash?: string;
  ts: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const agentStore = useAgentStore();
  const pipelineStore = usePipelineStore();
  const walletStore = useWalletStore();
  const [recentTxs, setRecentTxs] = useState<TxEntry[]>([]);

  useEffect(() => {
    agentStore.fetchAgents();
    pipelineStore.fetchPipelines();
    api.listTransactions(undefined, { limit: 20 }).then(r => setRecentTxs(r.entries || [])).catch(() => {});
  }, []);

  const activeAgents = agentStore.agents.filter(a => a.status === 'active');
  const totalPipelines = pipelineStore.pipelines.length;
  const totalAgents = agentStore.agents.length;
  const dailySpent = agentStore.agents.reduce((sum, a) => sum + (parseFloat(a.dailySpent || '0') || 0), 0);

  const stats = [
    { label: 'Active Agents', value: activeAgents.length, icon: Bot, color: 'var(--success)' },
    { label: '24h Spend', value: `${dailySpent.toFixed(4)} ETH`, icon: Activity, color: 'var(--accent)' },
    { label: 'Pipelines', value: totalPipelines, icon: Layers, color: 'var(--info)' },
    { label: 'Total Agents', value: totalAgents, icon: Wallet, color: 'var(--text-main)' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="font-rajdhani font-bold text-2xl uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
          Dashboard
        </h1>
        <div className="flex gap-2">
          <AppButton variant="secondary" icon={Plus} onClick={() => navigate('/canvas')}>New Pipeline</AppButton>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map(s => (
          <TechCard key={s.label}>
            <div className="flex items-center gap-3">
              <s.icon size={20} style={{ color: s.color }} />
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>{s.label}</p>
                <p className="font-rajdhani font-bold text-xl" style={{ color: 'var(--text-main)' }}>{s.value}</p>
              </div>
            </div>
          </TechCard>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Agents */}
        <TechCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-rajdhani font-bold text-sm uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
              Agents
            </h3>
            <span className="text-xs font-mono" style={{ color: 'var(--text-dim)' }}>{totalAgents} total</span>
          </div>
          {agentStore.agents.length === 0 ? (
            <p className="text-xs font-mono py-4 text-center" style={{ color: 'var(--text-dim)' }}>
              No agents yet. Create a pipeline and deploy.
            </p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {agentStore.agents.map(agent => (
                <Link
                  key={agent.id}
                  to={`/agent/${agent.id}`}
                  className="flex items-center gap-3 p-3 hover:opacity-80 transition-opacity"
                  style={{ border: '1px solid var(--border-tech)', background: 'var(--bg-dark)' }}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      background: agent.status === 'active' ? 'var(--success)' :
                                  agent.status === 'paused' ? 'var(--warning)' : 'var(--text-dim)',
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-rajdhani font-bold truncate" style={{ color: 'var(--text-main)' }}>
                      {agent.name}
                    </p>
                    <p className="text-[10px] font-mono" style={{ color: 'var(--text-dim)' }}>
                      {agent.status} · {agent.dailySpent || '0'} ETH today
                    </p>
                  </div>
                  <ArrowRight size={14} style={{ color: 'var(--text-dim)' }} />
                </Link>
              ))}
            </div>
          )}
        </TechCard>

        {/* Recent Transactions */}
        <TechCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-rajdhani font-bold text-sm uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
              Recent Transactions
            </h3>
            <span className="text-xs font-mono" style={{ color: 'var(--text-dim)' }}>{recentTxs.length}</span>
          </div>
          {recentTxs.length === 0 ? (
            <p className="text-xs font-mono py-4 text-center" style={{ color: 'var(--text-dim)' }}>
              No transactions yet.
            </p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {recentTxs.map(tx => (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 p-2 text-[10px] font-mono"
                  style={{ border: '1px solid var(--border-tech)', background: 'var(--bg-dark)' }}
                >
                  <Clock size={12} style={{ color: 'var(--text-dim)' }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <span style={{
                        color: tx.status === 'confirmed' ? 'var(--success)' :
                               tx.status === 'failed' ? 'var(--error)' :
                               'var(--text-main)',
                      }}>
                        {tx.status}
                      </span>
                      <span style={{ color: 'var(--text-dim)' }}>{tx.nodeType}</span>
                    </div>
                    {tx.amount && (
                      <span style={{ color: 'var(--text-main)' }}>{tx.amount} ETH</span>
                    )}
                  </div>
                  <span style={{ color: 'var(--text-dim)' }}>
                    {tx.ts || tx.timestamp ? new Date(tx.ts || tx.timestamp).toLocaleTimeString() : '--'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </TechCard>
      </div>

      {/* Pipelines List */}
      <TechCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-rajdhani font-bold text-sm uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
            Pipelines
          </h3>
          <AppButton variant="secondary" icon={Plus} onClick={() => navigate('/canvas')}>New</AppButton>
        </div>
        {pipelineStore.pipelines.length === 0 ? (
          <p className="text-xs font-mono py-4 text-center" style={{ color: 'var(--text-dim)' }}>
            No pipelines yet.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {pipelineStore.pipelines.map(p => (
              <Link
                key={p.id}
                to={`/canvas?id=${p.id}`}
                className="p-3 hover:opacity-80 transition-opacity"
                style={{ border: '1px solid var(--border-tech)', background: 'var(--bg-dark)' }}
              >
                <p className="text-sm font-rajdhani font-bold truncate" style={{ color: 'var(--text-main)' }}>
                  {typeof p.name === 'string' ? p.name : 'Untitled Pipeline'}
                </p>
                <p className="text-[10px] font-mono mt-1" style={{ color: 'var(--text-dim)' }}>
                  {(p.nodes || []).length} nodes · {(p.edges || []).length} edges
                </p>
              </Link>
            ))}
          </div>
        )}
      </TechCard>
    </div>
  );
}
