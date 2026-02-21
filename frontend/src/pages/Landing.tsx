import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, Bot, Zap, Shield, Network, Moon, Sun } from 'lucide-react';
import { useWalletStore } from '../store/walletStore';
import { AppButton } from '../components/ui/TechCard';

// ── Ambient floating orbs ────────────────────────────────────────────────────
function AmbientOrbs({ darkMode }: { darkMode: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        animate={{ x: [0, 50, 0], y: [0, -40, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute rounded-full"
        style={{
          top: '-8%',
          left: '-8%',
          width: '600px',
          height: '600px',
          background: darkMode
            ? 'radial-gradient(circle, rgba(157,78,221,0.14) 0%, transparent 68%)'
            : 'radial-gradient(circle, rgba(249,115,22,0.09) 0%, transparent 68%)',
        }}
      />
      <motion.div
        animate={{ x: [0, -40, 0], y: [0, 50, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        className="absolute rounded-full"
        style={{
          bottom: '-10%',
          right: '-8%',
          width: '550px',
          height: '550px',
          background: darkMode
            ? 'radial-gradient(circle, rgba(123,44,191,0.12) 0%, transparent 65%)'
            : 'radial-gradient(circle, rgba(251,146,60,0.07) 0%, transparent 65%)',
        }}
      />
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        className="absolute rounded-full"
        style={{
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '700px',
          height: '700px',
          background: darkMode
            ? 'radial-gradient(circle, rgba(157,78,221,0.04) 0%, transparent 60%)'
            : 'radial-gradient(circle, rgba(249,115,22,0.03) 0%, transparent 60%)',
        }}
      />
    </div>
  );
}

// ── Floating micro-particles ──────────────────────────────────────────────────
const PARTICLES = [
  { top: '12%', left: '18%', delay: 0,   big: true  },
  { top: '28%', left: '82%', delay: 1.2, big: false },
  { top: '60%', left: '8%',  delay: 0.6, big: false },
  { top: '72%', left: '70%', delay: 2.1, big: true  },
  { top: '20%', left: '55%', delay: 1.8, big: false },
  { top: '85%', left: '35%', delay: 0.3, big: false },
  { top: '45%', left: '92%', delay: 1.5, big: true  },
  { top: '55%', left: '25%', delay: 2.4, big: false },
];

function FloatingParticles({ darkMode }: { darkMode: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -14, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{
            duration: 4 + i * 0.45,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: p.delay,
          }}
          className="absolute rounded-full"
          style={{
            top: p.top,
            left: p.left,
            width: p.big ? '5px' : '3px',
            height: p.big ? '5px' : '3px',
            background: darkMode
              ? 'rgba(157,78,221,0.7)'
              : 'rgba(249,115,22,0.6)',
          }}
        />
      ))}
    </div>
  );
}

// ── Feature card ──────────────────────────────────────────────────────────────
interface FeatureCardProps {
  icon: React.ComponentType<{ size: number; style?: React.CSSProperties }>;
  title: string;
  description: string;
  delay: number;
}

function FeatureCard({ icon: Icon, title, description, delay }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.55, delay }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="relative p-5 group cursor-default"
      style={{
        background: 'var(--bg-panel-transparent)',
        border: '1px solid var(--border-tech)',
        backdropFilter: 'blur(14px)',
      }}
    >
      {/* Corner accents */}
      <div
        className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 pointer-events-none"
        style={{ borderColor: 'var(--accent)' }}
      />
      <div
        className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 pointer-events-none"
        style={{ borderColor: 'var(--accent)' }}
      />

      {/* Hover radial glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(var(--accent-rgb), 0.09) 0%, transparent 70%)',
        }}
      />

      {/* Icon box */}
      <div
        className="w-9 h-9 mb-4 flex items-center justify-center"
        style={{
          background: 'rgba(var(--accent-rgb), 0.1)',
          border: '1px solid rgba(var(--accent-rgb), 0.25)',
        }}
      >
        <Icon size={17} style={{ color: 'var(--accent)' }} />
      </div>

      <h3
        className="font-rajdhani font-bold uppercase tracking-wider text-sm mb-1.5"
        style={{ color: 'var(--text-main)' }}
      >
        {title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-dim)' }}>
        {description}
      </p>
    </motion.div>
  );
}

// ── Static data ───────────────────────────────────────────────────────────────
const FEATURES: Omit<FeatureCardProps, 'delay'>[] = [
  {
    icon: Bot,
    title: 'Autonomous Agents',
    description: 'Deploy self-executing AI agents that operate on-chain without manual intervention.',
  },
  {
    icon: Network,
    title: 'Chain Agnostic',
    description: 'Build once, deploy anywhere. Runs across all EVM-compatible networks seamlessly.',
  },
  {
    icon: Shield,
    title: 'Non-Custodial',
    description: 'Your keys, your assets. Every action is signed locally — never exposed to a server.',
  },
  {
    icon: Zap,
    title: 'Visual Pipelines',
    description: 'Compose complex spending logic visually with our node-based pipeline builder.',
  },
];

