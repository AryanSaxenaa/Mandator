import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';
import { Activity, Clock, ArrowUpRight } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { TechCard, Badge } from '../components/ui/TechCard';
import { useAgent, useJournal, usePipeline } from '../hooks/useData';
import { nodeTypes } from '../components/nodes';

const sparkData = Array.from({ length: 30 }, (_, i) => ({
  t: `${i}m`,
  v: 2 + Math.random() * 6,
}));

export default function AgentMonitor() {
  const { id } = useParams();
  const { data: agent, isLoading: agentLoading } = useAgent(id);
  const { data: pipeline } = usePipeline(agent?.pipelineId);
  const { data: journal = [] } = useJournal(agent?.pipelineId);

  if (agentLoading || !agent) {
    return (
      <div className="p-8 text-center font-mono" style={{ color: 'var(--text-dim)' }}>
        Loading agent...
      </div>
    );
  }

  const agentJournal = journal.filter((e) => e.pipelineId === agent.pipelineId);

  return (
    <div className="p-8 min-h-full" style={{ background: 'var(--bg-dark)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-rajdhani font-bold text-3xl uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
            {agent.name}
          </h1>
          <p className="font-mono text-xs mt-1" style={{ color: 'var(--text-dim)' }}>
            ID: {agent.id}
          </p>
        </div>
        <Badge color={agent.status === 'active' ? 'green' : 'gray'}>{agent.status}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <TechCard className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase" style={{ color: 'var(--text-dim)' }}>Status</p>
            <p className="text-2xl font-rajdhani font-bold uppercase" style={{ color: agent.status === 'active' ? '#10B981' : 'var(--text-main)' }}>
              {agent.status}
            </p>
          </div>
          <Activity size={20} style={{ color: 'var(--accent)' }} />
        </TechCard>
        <TechCard className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase" style={{ color: 'var(--text-dim)' }}>Last Run</p>
            <p className="text-lg font-mono" style={{ color: 'var(--text-main)' }}>
              {agent.lastRun ? new Date(agent.lastRun).toLocaleTimeString() : 'Never'}
            </p>
          </div>
          <Clock size={20} style={{ color: 'var(--accent)' }} />
        </TechCard>
        <TechCard className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase" style={{ color: 'var(--text-dim)' }}>Daily Spent</p>
            <p className="text-2xl font-rajdhani font-bold" style={{ color: 'var(--text-main)' }}>
              {agent.dailySpent || 0} ETH
            </p>
          </div>
          <ArrowUpRight size={20} className="text-red-400" />
        </TechCard>
      </div>

      {/* Spending sparkline */}
      <TechCard glow className="mb-6">
        <p className="text-xs font-mono uppercase mb-3" style={{ color: 'var(--text-dim)' }}>Spend Activity (30min)</p>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData}>
              <defs>
                <linearGradient id="agentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="t" hide />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-panel)',
                  border: '1px solid var(--border-tech)',
                  fontFamily: 'JetBrains Mono',
                  fontSize: 11,
                  color: 'var(--text-main)',
                }}
              />
              <Area type="monotone" dataKey="v" stroke="var(--accent)" fill="url(#agentGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </TechCard>

      {/* Pipeline (read-only) */}
      {pipeline && pipeline.nodes && pipeline.nodes.length > 0 && (
        <TechCard noPad className="mb-6">
          <div className="px-6 pt-4 pb-2" style={{ borderBottom: '1px solid var(--border-tech)' }}>
            <p className="text-xs font-mono uppercase" style={{ color: 'var(--text-dim)' }}>Pipeline: {pipeline.name}</p>
          </div>
          <div className="h-64">
            <ReactFlow
              nodes={pipeline.nodes}
              edges={pipeline.edges}
              nodeTypes={nodeTypes}
              fitView
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
              style={{ background: 'var(--bg-dark)' }}
            >
              <Background variant="dots" gap={20} size={1} color="var(--dot-color)" />
            </ReactFlow>
          </div>
        </TechCard>
      )}

      {/* Execution log / tx table */}
      <TechCard noPad>
        <div className="px-6 pt-4 pb-2 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-tech)' }}>
          <p className="text-xs font-mono uppercase" style={{ color: 'var(--text-dim)' }}>Execution Log</p>
          <Badge color="blue">{agentJournal.length}</Badge>
        </div>
        <div className="max-h-72 overflow-auto">
          {agentJournal.length === 0 ? (
            <div className="p-6 text-center text-sm font-mono" style={{ color: 'var(--text-dim)' }}>
              No executions yet
            </div>
          ) : (
            <table className="w-full text-xs font-mono">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-tech)' }}>
                  <th className="text-left px-4 py-2 uppercase" style={{ color: 'var(--text-dim)' }}>Time</th>
                  <th className="text-left px-4 py-2 uppercase" style={{ color: 'var(--text-dim)' }}>Result</th>
                  <th className="text-left px-4 py-2 uppercase" style={{ color: 'var(--text-dim)' }}>Amount</th>
                  <th className="text-left px-4 py-2 uppercase" style={{ color: 'var(--text-dim)' }}>TxID</th>
                </tr>
              </thead>
              <tbody>
                {agentJournal.map((entry) => (
                  <tr key={entry.id} style={{ borderBottom: '1px solid var(--border-tech)' }}>
                    <td className="px-4 py-2" style={{ color: 'var(--text-main)' }}>{new Date(entry.timestamp).toLocaleString()}</td>
                    <td className="px-4 py-2">
                      <Badge color={entry.result === 'PAY_EXECUTED' ? 'green' : 'accent'}>{entry.result}</Badge>
                    </td>
                    <td className="px-4 py-2" style={{ color: 'var(--text-main)' }}>{entry.amount ?? '-'}</td>
                    <td className="px-4 py-2" style={{ color: 'var(--text-dim)' }}>{entry.txid || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </TechCard>
    </div>
  );
}
