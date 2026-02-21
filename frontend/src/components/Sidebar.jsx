import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, GitBranch, Bot, Settings, Wallet, Sun, Moon } from 'lucide-react';
import { useAppStore } from '../store/appStore';

const navItems = [
  { id: 'dashboard', path: '/dashboard', icon: Layout, label: 'Command' },
  { id: 'canvas', path: '/canvas', icon: GitBranch, label: 'Pipeline' },
  { id: 'agents', path: '/dashboard', icon: Bot, label: 'Agents' },
  { id: 'settings', path: '/settings', icon: Settings, label: 'System' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, toggleDarkMode, vaultBalance } = useAppStore();

  const activePath = location.pathname;

  return (
    <div
      className="w-64 min-w-[256px] flex flex-col relative z-20"
      style={{
        borderRight: '1px solid var(--border-tech)',
        background: 'var(--bg-panel)',
      }}
    >
      {/* Header */}
      <div
        className="h-16 flex items-center px-6 gap-3"
        style={{ borderBottom: '1px solid var(--border-tech)' }}
      >
        <div
          className="w-8 h-8 flex items-center justify-center"
          style={{
            border: '1px solid var(--accent)',
            boxShadow: '0 0 10px rgba(var(--accent-rgb), 0.3)',
          }}
        >
          <div className="w-4 h-4" style={{ background: 'var(--accent)' }} />
        </div>
        <span
          className="font-rajdhani font-bold text-xl tracking-[0.2em] uppercase"
          style={{ color: 'var(--text-main)' }}
        >
          MNDTR
        </span>
      </div>

      {/* Nav */}
      <div className="flex-1 py-8 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = activePath === item.path || (item.id === 'canvas' && activePath.startsWith('/canvas'));
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center px-6 py-3 relative transition-colors duration-200"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: isActive ? 'var(--text-main)' : 'var(--text-dim)',
              }}
            >
              {isActive && (
                <div
                  className="absolute left-0 top-0 bottom-0 w-1"
                  style={{ background: 'var(--accent)', boxShadow: '0 0 10px var(--accent)' }}
                />
              )}
              <span style={{ color: isActive ? 'var(--accent)' : 'inherit' }}>
                <item.icon size={20} />
              </span>
              <span className="ml-4 font-mono text-sm uppercase tracking-wider">
                {item.label}
              </span>
              {isActive && (
                <div
                  className="absolute right-4 w-1 h-1 rounded-full"
                  style={{ background: 'var(--accent)' }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Dark mode toggle */}
      <div className="px-4 pb-2">
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center gap-2 px-3 py-2 rounded font-mono text-xs uppercase transition-colors"
          style={{
            background: 'rgba(var(--accent-rgb), 0.08)',
            border: '1px solid var(--border-tech)',
            color: 'var(--text-dim)',
            cursor: 'pointer',
          }}
        >
          {darkMode ? <Sun size={14} /> : <Moon size={14} />}
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>

      {/* Vault balance */}
      <div className="px-4 py-4" style={{ borderTop: '1px solid var(--border-tech)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded flex items-center justify-center"
            style={{
              background: 'rgba(var(--accent-rgb), 0.1)',
              border: '1px solid rgba(var(--accent-rgb), 0.3)',
            }}
          >
            <Wallet size={16} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono" style={{ color: 'var(--text-dim)' }}>
              Vault Balance
            </div>
            <div className="text-sm font-mono" style={{ color: 'var(--text-main)' }}>
              {vaultBalance ? `${vaultBalance.balance} ${vaultBalance.currency}` : '--'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
