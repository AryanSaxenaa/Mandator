import { useNavigate } from 'react-router-dom';
import { Wallet, Shield, Zap, Bot } from 'lucide-react';
import { useWalletStore } from '../store/walletStore';
import { TechCard, AppButton } from '../components/ui/TechCard';

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
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-dark)' }}>
      <div className="max-w-lg w-full text-center space-y-8">
        <div>
          <h1 className="font-rajdhani font-bold text-4xl uppercase tracking-widest mb-2" style={{ color: 'var(--text-main)' }}>
            Mandator
          </h1>
          <p className="text-sm font-mono" style={{ color: 'var(--text-dim)' }}>
            Autonomous on-chain agents. Build pipelines, deploy, and let AI manage your transactions.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Bot, label: 'AI Agents', desc: 'Groq-powered decisions' },
            { icon: Shield, label: 'Safety Rails', desc: 'Spend limits & budget gates' },
            { icon: Zap, label: 'Real Transactions', desc: 'Sign with your wallet' },
          ].map(f => (
            <TechCard key={f.label}>
              <f.icon size={24} className="mx-auto mb-2" style={{ color: 'var(--accent)' }} />
              <p className="text-xs font-rajdhani font-bold uppercase" style={{ color: 'var(--text-main)' }}>{f.label}</p>
              <p className="text-[10px] font-mono" style={{ color: 'var(--text-dim)' }}>{f.desc}</p>
            </TechCard>
          ))}
        </div>

        <TechCard className="text-left">
          <AppButton
            variant="primary"
            icon={Wallet}
            onClick={handleConnect}
            disabled={walletStore.isConnecting}
            className="w-full justify-center"
          >
            {walletStore.isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </AppButton>
          {walletStore.error && (
            <p className="text-xs font-mono mt-2 text-center" style={{ color: 'var(--error)' }}>
              {walletStore.error}
            </p>
          )}
          <p className="text-[10px] font-mono mt-2 text-center" style={{ color: 'var(--text-dim)' }}>
            Supports MetaMask, Coinbase Wallet, Rabby, Brave
          </p>
        </TechCard>
      </div>
    </div>
  );
}
