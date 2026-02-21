import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PenTool, Settings, Sun, Moon, Wallet } from 'lucide-react';
import { useWalletStore } from '../store/walletStore';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/canvas', icon: PenTool, label: 'Canvas' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const walletStore = useWalletStore();
  const navigate = useNavigate();

  return (
    <div className="w-16 shrink-0 flex flex-col items-center py-4 gap-6" style={{ borderRight: '1px solid var(--border-tech)', background: 'var(--bg-panel)' }}>
      {/* Logo */}
      <div
        className="w-10 h-10 flex items-center justify-center font-rajdhani font-bold text-lg cursor-pointer"
        style={{ border: '1px solid var(--accent)', color: 'var(--accent)' }}
        onClick={() => navigate('/dashboard')}
      >
        M
      </div>

      {/* Nav Items */}
      <nav className="flex-1 flex flex-col items-center gap-2">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `w-10 h-10 flex items-center justify-center transition-opacity ${isActive ? 'opacity-100' : 'opacity-50 hover:opacity-80'}`
            }
            style={({ isActive }) => ({
              border: isActive ? '1px solid var(--accent)' : '1px solid transparent',
              color: isActive ? 'var(--accent)' : 'var(--text-dim)',
            })}
            title={item.label}
          >
            <item.icon size={18} />
          </NavLink>
        ))}
      </nav>

      {/* Bottom: Balance + Dark Mode */}
      <div className="flex flex-col items-center gap-3">
        {walletStore.isConnected && (
          <div className="text-center">
            <Wallet size={14} className="mx-auto mb-1" style={{ color: 'var(--accent)' }} />
            <p className="text-[8px] font-mono leading-tight" style={{ color: 'var(--text-dim)' }}>
              {walletStore.balance?.slice(0, 6)}
            </p>
          </div>
        )}
        <button
          onClick={() => walletStore.setDarkMode(!walletStore.darkMode)}
          className="w-10 h-10 flex items-center justify-center opacity-50 hover:opacity-80 transition-opacity"
          style={{ border: '1px solid var(--border-tech)', color: 'var(--text-dim)' }}
          title="Toggle theme"
        >
          {walletStore.darkMode ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>
    </div>
  );
}
