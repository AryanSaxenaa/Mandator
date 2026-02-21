import { memo, ReactNode } from 'react';
import { Handle, Position } from 'reactflow';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface HandleOutput {
  id: string;
  label: string;
  color?: string;
}

interface BaseNodeProps {
  data: Record<string, unknown>;
  icon: LucideIcon;
  label: string;
  color: string;
  handles?: {
    top?: boolean;
    bottom?: boolean;
    left?: boolean;
    right?: boolean;
    outputs?: HandleOutput[];
  };
  children?: ReactNode;
  executingIds?: Set<string>;
  completedIds?: Map<string, unknown>;
  errorIds?: Map<string, string>;
  blockedIds?: Set<string>;
  nodeId?: string;
}

export default memo(function BaseNode({ data, icon: Icon, label, color, handles = {}, children, nodeId }: BaseNodeProps) {
  const executing = data?._executing as boolean;
  const completed = data?._completed as boolean;
  const errored = data?._errored as boolean;
  const blocked = data?._blocked as boolean;

  let borderColor = color || 'var(--border-tech)';
  let glowShadow = `0 0 8px ${color}30`;

  if (executing) {
    borderColor = 'var(--success)';
    glowShadow = '0 0 15px rgba(16,185,129,0.4)';
  } else if (errored) {
    borderColor = 'var(--danger)';
    glowShadow = '0 0 15px rgba(239,68,68,0.4)';
  } else if (blocked) {
    borderColor = 'var(--warning)';
    glowShadow = '0 0 15px rgba(245,158,11,0.4)';
  } else if (completed) {
    borderColor = 'var(--success)';
    glowShadow = '0 0 10px rgba(16,185,129,0.3)';
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="relative min-w-[180px] font-mono text-xs"
      style={{
        background: 'var(--bg-panel)',
        border: `1px solid ${borderColor}`,
        boxShadow: glowShadow,
      }}
    >
      <div className="absolute -top-px -left-px w-2 h-2 border-t-2 border-l-2 pointer-events-none" style={{ borderColor: color || 'var(--accent)' }} />
      <div className="absolute -bottom-px -right-px w-2 h-2 border-b-2 border-r-2 pointer-events-none" style={{ borderColor: color || 'var(--accent)' }} />

      <div className="px-3 py-2 flex items-center gap-2" style={{ borderBottom: `1px solid ${color || 'var(--border-tech)'}30` }}>
        {Icon && (
          <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: `${color}20` }}>
            <Icon size={14} style={{ color }} />
          </div>
        )}
        <span className="font-bold uppercase tracking-wider truncate" style={{ color: 'var(--text-main)', fontSize: 11 }}>
          {label || (data?.label as string) || 'Node'}
        </span>
      </div>

      {children && <div className="px-3 py-2">{children}</div>}

      {handles.top && <Handle type="target" position={Position.Top} id="in" />}
      {handles.bottom && <Handle type="source" position={Position.Bottom} id="default" />}
      {handles.left && <Handle type="target" position={Position.Left} id="in" />}
      {handles.right && <Handle type="source" position={Position.Right} id="default" />}

      {handles.outputs && handles.outputs.map((out, i) => (
        <Handle
          key={out.id}
          type="source"
          position={Position.Bottom}
          id={out.id}
          style={{
            left: `${((i + 1) / (handles.outputs!.length + 1)) * 100}%`,
            background: out.color || 'var(--accent)',
          }}
        >
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] uppercase font-bold whitespace-nowrap" style={{ color: out.color || 'var(--accent)' }}>
            {out.label}
          </div>
        </Handle>
      ))}
    </motion.div>
  );
});
