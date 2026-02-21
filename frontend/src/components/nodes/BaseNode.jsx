import { memo } from 'react';
import { Handle } from 'reactflow';
import { motion } from 'framer-motion';

export default memo(function BaseNode({ data, icon: Icon, label, color, handles = {}, children }) {
  const executing = data?._executing;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="relative min-w-[180px] font-mono text-xs"
      style={{
        background: 'var(--bg-panel)',
        border: `1px solid ${executing ? 'var(--success)' : color || 'var(--border-tech)'}`,
        boxShadow: executing ? `0 0 15px rgba(16,185,129,0.4)` : `0 0 8px ${color}30`,
      }}
    >
      {/* Corner accents */}
      <div className="absolute -top-px -left-px w-2 h-2 border-t-2 border-l-2 pointer-events-none" style={{ borderColor: color || 'var(--accent)' }} />
      <div className="absolute -bottom-px -right-px w-2 h-2 border-b-2 border-r-2 pointer-events-none" style={{ borderColor: color || 'var(--accent)' }} />

      {/* Header */}
      <div
        className="px-3 py-2 flex items-center gap-2"
        style={{ borderBottom: `1px solid ${color || 'var(--border-tech)'}30` }}
      >
        {Icon && (
          <div
            className="w-6 h-6 rounded flex items-center justify-center"
            style={{ background: `${color}20` }}
          >
            <Icon size={14} style={{ color }} />
          </div>
        )}
        <span className="font-bold uppercase tracking-wider truncate" style={{ color: 'var(--text-main)', fontSize: 11 }}>
          {label || data?.label || 'Node'}
        </span>
      </div>

      {/* Body */}
      {children && <div className="px-3 py-2">{children}</div>}

      {/* Handles */}
      {handles.top && <Handle type="target" position="top" id="in" />}
      {handles.bottom && <Handle type="source" position="bottom" id="default" />}
      {handles.left && <Handle type="target" position="left" id="in" />}
      {handles.right && <Handle type="source" position="right" id="default" />}

      {/* Source handles with labels for condition nodes (PASS/BLOCK etc.) */}
      {handles.outputs && handles.outputs.map((out, i) => (
        <Handle
          key={out.id}
          type="source"
          position="bottom"
          id={out.id}
          style={{
            left: `${((i + 1) / (handles.outputs.length + 1)) * 100}%`,
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
