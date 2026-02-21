import { useNavigate } from 'react-router-dom';
import { Wallet, Bot, Moon, Sun } from 'lucide-react';
import { useWalletStore } from '../store/walletStore';
import { AppButton } from '../components/ui/TechCard';

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
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: 'var(--bg-dark)' }}
    >
      {/* Grid Background Pattern */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'linear-gradient(var(--grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--grid-color) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Dark Mode Toggle - Top Right */}
      <button
        onClick={() => walletStore.toggleDarkMode()}
        className="absolute top-8 right-8 z-20 p-3 transition-all duration-200"
        style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border-tech)',
          color: 'var(--text-main)',
          clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
        }}
        aria-label="Toggle dark mode"
      >
        {walletStore.darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Decorative Circle - Top Left */}
      <div 
        className="absolute"
        style={{
          top: '80px',
          left: '80px',
          width: '128px',
          height: '128px',
          border: '1px solid var(--dot-color)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div 
          style={{
            width: '96px',
            height: '96px',
            borderTop: '2px solid var(--accent)',
            borderRadius: '50%',
            animation: 'spin 8s linear infinite',
          }}
        />
      </div>

      {/* Decorative Circle - Bottom Right */}
      <div 
        className="absolute"
        style={{
          bottom: '80px',
          right: '80px',
          width: '192px',
          height: '192px',
          border: '1px solid var(--dot-color)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div 
          style={{
            width: '160px',
            height: '160px',
            borderBottom: '2px solid var(--accent)',
            borderLeft: '2px solid var(--accent)',
            borderRadius: '50%',
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-2xl px-6">
        {/* Icon Box */}
        <div className="flex justify-center mb-6">
          <div 
            className="relative flex items-center justify-center"
            style={{
              width: '64px',
              height: '64px',
              border: '2px solid var(--accent)',
              boxShadow: `0 0 10px var(--accent-glow)`,
            }}
          >
            <div 
              className="absolute inset-0"
              style={{
                border: '1px solid var(--accent)',
                filter: 'blur(2px)',
              }}
            />
            <Bot size={32} style={{ color: 'var(--accent-glow)', position: 'relative', zIndex: 1 }} />
          </div>
        </div>

        {/* Title */}
        <h1 
          className="font-rajdhani font-bold uppercase mb-2"
          style={{
            fontSize: '60px',
            letterSpacing: '0.1em',
            color: 'var(--text-main)',
            textShadow: walletStore.darkMode ? '0 0 8px var(--accent-glow)' : 'none',
          }}
        >
          MANDATOR
        </h1>

        {/* Gradient Divider */}
        <div 
          style={{
            height: '4px',
            width: '96px',
            background: `linear-gradient(to right, transparent, var(--accent), transparent)`,
            margin: '0 auto 24px',
          }}
        />

        {/* Description */}
        <p 
          className="text-lg mb-2"
          style={{ 
            color: 'var(--text-dim)',
            fontWeight: '300',
          }}
        >
          Visual Pipeline Builder for Autonomous Spending Agents.
        </p>

        {/* Tagline */}
        <p 
          className="font-mono mb-10 block"
          style={{
            color: 'var(--accent)',
            fontSize: '14px',
          }}
        >
          SECURE • MODULAR • CHAIN-AGNOSTIC
        </p>

        {/* Connect Button */}
        <AppButton
          variant="primary"
          icon={Wallet}
          onClick={handleConnect}
          disabled={walletStore.isConnecting}
          className="inline-flex items-center justify-center"
        >
          {walletStore.isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </AppButton>

        {walletStore.error && (
          <p className="text-xs font-mono mt-4 text-center" style={{ color: 'var(--error)' }}>
            {walletStore.error}
          </p>
        )}
      </div>
    </div>
  );
}
