import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Globe, AlertTriangle, Trash2, Sun, Moon } from 'lucide-react';
import { TechCard, AppButton, Badge } from '../components/ui/TechCard';
import { useAppStore } from '../store/appStore';

export default function SettingsPage() {
  const { wallet, darkMode, toggleDarkMode } = useAppStore();
  const [network, setNetwork] = useState('mock-testnet');

  return (
    <div className="p-8 min-h-full" style={{ background: 'var(--bg-dark)' }}>
      <div className="mb-8">
        <h1 className="font-rajdhani font-bold text-3xl uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
          System Settings
        </h1>
        <p className="font-mono text-xs mt-1" style={{ color: 'var(--text-dim)' }}>
          Configuration & Preferences
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Wallet Info */}
        <TechCard>
          <div className="flex items-center gap-3 mb-4">
            <Wallet size={18} style={{ color: 'var(--accent)' }} />
            <p className="text-sm font-mono uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>Wallet</p>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-[10px] font-mono uppercase mb-1" style={{ color: 'var(--text-dim)' }}>Address</p>
              <p className="text-sm font-mono" style={{ color: 'var(--text-main)' }}>
                {wallet?.address || 'Not connected'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase mb-1" style={{ color: 'var(--text-dim)' }}>Chain</p>
              <Badge color="accent">{wallet?.chain || 'N/A'}</Badge>
            </div>
          </div>
        </TechCard>

        {/* Preferences */}
        <TechCard>
          <div className="flex items-center gap-3 mb-4">
            {darkMode ? <Moon size={18} style={{ color: 'var(--accent)' }} /> : <Sun size={18} style={{ color: 'var(--accent)' }} />}
            <p className="text-sm font-mono uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>Preferences</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono" style={{ color: 'var(--text-main)' }}>Dark Mode</p>
              <p className="text-[10px] font-mono" style={{ color: 'var(--text-dim)' }}>Toggle between light and dark themes</p>
            </div>
            <button
              onClick={toggleDarkMode}
              className="w-12 h-6 rounded-full relative transition-colors duration-200 cursor-pointer"
              style={{
                background: darkMode ? 'var(--accent)' : 'var(--border-tech)',
                border: 'none',
              }}
            >
              <div
                className="w-5 h-5 rounded-full absolute top-0.5 transition-transform duration-200"
                style={{
                  background: 'white',
                  transform: darkMode ? 'translateX(26px)' : 'translateX(2px)',
                }}
              />
            </button>
          </div>
        </TechCard>

        {/* Network Toggle */}
        <TechCard>
          <div className="flex items-center gap-3 mb-4">
            <Globe size={18} style={{ color: 'var(--accent)' }} />
            <p className="text-sm font-mono uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>Network</p>
          </div>
          <div className="space-y-2">
            {['mock-testnet', 'bitcoin-midl', 'arbitrum', 'aya-multichain'].map((net) => (
              <button
                key={net}
                onClick={() => setNetwork(net)}
                className="w-full text-left px-4 py-3 flex items-center justify-between transition-colors"
                style={{
                  border: '1px solid var(--border-tech)',
                  background: network === net ? 'rgba(var(--accent-rgb), 0.1)' : 'transparent',
                  cursor: 'pointer',
                  color: 'var(--text-main)',
                }}
              >
                <span className="text-xs font-mono uppercase">{net}</span>
                {network === net && (
                  <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} />
                )}
              </button>
            ))}
          </div>
        </TechCard>

        {/* Danger Zone */}
        <TechCard>
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle size={18} className="text-red-400" />
            <p className="text-sm font-mono uppercase tracking-wider text-red-400">Danger Zone</p>
          </div>
          <p className="text-xs font-mono mb-4" style={{ color: 'var(--text-dim)' }}>
            These actions are destructive and cannot be undone.
          </p>
          <div className="space-y-2">
            <AppButton variant="danger" icon={Trash2}>
              Clear All Pipelines
            </AppButton>
          </div>
        </TechCard>
      </div>
    </div>
  );
}
