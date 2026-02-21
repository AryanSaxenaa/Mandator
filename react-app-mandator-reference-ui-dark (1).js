import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const customStyles = {
  root: {
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
  }
};

const Icons = {
  Wallet: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 1-1 1v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1z"></path>
    </svg>
  ),
  Zap: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>
  ),
  Layout: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="3" y1="9" x2="21" y2="9"></line>
      <line x1="9" y1="21" x2="9" y2="9"></line>
    </svg>
  ),
  GitGraph: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5" cy="6" r="3"></circle>
      <path d="M5 9v6"></path>
      <circle cx="5" cy="18" r="3"></circle>
      <path d="M12 3v18"></path>
      <circle cx="19" cy="6" r="3"></circle>
      <path d="M19 9v6"></path>
      <circle cx="19" cy="18" r="3"></circle>
    </svg>
  ),
  Settings: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  ),
  Bot: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2"></rect>
      <circle cx="12" cy="5" r="2"></circle>
      <path d="M12 7v4"></path>
      <line x1="8" y1="16" x2="8" y2="16"></line>
      <line x1="16" y1="16" x2="16" y2="16"></line>
    </svg>
  ),
  Play: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3"></polygon>
    </svg>
  ),
  Plus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  ),
  Search: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  ),
  Target: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <circle cx="12" cy="12" r="6"></circle>
      <circle cx="12" cy="12" r="2"></circle>
    </svg>
  ),
};

const TechCard = ({ children, className = "", noPad = false, glow = false }) => (
  <div
    className={`relative bg-[#1A0F2E]/80 backdrop-blur-sm ${noPad ? '' : 'p-6'} ${className} ${glow ? 'shadow-[0_0_20px_rgba(157,78,221,0.15)]' : ''}`}
    style={{
      border: '1px solid rgba(157, 78, 221, 0.3)',
      boxShadow: glow ? '0 0 20px rgba(157,78,221,0.15), 0 0 10px rgba(123,44,191,0.1)' : '0 0 10px rgba(123,44,191,0.1)',
      position: 'relative',
    }}
  >
    <div style={{
      content: '',
      position: 'absolute',
      top: '-1px', left: '-1px',
      width: '10px', height: '10px',
      borderTop: '2px solid #9d4edd',
      borderLeft: '2px solid #9d4edd',
      pointerEvents: 'none',
    }} />
    <div style={{
      content: '',
      position: 'absolute',
      bottom: '-1px', right: '-1px',
      width: '10px', height: '10px',
      borderBottom: '2px solid #9d4edd',
      borderRight: '2px solid #9d4edd',
      pointerEvents: 'none',
    }} />
    {children}
  </div>
);

