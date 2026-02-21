import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const customStyles = {
  root: {
    '--bg-dark': '#FFFFFF',
    '--bg-panel': '#F8FAFC',
    '--bg-panel-transparent': 'rgba(248, 250, 252, 0.8)',
    '--accent': '#F97316',
    '--accent-glow': '#FB923C',
    '--text-main': '#0F172A',
    '--text-dim': '#64748B',
    '--border-tech': '#E2E8F0',
    '--success': '#10B981',
    '--danger': '#EF4444',
    '--warning': '#F59E0B',
    '--grid-color': 'rgba(249, 115, 22, 0.05)',
    '--dot-color': 'rgba(249, 115, 22, 0.1)',
  },
  rootDark: {
    '--bg-dark': '#0D0518',
    '--bg-panel': '#1A0F2E',
    '--bg-panel-transparent': 'rgba(26, 15, 46, 0.6)',
    '--accent': '#9d4edd',
    '--accent-glow': '#7b2cbf',
    '--text-main': '#E2E8F0',
    '--text-dim': '#94A3B8',
    '--border-tech': '#4c1d95',
    '--success': '#10B981',
    '--danger': '#EF4444',
    '--warning': '#F59E0B',
    '--grid-color': 'rgba(76, 29, 149, 0.1)',
    '--dot-color': 'rgba(157, 78, 221, 0.2)',
  }
};

const WalletIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 1-1 1v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1z"></path>
  </svg>
);

const LayoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="3" y1="9" x2="21" y2="9"></line>
    <line x1="9" y1="21" x2="9" y2="9"></line>
  </svg>
);

const GitGraphIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5" cy="6" r="3"></circle>
    <path d="M5 9v6"></path>
    <circle cx="5" cy="18" r="3"></circle>
    <path d="M12 3v18"></path>
    <circle cx="19" cy="6" r="3"></circle>
    <path d="M19 9v6"></path>
    <circle cx="19" cy="18" r="3"></circle>
  </svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const BotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2"></rect>
    <circle cx="12" cy="5" r="2"></circle>
    <path d="M12 7v4"></path>
    <line x1="8" y1="16" x2="8" y2="16"></line>
    <line x1="16" y1="16" x2="16" y2="16"></line>
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

const TechCard = ({ children, className = "", noPad = false, glow = false }) => (
  <div
    className={`relative ${noPad ? '' : 'p-6'} ${className}`}
    style={{
      border: '1px solid var(--border-tech)',
      background: 'var(--bg-panel-transparent)',
      backdropFilter: 'blur(4px)',
      position: 'relative',
      boxShadow: glow ? '0 0 20px var(--accent-glow)' : undefined,
    }}
  >
    <div style={{
      content: '',
      position: 'absolute',
      top: '-1px',
      left: '-1px',
      width: '10px',
      height: '10px',
      borderTop: '2px solid var(--accent)',
      borderLeft: '2px solid var(--accent)',
      pointerEvents: 'none',
    }} />
    {children}
  </div>
);

const AppButton = ({ children, variant = "primary", className = "", icon: Icon, onClick }) => {
  const baseStyle = {
    position: 'relative',
    fontFamily: "'Rajdhani', sans-serif",
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    padding: '8px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '14px',
    clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: 'none',
    outline: 'none',
  };

  const variantStyles = {
    primary: {
      background: 'var(--accent)',
      color: 'white',
      border: '1px solid rgba(255,255,255,0.1)',
    },
    secondary: {
      background: 'var(--bg-panel)',
      border: '1px solid rgba(var(--accent-rgb), 0.5)',
      color: 'var(--text-main)',
    },
    danger: {
      background: 'rgba(127,29,29,0.4)',
      border: '1px solid rgba(239,68,68,0.5)',
      color: '#fecaca',
    },
  };

  return (
    <button
      style={{ ...baseStyle, ...variantStyles[variant] }}
      className={className}
      onClick={onClick}
    >
      {Icon && <Icon />}
      {children}
    </button>
  );
};

