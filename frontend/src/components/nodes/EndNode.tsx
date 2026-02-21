import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Square } from 'lucide-react';
import { motion } from 'framer-motion';

export default memo(function EndNode({ data }: { data: Record<string, unknown> }) {
  const executing = data?._executing as boolean;
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative min-w-[140px] font-mono text-xs text-center"
      style={{
        background: 'var(--bg-panel)',
        border: `2px solid ${executing ? 'var(--success)' : '#EF4444'}`,
        boxShadow: executing ? '0 0 20px rgba(16,185,129,0.5)' : '0 0 15px rgba(239,68,68,0.3)',
      }}
    >
      <div className="absolute -top-px -left-px w-2 h-2 border-t-2 border-l-2 pointer-events-none" style={{ borderColor: '#EF4444' }} />
      <div className="absolute -bottom-px -right-px w-2 h-2 border-b-2 border-r-2 pointer-events-none" style={{ borderColor: '#EF4444' }} />
      <div className="px-4 py-3 flex items-center justify-center gap-2">
        <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.2)' }}>
          <Square size={12} className="text-red-400" />
        </div>
        <span className="font-bold uppercase tracking-widest text-red-400">End</span>
      </div>
      <Handle type="target" position={Position.Top} id="in" />
    </motion.div>
  );
});
