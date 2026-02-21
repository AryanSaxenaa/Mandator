import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import { AppButton } from '../components/ui/TechCard';

export default function Landing({ onConnect }) {
  return (
    <div
      className="h-screen w-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: 'var(--bg-dark)' }}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(var(--grid-color, rgba(249,115,22,0.05)) 1px, transparent 1px), linear-gradient(90deg, var(--grid-color, rgba(249,115,22,0.05)) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Decorative spinning circle top-left */}
      <div className="absolute top-20 left-20 w-32 h-32 rounded-full flex items-center justify-center" style={{ border: '1px solid rgba(var(--accent-rgb), 0.2)' }}>
        <div
          className="w-24 h-24 rounded-full"
          style={{ borderTop: '2px solid rgba(var(--accent-rgb), 0.5)', animation: 'spin 8s linear infinite' }}
        />
      </div>

      {/* Decorative circle bottom-right */}
      <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full flex items-center justify-center" style={{ border: '1px solid rgba(var(--accent-rgb), 0.1)' }}>
        <div
          className="w-40 h-40 rounded-full"
          style={{ borderBottom: '2px solid rgba(var(--accent-rgb), 0.3)', borderLeft: '2px solid rgba(var(--accent-rgb), 0.3)' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center max-w-2xl px-6"
      >
        {/* Logo icon */}
        <div className="flex justify-center mb-6">
          <div
            className="w-16 h-16 flex items-center justify-center relative"
            style={{ border: '2px solid var(--accent)', boxShadow: '0 0 10px rgba(var(--accent-rgb), 0.3)' }}
          >
            <div className="absolute inset-0" style={{ border: '1px solid var(--accent)', filter: 'blur(2px)' }} />
            <Bot size={28} style={{ color: 'var(--accent)' }} />
          </div>
        </div>

        <h1
          className="font-rajdhani font-bold text-6xl uppercase tracking-[0.1em] mb-2"
          style={{ color: 'var(--text-main)', textShadow: '0 0 8px var(--accent-glow)' }}
        >
          MANDATOR
        </h1>

        <div
          className="h-1 w-24 mx-auto mb-6"
          style={{ background: 'linear-gradient(to right, transparent, var(--accent), transparent)' }}
        />

        <p className="text-lg mb-10 font-light leading-relaxed" style={{ color: 'var(--text-dim)' }}>
          Visual Pipeline Builder for Autonomous Spending Agents.
          <br />
          <span className="text-sm font-mono mt-2 block" style={{ color: 'var(--accent)' }}>
            SECURE &bull; MODULAR &bull; CHAIN-AGNOSTIC
          </span>
        </p>

        <AppButton onClick={onConnect} variant="primary" className="text-lg px-10 py-3">
          Connect Wallet
        </AppButton>
      </motion.div>
    </div>
  );
}