const Badge = ({ children, color = "accent" }) => {
  const colorMap = {
    accent: { background: 'rgba(249,115,22,0.2)', color: 'var(--accent)', border: '1px solid rgba(249,115,22,0.3)' },
    green: { background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' },
    blue: { background: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)' },
    red: { background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' },
  };
  return (
    <span style={{
      padding: '2px 8px',
      fontSize: '10px',
      fontFamily: "'JetBrains Mono', monospace",
      borderRadius: '2px',
      textTransform: 'uppercase',
      ...colorMap[color],
    }}>
      {children}
    </span>
  );
};

const Landing = ({ onConnect, isDarkMode, toggleDarkMode }) => {
  const gridBgStyle = {
    backgroundImage: 'linear-gradient(var(--grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--grid-color) 1px, transparent 1px)',
    backgroundSize: '40px 40px',
  };

  return (
    <div style={{ height: '100vh', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', background: 'var(--bg-dark)' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.3, ...gridBgStyle, pointerEvents: 'none' }} />

      <div style={{
        position: 'absolute', top: '80px', left: '80px', width: '128px', height: '128px',
        border: '1px solid rgba(249,115,22,0.2)', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'spin 8s linear infinite',
      }}>
        <div style={{ width: '96px', height: '96px', borderTop: '2px solid rgba(249,115,22,0.5)', borderRadius: '50%' }} />
      </div>

      <div style={{
        position: 'absolute', bottom: '80px', right: '80px', width: '192px', height: '192px',
        border: '1px solid rgba(249,115,22,0.1)', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ width: '160px', height: '160px', borderBottom: '2px solid rgba(249,115,22,0.3)', borderLeft: '2px solid rgba(249,115,22,0.3)', borderRadius: '50%' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: '672px', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '64px', height: '64px',
            border: '2px solid var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              border: '1px solid var(--accent)',
              filter: 'blur(2px)',
            }} />
            <span style={{ color: 'var(--accent)' }}><BotIcon /></span>
          </div>
        </div>

        <h1 style={{
          fontSize: '60px',
          fontFamily: "'Rajdhani', sans-serif",
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: '8px',
          textShadow: '0 0 8px var(--accent-glow)',
          color: 'var(--text-main)',
        }}>
          MANDATOR
        </h1>

        <div style={{
          height: '4px', width: '96px',
          background: 'linear-gradient(to right, transparent, var(--accent), transparent)',
          margin: '0 auto 24px',
        }} />

        <p style={{ fontSize: '18px', color: 'var(--text-dim)', marginBottom: '40px', fontWeight: '300', maxWidth: '448px', margin: '0 auto 40px', lineHeight: '1.6' }}>
          Visual Pipeline Builder for Autonomous Spending Agents.
          <br />
          <span style={{ color: 'var(--accent)', fontSize: '14px', fontFamily: "'JetBrains Mono', monospace", marginTop: '8px', display: 'block' }}>
            SECURE • MODULAR • CHAIN-AGNOSTIC
          </span>
        </p>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <AppButton onClick={onConnect} className="" style={{ width: '256px', height: '56px', fontSize: '18px' }}>
            Connect Wallet
          </AppButton>
        </div>
      </div>

      <button
        onClick={toggleDarkMode}
        style={{
          position: 'absolute', top: '24px', right: '24px',
          padding: '12px', borderRadius: '50%',
          border: '1px solid var(--border-tech)',
          background: 'var(--bg-panel)',
          color: 'var(--text-main)',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        {isDarkMode ? <SunIcon /> : <MoonIcon />}
      </button>
    </div>
  );
};

const Sidebar = ({ activePage, setPage }) => {
  const navItems = [
    { id: 'dashboard', icon: LayoutIcon, label: 'Command' },
    { id: 'canvas', icon: GitGraphIcon, label: 'Pipeline' },
    { id: 'agents', icon: BotIcon, label: 'Agents' },
    { id: 'settings', icon: SettingsIcon, label: 'System' },
  ];

  return (
    <div style={{
      width: '256px',
      minWidth: '256px',
      borderRight: '1px solid var(--border-tech)',
      background: 'var(--bg-panel)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      zIndex: 20,
    }}>
      <div style={{
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        borderBottom: '1px solid var(--border-tech)',
      }}>
        <div style={{
          width: '32px', height: '32px',
          border: '1px solid var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginRight: '12px',
          boxShadow: '0 0 10px rgba(249,115,22,0.3)',
        }}>
          <div style={{ width: '16px', height: '16px', background: 'var(--accent)' }} />
        </div>
        <span style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontWeight: 'bold',
          fontSize: '20px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--text-main)',
        }}>MNDTR</span>
      </div>

      <div style={{ flex: 1, padding: '32px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              padding: '12px 24px',
              position: 'relative',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: activePage === item.id ? 'var(--text-main)' : 'var(--text-dim)',
              transition: 'color 0.2s',
            }}
          >
            {activePage === item.id && (
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px',
                background: 'var(--accent)',
                boxShadow: '0 0 10px var(--accent)',
              }} />
            )}
            <span style={{ color: activePage === item.id ? 'var(--accent)' : 'inherit' }}>
              <item.icon />
            </span>
            <span style={{
              marginLeft: '16px',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>{item.label}</span>
          </button>
        ))}
      </div>

      <div style={{ padding: '16px', borderTop: '1px solid var(--border-tech)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px', height: '32px',
            background: 'rgba(249,115,22,0.1)',
            borderRadius: '4px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(249,115,22,0.3)',
          }}>
            <span style={{ color: 'var(--accent)' }}><WalletIcon /></span>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace" }}>Vault Balance</div>
            <div style={{ fontSize: '14px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-main)' }}>12.4 ETH</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const gridBgStyle = {
    backgroundImage: 'linear-gradient(var(--grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--grid-color) 1px, transparent 1px)',
    backgroundSize: '40px 40px',
  };

  const stats = [
    { label: "Active Agents", val: "04", sub: "2 Idle", color: "var(--accent)" },
    { label: "24h Spend", val: "1.2 ETH", sub: "+0.4%", color: "#3B82F6" },
    { label: "Pipelines", val: "12", sub: "All Healthy", color: "#10B981" },
    { label: "Block Height", val: "182934", sub: "Synced", color: "#64748B" },
  ];

  return (
    <div style={{ padding: '40px', height: '100%', overflowY: 'auto' }}>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{
            fontSize: '30px',
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-main)',
            marginBottom: '4px',
          }}>Command Center</h2>
          <p style={{ color: 'var(--text-dim)', fontFamily: "'JetBrains Mono', monospace", fontSize: '14px' }}>
            System Status: <span style={{ color: '#10b981', fontWeight: 'bold' }}>OPERATIONAL</span>
          </p>
        </div>
        <AppButton icon={PlusIcon}>New Agent</AppButton>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
        {stats.map((stat, i) => (
          <TechCard key={i} className="" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '128px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0 0 8px' }}>
              <span style={{ fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>{stat.label}</span>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: stat.color, boxShadow: `0 0 8px ${stat.color}` }} />
            </div>
            <div>
              <div style={{ fontSize: '30px', fontFamily: "'Rajdhani', sans-serif", fontWeight: 'bold', color: 'var(--text-main)' }}>{stat.val}</div>
              <div style={{ fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-dim)', marginTop: '4px' }}>{stat.sub}</div>
            </div>
          </TechCard>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <TechCard noPad style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{
            padding: '16px',
            borderBottom: '1px solid var(--border-tech)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--bg-panel)',
          }}>
            <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '18px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-main)' }}>Transaction Feed</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', background: 'rgba(249,115,22,0.5)', borderRadius: '2px', display: 'block' }} />
              <span style={{ width: '8px', height: '8px', background: 'rgba(249,115,22,0.2)', borderRadius: '2px', display: 'block' }} />
            </div>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px',
                background: 'var(--bg-dark)',
                border: '1px solid var(--border-tech)',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'var(--accent)' }}>14:02:2{item}</div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: '500' }}>Uniswap Swap Execution</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontFamily: "'JetBrains Mono', monospace" }}>0x7d...4f2a • Agent-0{item}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-main)' }}>-0.05 ETH</div>
                  <Badge color="green">Success</Badge>
                </div>
              </div>
            ))}
          </div>
        </TechCard>

        <TechCard noPad style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{
            padding: '16px',
            borderBottom: '1px solid var(--border-tech)',
            background: 'var(--bg-panel)',
          }}>
            <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '18px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-main)' }}>Vault Composition</h3>
          </div>
          <div style={{ flex: 1, padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <div style={{
              width: '192px', height: '192px', borderRadius: '50%',
              border: '4px solid var(--border-tech)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                borderTop: '4px solid var(--accent)', borderRight: '4px solid var(--accent)',
                borderRadius: '50%',
                transform: 'rotate(45deg)',
              }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-main)' }}>72%</div>
                <div style={{ fontSize: '12px', color: 'var(--accent)', textTransform: 'uppercase' }}>Allocated</div>
              </div>
            </div>
          </div>
          <div style={{ padding: '16px', borderTop: '1px solid var(--border-tech)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-dim)', marginBottom: '8px' }}>
              <span>ETH</span>
              <span style={{ color: 'var(--text-main)' }}>64%</span>
            </div>
          </div>
        </TechCard>
      </div>
    </div>
  );
};

