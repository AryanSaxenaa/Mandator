import { memo } from 'react';
import { Handle } from 'reactflow';
import { Play } from 'lucide-react';
import { motion } from 'framer-motion';

export default memo(function StartNode({ data }) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative min-w-[140px] font-mono text-xs text-center"
      style={{
        background: 'var(--bg-panel)',
        border: '2px solid #10B981',
        boxShadow: '0 0 15px rgba(16,185,129,0.3)',
      }}
    >
      <div className="absolute -top-px -left-px w-2 h-2 border-t-2 border-l-2 pointer-events-none" style={{ borderColor: '#10B981' }} />
      <div className="absolute -bottom-px -right-px w-2 h-2 border-b-2 border-r-2 pointer-events-none" style={{ borderColor: '#10B981' }} />
      <div className="px-4 py-3 flex items-center justify-center gap-2">
        <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.2)' }}>
          <Play size={12} className="text-emerald-400" />
        </div>
        <span className="font-bold uppercase tracking-widest text-emerald-400">Start</span>
      </div>
      <Handle type="source" position="bottom" id="default" />
    </motion.div>
  );
});
