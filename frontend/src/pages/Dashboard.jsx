import { motion } from 'framer-motion';
import { Activity, Zap, GitBranch, Box, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { TechCard, AppButton, Badge } from '../components/ui/TechCard';
import { useAgents, useJournal, usePipelines } from '../hooks/useData';
import { useAppStore } from '../store/appStore';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

const sparkData = Array.from({ length: 20 }, (_, i) => ({
  t: i,
  v: 5 + Math.random() * 8,
}));

export default function Dashboard() {
  const navigate = useNavigate();
  const { vaultBalance } = useAppStore();
  const { data: agents = [] } = useAgents();
  const { data: pipelines = [] } = usePipelines();
  const { data: journal = [] } = useJournal();

  const activeAgents = agents.filter((a) => a.status === 'active').length;
  const idleAgents = agents.length - activeAgents;

  const stats = [
    {
      label: 'Active Agents',
      val: String(activeAgents).padStart(2, '0'),
      sub: `${idleAgents} Idle`,
      icon: Activity,
      color: 'var(--accent)',
    },
    {
      label: '24h Spend',
      val: vaultBalance ? `${(vaultBalance.balance * 0.1).toFixed(1)} ETH` : '-- ETH',
      sub: '+0.4%',
      icon: Zap,
      color: '#3B82F6',
    },
    {
      label: 'Pipelines',
      val: String(pipelines.length).padStart(2, '0'),
      sub: 'All Healthy',
      icon: GitBranch,
      color: '#10B981',
    },
    {
      label: 'Block Height',
      val: '182934',
      sub: 'Synced',
      icon: Box,
      color: '#64748B',
    },
  ];

  return (
    <div className="p-8 min-h-full" style={{ background: 'var(--bg-dark)' }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-rajdhani font-bold text-3xl uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
            Command Center
          </h1>
          <p className="font-mono text-xs mt-1" style={{ color: 'var(--text-dim)' }}>
            System Status: Operational
          </p>
        </div>
        <AppButton onClick={() => navigate('/canvas')} icon={Plus}>
          New Pipeline
        </AppButton>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <TechCard key={i} className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: 'var(--text-dim)' }}>
                {s.label}
              </p>
              <p className="text-3xl font-rajdhani font-bold" style={{ color: s.color }}>
                {s.val}
              </p>
              <p className="text-xs font-mono mt-1" style={{ color: 'var(--text-dim)' }}>
                {s.sub}
              </p>
            </div>
            <div
              className="w-10 h-10 rounded flex items-center justify-center"
              style={{ background: `${s.color}20`, border: `1px solid ${s.color}40` }}
            >
              <s.icon size={18} style={{ color: s.color }} />
            </div>
          </TechCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vault sparkline */}
        <TechCard glow className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-mono uppercase" style={{ color: 'var(--text-dim)' }}>Vault Balance</p>
              <p className="text-2xl font-rajdhani font-bold" style={{ color: 'var(--text-main)' }}>
                {vaultBalance ? `${vaultBalance.balance} ETH` : '-- ETH'}
              </p>
            </div>
            <Badge color="green">Live</Badge>
          </div>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkData}>
                <defs>
                  <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-panel)',
                    border: '1px solid var(--border-tech)',
                    fontFamily: 'JetBrains Mono',
                    fontSize: 11,
                    color: 'var(--text-main)',
                  }}
                />
                <Area type="monotone" dataKey="v" stroke="var(--accent)" fill="url(#sparkGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </TechCard>

        {/* Agent list */}
        <TechCard noPad>
          <div className="px-6 pt-6 pb-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-tech)' }}>
            <p className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>Agents</p>
            <Badge color="accent">{agents.length}</Badge>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border-tech)' }}>
            {agents.length === 0 && (
              <div className="p-6 text-center text-sm font-mono" style={{ color: 'var(--text-dim)' }}>
                No agents yet
              </div>
            )}
            {agents.slice(0, 5).map((agent) => (
              <div
                key={agent.id}
                className="px-6 py-3 flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigate(`/agent/${agent.id}`)}
              >
                <div>
                  <p className="text-sm font-mono" style={{ color: 'var(--text-main)' }}>{agent.name}</p>
                  <p className="text-[10px] font-mono" style={{ color: 'var(--text-dim)' }}>
                    {agent.lastRun ? `Last: ${new Date(agent.lastRun).toLocaleTimeString()}` : 'Never run'}
                  </p>
                </div>
                <Badge color={agent.status === 'active' ? 'green' : 'gray'}>{agent.status}</Badge>
              </div>
            ))}
          </div>
        </TechCard>
      </div>

      {/* Transaction feed */}
      <TechCard noPad className="mt-6">
        <div className="px-6 pt-6 pb-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-tech)' }}>
          <p className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>Transaction Feed</p>
          <Badge color="blue">{journal.length} entries</Badge>
        </div>
        <div className="max-h-64 overflow-auto">
          {journal.length === 0 && (
            <div className="p-6 text-center text-sm font-mono" style={{ color: 'var(--text-dim)' }}>
              No transactions yet
            </div>
          )}
          {journal.slice(0, 10).map((entry) => (
            <div key={entry.id} className="px-6 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-tech)' }}>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: entry.result === 'PAY_EXECUTED' ? 'rgba(239,68,68,0.15)' : 'rgba(var(--accent-rgb),0.15)' }}>
                  {entry.result === 'PAY_EXECUTED' ? <ArrowUpRight size={12} className="text-red-400" /> : <ArrowDownRight size={12} style={{ color: 'var(--accent)' }} />}
                </div>
                <div>
                  <p className="text-xs font-mono" style={{ color: 'var(--text-main)' }}>{entry.result}</p>
                  <p className="text-[10px] font-mono" style={{ color: 'var(--text-dim)' }}>
                    {new Date(entry.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                {entry.amount !== null && (
                  <p className="text-xs font-mono font-bold" style={{ color: 'var(--text-main)' }}>{entry.amount} ETH</p>
                )}
                {entry.txid && (
                  <p className="text-[10px] font-mono" style={{ color: 'var(--text-dim)' }}>{entry.txid}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </TechCard>
    </div>
  );
}
