import { useWalletStore } from '../store/walletStore';
import { TechCard, AppButton } from '../components/ui/TechCard';
import { Sun, Moon, LogOut, Copy } from 'lucide-react';

export default function Settings() {
  const walletStore = useWalletStore();

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="font-rajdhani font-bold text-2xl uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
        Settings
      </h1>

      {/* Wallet Info */}
      <TechCard>
        <h3 className="font-rajdhani font-bold text-sm uppercase tracking-wider mb-3" style={{ color: 'var(--text-main)' }}>
          Wallet
        </h3>
        {walletStore.isConnected ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono" style={{ color: 'var(--text-dim)' }}>Address</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono" style={{ color: 'var(--text-main)' }}>
                  {walletStore.address?.slice(0, 6)}...{walletStore.address?.slice(-4)}
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(walletStore.address || '')}
                  className="p-1 hover:opacity-80"
                  style={{ color: 'var(--text-dim)' }}
                >
                  <Copy size={12} />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono" style={{ color: 'var(--text-dim)' }}>Balance</span>
              <span className="text-xs font-mono" style={{ color: 'var(--text-main)' }}>{walletStore.balance} ETH</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono" style={{ color: 'var(--text-dim)' }}>Network</span>
              <span className="text-xs font-mono" style={{ color: 'var(--text-main)' }}>{walletStore.networkName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono" style={{ color: 'var(--text-dim)' }}>Chain ID</span>
              <span className="text-xs font-mono" style={{ color: 'var(--text-main)' }}>{walletStore.chainId}</span>
            </div>
            <AppButton variant="secondary" icon={LogOut} onClick={() => walletStore.disconnect()}>
              Disconnect
            </AppButton>
          </div>
        ) : (
          <p className="text-xs font-mono" style={{ color: 'var(--text-dim)' }}>
            No wallet connected.
          </p>
        )}
      </TechCard>

      {/* Theme */}
      <TechCard>
        <h3 className="font-rajdhani font-bold text-sm uppercase tracking-wider mb-3" style={{ color: 'var(--text-main)' }}>
          Theme
        </h3>
        <div className="flex gap-3">
          <AppButton
            variant={!walletStore.darkMode ? 'primary' : 'secondary'}
            icon={Sun}
            onClick={() => walletStore.setDarkMode(false)}
          >
            Light
          </AppButton>
          <AppButton
            variant={walletStore.darkMode ? 'primary' : 'secondary'}
            icon={Moon}
            onClick={() => walletStore.setDarkMode(true)}
          >
            Dark
          </AppButton>
        </div>
      </TechCard>
    </div>
  );
}