const Button = ({ children, variant = "primary", className = "", icon: Icon, onClick }) => {
  const baseStyle = {
    position: 'relative',
    fontFamily: "'Rajdhani', sans-serif",
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    padding: '8px 24px',
    transition: 'all 0.2s',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
  };

  const variantStyles = {
    primary: {
      background: 'linear-gradient(to right, #7C3AED, #9D4EDD)',
      color: 'white',
      border: '1px solid rgba(192,132,252,0.3)',
    },
    secondary: {
      background: '#2D1B4E',
      border: '1px solid rgba(124,58,237,0.5)',
      color: '#E2E8F0',
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

const Badge = ({ children, color = "purple" }) => {
  const colors = {
    purple: { background: 'rgba(88,28,135,0.5)', color: '#e9d5ff', border: '1px solid rgba(168,85,247,0.3)' },
    green: { background: 'rgba(6,78,59,0.5)', color: '#a7f3d0', border: '1px solid rgba(16,185,129,0.3)' },
    blue: { background: 'rgba(30,58,138,0.5)', color: '#bfdbfe', border: '1px solid rgba(59,130,246,0.3)' },
    red: { background: 'rgba(127,29,29,0.5)', color: '#fecaca', border: '1px solid rgba(239,68,68,0.3)' },
  };
  return (
    <span style={{
      padding: '2px 8px',
      fontSize: '10px',
      fontFamily: "'JetBrains Mono', monospace",
      borderRadius: '2px',
      textTransform: 'uppercase',
      ...colors[color],
    }}>
      {children}
    </span>
  );
};

const Landing = ({ onConnect }) => (
  <div style={{
    height: '100vh',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#0D0518',
  }}>
    <div style={{
      position: 'absolute',
      inset: 0,
      backgroundImage: 'linear-gradient(rgba(76,29,149,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(76,29,149,0.1) 1px, transparent 1px)',
      backgroundSize: '40px 40px',
      opacity: 0.3,
    }} />

    <div style={{
      position: 'absolute',
      top: '80px',
      left: '80px',
      width: '128px',
      height: '128px',
      border: '1px solid rgba(168,85,247,0.2)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        width: '96px',
        height: '96px',
        borderTop: '2px solid rgba(168,85,247,0.5)',
        borderRadius: '50%',
        animation: 'spin 8s linear infinite',
      }} />
    </div>

    <div style={{
      position: 'absolute',
      bottom: '80px',
      right: '80px',
      width: '192px',
      height: '192px',
      border: '1px solid rgba(168,85,247,0.1)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        width: '160px',
        height: '160px',
        borderBottom: '2px solid rgba(168,85,247,0.3)',
        borderLeft: '2px solid rgba(168,85,247,0.3)',
        borderRadius: '50%',
      }} />
    </div>

    <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: '672px', padding: '0 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
        <div style={{
          width: '64px',
          height: '64px',
          border: '2px solid #7C3AED',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          boxShadow: '0 0 10px rgba(124,58,237,0.3)',
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            border: '1px solid #7C3AED',
            filter: 'blur(2px)',
          }} />
          <span style={{ color: '#d8b4fe' }}><Icons.Bot /></span>
        </div>
      </div>

      <h1 style={{
        fontFamily: "'Rajdhani', sans-serif",
        fontWeight: 'bold',
        fontSize: '60px',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: 'white',
        textShadow: '0 0 8px #7b2cbf',
        marginBottom: '8px',
      }}>
        MANDATOR
      </h1>

      <div style={{
        height: '4px',
        width: '96px',
        background: 'linear-gradient(to right, transparent, #7C3AED, transparent)',
        margin: '0 auto 24px',
      }} />

      <p style={{ fontSize: '18px', color: '#9CA3AF', marginBottom: '40px', fontWeight: '300' }}>
        Visual Pipeline Builder for Autonomous Spending Agents.
        <br />
        <span style={{
          color: '#9D4EDD',
          fontSize: '14px',
          fontFamily: "'JetBrains Mono', monospace",
          display: 'block',
          marginTop: '8px',
        }}>
          SECURE • MODULAR • CHAIN-AGNOSTIC
        </span>
      </p>

      <Button onClick={onConnect} variant="primary">
        Connect Wallet
      </Button>
    </div>
  </div>
);

const Sidebar = ({ activePage, setPage }) => {
  const navItems = [
    { id: 'dashboard', icon: Icons.Layout, label: 'Command' },
    { id: 'canvas', icon: Icons.GitGraph, label: 'Pipeline' },
    { id: 'agents', icon: Icons.Bot, label: 'Agents' },
    { id: 'settings', icon: Icons.Settings, label: 'System' },
  ];

  return (
    <div style={{
      width: '256px',
      minWidth: '256px',
      borderRight: '1px solid rgba(76,29,149,0.3)',
      backgroundColor: '#0f0518',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      zIndex: 20,
    }}>
      <div style={{
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '24px',
        borderBottom: '1px solid rgba(76,29,149,0.3)',
        gap: '12px',
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '1px solid #7C3AED',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 10px rgba(124,58,237,0.3)',
        }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: '#7C3AED' }} />
        </div>
        <span style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontWeight: 'bold',
          fontSize: '20px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'white',
        }}>MNDTR</span>
      </div>

      <div style={{ flex: 1, paddingTop: '32px', paddingBottom: '32px' }}>
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              padding: '12px 24px',
              transition: 'all 0.2s',
              position: 'relative',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: activePage === item.id ? 'white' : '#6B7280',
            }}
          >
            {activePage === item.id && (
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '4px',
                backgroundColor: '#7C3AED',
                boxShadow: '0 0 10px #7C3AED',
              }} />
            )}
            <span style={{ color: activePage === item.id ? '#d8b4fe' : '#6B7280' }}>
              <item.icon />
            </span>
            <span style={{
              marginLeft: '16px',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              {item.label}
            </span>
            {activePage === item.id && (
              <div style={{
                position: 'absolute',
                right: '16px',
                width: '4px',
                height: '4px',
                backgroundColor: '#7C3AED',
                borderRadius: '50%',
              }} />
            )}
          </button>
        ))}
      </div>

      <div style={{
        padding: '16px',
        borderTop: '1px solid rgba(76,29,149,0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            backgroundColor: 'rgba(88,28,135,0.3)',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(168,85,247,0.3)',
          }}>
            <span style={{ color: '#c4b5fd' }}><Icons.Wallet /></span>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#6B7280', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace" }}>Vault Balance</div>
            <div style={{ fontSize: '14px', fontFamily: "'JetBrains Mono', monospace", color: 'white' }}>12.4 ETH</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const stats = [
    { label: "Active Agents", val: "04", sub: "2 Idle", color: "purple" },
    { label: "24h Spend", val: "1.2 ETH", sub: "+0.4%", color: "blue" },
    { label: "Pipelines", val: "12", sub: "All Healthy", color: "emerald" },
    { label: "Block Height", val: "182934", sub: "Synced", color: "gray" },
  ];

  return (
    <div style={{ padding: '40px', height: '100%', overflowY: 'auto' }}>
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: 'bold',
            fontSize: '30px',
            color: 'white',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '4px',
          }}>Command Center</h2>
          <p style={{ color: '#9CA3AF', fontFamily: "'JetBrains Mono', monospace", fontSize: '14px' }}>
            System Status: <span style={{ color: '#34D399' }}>OPERATIONAL</span>
          </p>
        </div>
        <Button icon={Icons.Plus} variant="primary">New Agent</Button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
        {stats.map((stat, i) => (
          <TechCard key={i} className="" style={{ height: '128px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', color: '#6B7280', letterSpacing: '0.1em' }}>
                {stat.label}
              </span>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: stat.color === 'emerald' ? '#10B981' : '#A855F7',
                boxShadow: `0 0 8px ${stat.color === 'emerald' ? '#10B981' : '#A855F7'}`,
              }} />
            </div>
            <div>
              <div style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontWeight: 'bold',
                fontSize: '30px',
                color: 'white',
                textTransform: 'uppercase',
              }}>{stat.val}</div>
              <div style={{ fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", color: '#9CA3AF', marginTop: '4px' }}>{stat.sub}</div>
            </div>
          </TechCard>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <TechCard noPad style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{
            padding: '16px',
            borderBottom: '1px solid rgba(76,29,149,0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'rgba(30,16,46,0.5)',
          }}>
            <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '18px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'white' }}>Transaction Feed</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', backgroundColor: 'rgba(168,85,247,0.5)', borderRadius: '2px', display: 'block' }} />
              <span style={{ width: '8px', height: '8px', backgroundColor: 'rgba(168,85,247,0.2)', borderRadius: '2px', display: 'block' }} />
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                backgroundColor: 'rgba(13,5,24,0.5)',
                border: '1px solid rgba(76,29,149,0.2)',
                transition: 'border-color 0.2s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: '#c084fc' }}>14:02:2{item}</div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '14px', color: 'white', fontWeight: '500' }}>Uniswap Swap Execution</span>
                    <span style={{ fontSize: '12px', color: '#6B7280', fontFamily: "'JetBrains Mono', monospace" }}>0x7d...4f2a • Agent-0{item}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontFamily: "'JetBrains Mono', monospace", color: 'white' }}>-0.05 ETH</div>
                  <Badge color="green">Success</Badge>
                </div>
              </div>
            ))}
          </div>
        </TechCard>

        <TechCard noPad style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{
            padding: '16px',
            borderBottom: '1px solid rgba(76,29,149,0.3)',
            backgroundColor: 'rgba(30,16,46,0.5)',
          }}>
            <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '18px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'white' }}>Vault Composition</h3>
          </div>
          <div style={{ flex: 1, padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <div style={{
              width: '192px',
              height: '192px',
              borderRadius: '50%',
              border: '4px solid #2D1B4E',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                border: '4px solid transparent',
                borderTop: '4px solid #7C3AED',
                borderRight: '4px solid #7C3AED',
                borderRadius: '50%',
                transform: 'rotate(45deg)',
              }} />
              <div style={{
                position: 'absolute',
                inset: '8px',
                border: '1px dashed rgba(168,85,247,0.3)',
                borderRadius: '50%',
                animation: 'spin 8s linear infinite',
              }} />
              <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: "'JetBrains Mono', monospace", color: 'white' }}>72%</div>
                <div style={{ fontSize: '12px', color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Allocated</div>
              </div>
            </div>
          </div>
          <div style={{ padding: '16px', borderTop: '1px solid rgba(76,29,149,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", color: '#9CA3AF', marginBottom: '8px' }}>
              <span>ETH</span>
              <span style={{ color: 'white' }}>64%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", color: '#9CA3AF' }}>
              <span>USDC</span>
              <span style={{ color: 'white' }}>36%</span>
            </div>
          </div>
        </TechCard>
      </div>
    </div>
  );
};

const CanvasBuilder = () => {
  const [promptValue, setPromptValue] = useState("Check current gas prices on Arbitrum. If base fee < 0.1 gwei, proceed to top up.");

  const nodeTypes = [
    { type: 'trigger', label: 'Time Trigger', color: '#3B82F6' },
    { type: 'logic', label: 'Spend Limit', color: '#EAB308' },
    { type: 'ai', label: 'AI Decision', color: '#A855F7' },
    { type: 'action', label: 'Pay', color: '#10B981' },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', overflow: 'hidden' }}>
      <div style={{
        width: '256px',
        minWidth: '256px',
        backgroundColor: '#0F0518',
        borderRight: '1px solid rgba(76,29,149,0.3)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10,
      }}>
        <div style={{ padding: '16px', borderBottom: '1px solid rgba(76,29,149,0.3)' }}>
          <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '14px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.2em' }}>MODULES</h3>
        </div>
        <div style={{ padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {nodeTypes.map((node, i) => (
            <div key={i} style={{
              padding: '12px',
              backgroundColor: '#1A0F2E',
              borderLeft: `2px solid ${node.color}`,
              borderTop: '1px solid rgba(76,29,149,0.3)',
              borderBottom: '1px solid rgba(76,29,149,0.3)',
              borderRight: '1px solid rgba(76,29,149,0.3)',
              cursor: 'move',
              transition: 'all 0.2s',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: '14px', color: '#D1D5DB' }}>{node.label}</span>
              <span style={{ color: '#4B5563' }}><Icons.Plus /></span>
            </div>
          ))}
        </div>
        <div style={{
          marginTop: 'auto',
          padding: '16px',
          borderTop: '1px solid rgba(76,29,149,0.3)',
          backgroundColor: 'rgba(26,15,46,0.5)',
        }}>
          <div style={{ fontSize: '10px', color: '#6B7280', fontFamily: "'JetBrains Mono', monospace", marginBottom: '8px', textTransform: 'uppercase' }}>PIPELINE STATUS</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#EAB308', borderRadius: '50%' }} />
            <span style={{ fontSize: '12px', color: '#EAB308', fontWeight: 'bold', textTransform: 'uppercase' }}>Draft Mode</span>
          </div>
        </div>
      </div>

      <div style={{
        flex: 1,
        backgroundColor: '#0a0412',
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: 'radial-gradient(rgba(157,78,221,0.2) 1px, transparent 1px)',
        backgroundSize: '10px 10px',
      }}>
        <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 20, display: 'flex', gap: '8px' }}>
          <Button variant="secondary">Save</Button>
          <Button variant="secondary">Test</Button>
        </div>
        <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 20 }}>
          <Button variant="primary" icon={Icons.Play}>Deploy Agent</Button>
        </div>

        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}>
            <path d="M 400 300 C 500 300, 500 450, 600 450" fill="none" stroke="#4c1d95" strokeWidth="2" />
            <path d="M 780 450 C 850 450, 850 450, 900 450" fill="none" stroke="#4c1d95" strokeWidth="2" strokeDasharray="5,5" />
          </svg>

          <div style={{ position: 'absolute', top: '250px', left: '220px', pointerEvents: 'auto' }}>
            <TechCard noPad glow style={{ width: '192px', borderLeft: '4px solid #3B82F6' }}>
              <div style={{
                padding: '12px',
                borderBottom: '1px solid rgba(76,29,149,0.3)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'rgba(30,58,138,0.1)',
              }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: '#93C5FD' }}>TRIGGER</span>
                <span style={{ color: '#60A5FA' }}><Icons.Zap /></span>
              </div>
              <div style={{ padding: '12px', position: 'relative' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'white' }}>Daily 9:00 AM</div>
                <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '4px', fontFamily: "'JetBrains Mono', monospace" }}>CRON: 0 9 * * *</div>
                <div style={{
                  position: 'absolute',
                  right: '-6px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#3B82F6',
                  borderRadius: '50%',
                  border: '2px solid #1A0F2E',
                }} />
              </div>
            </TechCard>
          </div>

          <div style={{ position: 'absolute', top: '400px', left: '600px', pointerEvents: 'auto' }}>
            <TechCard noPad glow style={{ width: '192px', borderLeft: '4px solid #A855F7' }}>
              <div style={{
                padding: '12px',
                borderBottom: '1px solid rgba(76,29,149,0.3)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'rgba(88,28,135,0.1)',
              }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: '#d8b4fe' }}>AI LOGIC</span>
                <span style={{ color: '#c084fc' }}><Icons.Bot /></span>
              </div>
              <div style={{ padding: '12px', position: 'relative' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'white' }}>Analyze Gas</div>
                <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '4px', fontFamily: "'JetBrains Mono', monospace" }}>Model: Llama-3-70b</div>
                <div style={{
                  position: 'absolute',
                  left: '-6px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#6B7280',
                  borderRadius: '50%',
                  border: '2px solid #1A0F2E',
                }} />
                <div style={{
                  position: 'absolute',
                  right: '-6px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#A855F7',
                  borderRadius: '50%',
                  border: '2px solid #1A0F2E',
                }} />
              </div>
            </TechCard>
          </div>

          <div style={{ position: 'absolute', top: '400px', left: '900px', pointerEvents: 'auto' }}>
            <TechCard noPad style={{ width: '192px', borderLeft: '4px solid #10B981' }}>
              <div style={{
                padding: '12px',
                borderBottom: '1px solid rgba(76,29,149,0.3)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'rgba(6,78,59,0.1)',
              }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: '#6EE7B7' }}>ACTION</span>
                <span style={{ color: '#34D399' }}><Icons.Target /></span>
              </div>
              <div style={{ padding: '12px', position: 'relative' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'white' }}>Top Up Vault</div>
                <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '4px', fontFamily: "'JetBrains Mono', monospace" }}>Amt: 0.5 ETH</div>
                <div style={{
                  position: 'absolute',
                  left: '-6px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#10B981',
                  borderRadius: '50%',
                  border: '2px solid #1A0F2E',
                }} />
              </div>
            </TechCard>
          </div>
        </div>
      </div>

      <div style={{
        width: '320px',
        minWidth: '320px',
        backgroundColor: '#0F0518',
        borderLeft: '1px solid rgba(76,29,149,0.3)',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          padding: '16px',
          borderBottom: '1px solid rgba(76,29,149,0.3)',
          backgroundColor: 'rgba(30,16,46,0.3)',
        }}>
          <h3 style={{ fontFamily: "'Rajdhani', sans-serif", color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Node Configuration</h3>
        </div>
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label style={{ fontSize: '10px', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace", color: '#6B7280', display: 'block', marginBottom: '8px' }}>
              Instruction Prompt
            </label>
            <textarea
              style={{
                width: '100%',
                backgroundColor: '#0a0412',
                border: '1px solid rgba(76,29,149,0.5)',
                fontSize: '14px',
                padding: '12px',
                color: '#D1D5DB',
                fontFamily: "'JetBrains Mono', monospace",
                height: '128px',
                outline: 'none',
                resize: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              value={promptValue}
              onChange={(e) => setPromptValue(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '10px', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace", color: '#6B7280', display: 'block', marginBottom: '8px' }}>
              Thresholds
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{
                backgroundColor: '#0a0412',
                border: '1px solid rgba(76,29,149,0.5)',
                padding: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Min</span>
                <span style={{ fontSize: '14px', fontFamily: "'JetBrains Mono', monospace", color: 'white' }}>0.05</span>
              </div>
              <div style={{
                backgroundColor: '#0a0412',
                border: '1px solid rgba(76,29,149,0.5)',
                padding: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Max</span>
                <span style={{ fontSize: '14px', fontFamily: "'JetBrains Mono', monospace", color: 'white' }}>2.00</span>
              </div>
            </div>
          </div>

          <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(76,29,149,0.2)' }}>
            <label style={{ fontSize: '10px', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace", color: '#6B7280', display: 'block', marginBottom: '8px' }}>
              Adapter
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px',
              backgroundColor: '#1A0F2E',
              border: '1px solid rgba(76,29,149,0.3)',
            }}>
              <span style={{ fontSize: '14px', color: '#c084fc' }}>Arbitrum One</span>
              <div style={{ width: '8px', height: '8px', backgroundColor: '#10B981', borderRadius: '50%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [view, setView] = useState('landing');
  const [activePage, setActivePage] = useState('dashboard');

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&family=Inter:wght@300;400;500;600&display=swap');
      
      * { box-sizing: border-box; margin: 0; padding: 0; }
      
      body {
        background-color: #0D0518;
        color: #E2E8F0;
        font-family: 'Inter', sans-serif;
        overflow: hidden;
      }

      ::-webkit-scrollbar { width: 6px; height: 6px; }
      ::-webkit-scrollbar-track { background: #0f0518; }
      ::-webkit-scrollbar-thumb { background: #4c1d95; border-radius: 2px; }

      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  if (view === 'landing') {
    return <Landing onConnect={() => setView('app')} />;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', backgroundColor: '#0D0518' }}>
      <Sidebar activePage={activePage} setPage={setActivePage} />
      <main style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          height: '64px',
          borderBottom: '1px solid rgba(76,29,149,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          backgroundColor: 'rgba(15,5,24,0.9)',
          backdropFilter: 'blur(4px)',
          zIndex: 10,
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1 style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: '20px',
              color: 'white',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>
              {activePage === 'dashboard' ? 'Overview' :
               activePage === 'canvas' ? 'Pipeline Editor' :
               activePage.charAt(0).toUpperCase() + activePage.slice(1)}
            </h1>
            {activePage === 'canvas' && <Badge color="purple">Draft: v0.4.1</Badge>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", color: '#6B7280' }}>
              <span style={{ width: '6px', height: '6px', backgroundColor: '#10B981', borderRadius: '50%', display: 'inline-block' }} />
              RPC: 42ms
            </div>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '4px',
              border: '1px solid rgba(76,29,149,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}>
              <span style={{ color: '#9CA3AF' }}><Icons.Search /></span>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <div style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            backgroundImage: 'linear-gradient(rgba(76,29,149,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(76,29,149,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            opacity: 0.2,
            pointerEvents: 'none',
          }} />
          {activePage === 'dashboard' && <Dashboard />}
          {activePage === 'canvas' && <CanvasBuilder />}
          {activePage === 'agents' && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280', fontFamily: "'JetBrains Mono', monospace" }}>
              Agent Monitor Module Loading...
            </div>
          )}
          {activePage === 'settings' && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280', fontFamily: "'JetBrains Mono', monospace" }}>
              System Config Module Loading...
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;