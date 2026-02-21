import { motion } from 'framer-motion';

export function TechCard({ children, className = '', noPad = false, glow = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative ${noPad ? '' : 'p-6'} ${className}`}
      style={{
        border: '1px solid var(--border-tech)',
        background: 'var(--bg-panel-transparent)',
        backdropFilter: 'blur(4px)',
        boxShadow: glow ? '0 0 20px rgba(var(--accent-rgb), 0.15)' : undefined,
      }}
    >
      <div className="absolute -top-px -left-px w-2.5 h-2.5 border-t-2 border-l-2 pointer-events-none" style={{ borderColor: 'var(--accent)' }} />
      <div className="absolute -bottom-px -right-px w-2.5 h-2.5 border-b-2 border-r-2 pointer-events-none" style={{ borderColor: 'var(--accent)' }} />
      {children}
    </motion.div>
  );
}

export function AppButton({ children, variant = 'primary', className = '', icon: Icon, onClick, disabled = false }) {
  const base = 'relative font-rajdhani font-bold uppercase tracking-wider px-6 py-2 inline-flex items-center justify-center gap-2 text-sm cursor-pointer transition-all duration-200';
  const clip = { clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' };

  const variants = {
    primary: 'text-white',
    secondary: 'text-text-main',
    danger: 'text-red-200',
  };

  const bgStyles = {
    primary: { background: 'var(--accent)', border: '1px solid rgba(255,255,255,0.1)' },
    secondary: { background: 'var(--bg-panel)', border: '1px solid rgba(var(--accent-rgb), 0.5)' },
    danger: { background: 'rgba(127,29,29,0.4)', border: '1px solid rgba(239,68,68,0.5)' },
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      style={{ ...clip, ...bgStyles[variant] }}
      onClick={onClick}
      disabled={disabled}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}

export function Badge({ children, color = 'accent' }) {
  const colorMap = {
    accent: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
    purple: 'bg-purple-900/50 text-purple-200 border border-purple-500/30',
    green: 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/30',
    blue: 'bg-blue-900/30 text-blue-400 border border-blue-500/30',
    red: 'bg-red-900/30 text-red-400 border border-red-500/30',
    gray: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
  };

  return (
    <span className={`px-2 py-0.5 text-[10px] font-mono rounded-sm uppercase ${colorMap[color] || colorMap.accent}`}>
      {children}
    </span>
  );
}