const PlaceholderPage = ({ name }) => (
  <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)', fontFamily: "'JetBrains Mono', monospace" }}>
    {name} Module Loading...
  </div>
);

const App = () => {
  const [view, setView] = useState('landing');
  const [activePage, setActivePage] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&family=Inter:wght@300;400;500;600&display=swap');
      
      * { box-sizing: border-box; margin: 0; padding: 0; }
      
      body {
        font-family: 'Inter', sans-serif;
        overflow: hidden;
      }
      
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      ::-webkit-scrollbar {
        width: 4px;
      }
      ::-webkit-scrollbar-track {
        background: transparent;
      }
      ::-webkit-scrollbar-thumb {
        background: var(--accent);
        border-radius: 2px;
      }
    `;
    document.head.appendChild(styleEl);
    return () => document.head.removeChild(styleEl);
  }, []);

  const cssVars = isDarkMode ? customStyles.rootDark : customStyles.root;

  const gridBgStyle = {
    backgroundImage: 'linear-gradient(var(--grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--grid-color) 1px, transparent 1px)',
    backgroundSize: '40px 40px',
  };

  if (view === 'landing') {
    return (
      <div style={{ ...cssVars, background: 'var(--bg-dark)', height: '100vh', overflow: 'hidden' }}>
        <Landing
          onConnect={() => setView('app')}
          isDarkMode={isDarkMode}
          toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        />
      </div>
    );
  }

  return (
    <Router basename="/">
      <div style={{ ...cssVars, display: 'flex', height: '100vh', width: '100%', background: 'var(--bg-dark)', overflow: 'hidden' }}>
        <Sidebar activePage={activePage} setPage={setActivePage} />
        <main style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{
            height: '64px',
            borderBottom: '1px solid var(--border-tech)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            background: 'var(--bg-panel)',
            backdropFilter: 'blur(8px)',
            zIndex: 10,
            position: 'relative',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <h1 style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: '20px',
                color: 'var(--text-main)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: 'bold',
              }}>
                {activePage === 'dashboard' ? 'Overview' : activePage.charAt(0).toUpperCase() + activePage.slice(1)}
              </h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                style={{
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-tech)',
                  background: 'none',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {isDarkMode ? <SunIcon /> : <MoonIcon />}
              </button>
              <div style={{
                width: '32px', height: '32px',
                borderRadius: '4px',
                border: '1px solid var(--border-tech)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}>
                <span style={{ color: 'var(--text-dim)' }}><SearchIcon /></span>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              opacity: 0.2,
              pointerEvents: 'none',
              ...gridBgStyle,
            }} />
            {activePage === 'dashboard' && <Dashboard />}
            {activePage !== 'dashboard' && <PlaceholderPage name={activePage.charAt(0).toUpperCase() + activePage.slice(1)} />}
          </div>
        </main>
      </div>
    </Router>
  );
};

export default App;