// ── Framer Motion variants ────────────────────────────────────────────────────
const heroContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13 } },
};

const heroItem = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate();
  const walletStore = useWalletStore();

  const handleConnect = async () => {
    await walletStore.connect();
    navigate('/dashboard');
  };

  if (walletStore.isConnected) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: 'var(--bg-dark)' }}
    >
      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(var(--grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--grid-color) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          opacity: 0.75,
        }}
      />

      <AmbientOrbs darkMode={walletStore.darkMode} />
      <FloatingParticles darkMode={walletStore.darkMode} />

      {/* ── Nav ── */}
      <nav className="relative z-20 flex items-center justify-between px-6 sm:px-10 py-5">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2.5"
        >
          <div
            className="w-7 h-7 flex items-center justify-center"
            style={{
              border: '1px solid var(--accent)',
              boxShadow: '0 0 10px rgba(var(--accent-rgb), 0.3)',
            }}
          >
            <Bot size={14} style={{ color: 'var(--accent)' }} />
          </div>
          <span
            className="font-rajdhani font-bold uppercase tracking-widest text-xs"
            style={{ color: 'var(--text-main)' }}
          >
            Mandator
          </span>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          onClick={() => walletStore.toggleDarkMode()}
          className="p-2 transition-opacity duration-200 hover:opacity-70"
          style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-tech)',
            color: 'var(--text-dim)',
          }}
          aria-label="Toggle dark mode"
        >
          {walletStore.darkMode ? <Sun size={15} /> : <Moon size={15} />}
        </motion.button>
      </nav>

      {/* ── Hero ── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-10">
        <motion.div
          variants={heroContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          {/* Status badge */}
          <motion.div
            variants={heroItem}
            className="inline-flex items-center gap-2 mb-8 px-4 py-1.5"
            style={{
              background: 'rgba(var(--accent-rgb), 0.08)',
              border: '1px solid rgba(var(--accent-rgb), 0.22)',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: 'var(--accent)' }}
            />
            <span
              className="font-mono text-xs tracking-[0.18em] uppercase"
              style={{ color: 'var(--accent)' }}
            >
              Web3 · AI Agents · On-Chain
            </span>
          </motion.div>

          {/* Main title */}
          <motion.h1
            variants={heroItem}
            className="font-rajdhani font-bold uppercase leading-none mb-5"
            style={{
              fontSize: 'clamp(56px, 11vw, 132px)',
              letterSpacing: '0.07em',
              color: 'var(--text-main)',
              textShadow: walletStore.darkMode
                ? '0 0 80px rgba(157,78,221,0.22), 0 0 160px rgba(157,78,221,0.08)'
                : '0 0 80px rgba(249,115,22,0.12)',
            }}
          >
            MANDATOR
          </motion.h1>

          {/* Gradient divider */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.55, ease: 'easeOut' }}
            style={{
              height: '2px',
              width: '72px',
              background: 'linear-gradient(to right, transparent, var(--accent), transparent)',
              marginBottom: '28px',
            }}
          />

          {/* Subtitle */}
          <motion.p
            variants={heroItem}
            className="text-lg max-w-sm mb-10 leading-relaxed"
            style={{ color: 'var(--text-dim)', fontWeight: 300 }}
          >
            Visual pipeline builder for autonomous spending agents.
          </motion.p>

          {/* CTA */}
          <motion.div variants={heroItem} className="flex flex-col items-center gap-3">
            <AppButton
              variant="primary"
              icon={Wallet}
              onClick={handleConnect}
              disabled={walletStore.isConnecting}
            >
              {walletStore.isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </AppButton>

            {walletStore.error && (
              <p className="text-xs font-mono" style={{ color: 'var(--error)' }}>
                {walletStore.error}
              </p>
            )}

            <p
              className="font-mono text-xs mt-1"
              style={{ color: 'var(--text-dim)', opacity: 0.5 }}
            >
              MetaMask · WalletConnect · Coinbase Wallet
            </p>
          </motion.div>
        </motion.div>
      </main>

      {/* ── Feature cards ── */}
      <section className="relative z-10 w-full max-w-5xl mx-auto px-6 sm:px-10 pb-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} {...f} delay={i * 0.09} />
          ))}
        </div>
      </section>

      {/* ── Footer strip ── */}
      <footer
        className="relative z-10 text-center py-4"
        style={{ borderTop: '1px solid var(--border-tech)' }}
      >
        <p
          className="font-mono text-xs tracking-[0.22em]"
          style={{ color: 'var(--text-dim)', opacity: 0.45 }}
        >
          SECURE · MODULAR · CHAIN-AGNOSTIC
        </p>
      </footer>
    </div>
  );
}
