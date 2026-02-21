import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAppStore } from './store/appStore';
import { useVaultBalance } from './hooks/useData';
import adapter from './adapters';
import socket from './lib/socket';

import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Canvas from './pages/Canvas';
import AgentMonitor from './pages/AgentMonitor';
import SettingsPage from './pages/Settings';
import AppLayout from './components/AppLayout';

export default function App() {
  const { wallet, setWallet, setVaultBalance } = useAppStore();
  const navigate = useNavigate();

  const { data: balanceData } = useVaultBalance(wallet?.address);

  useEffect(() => {
    if (balanceData) {
      setVaultBalance(balanceData);
    }
  }, [balanceData, setVaultBalance]);

  useEffect(() => {
    if (wallet) {
      socket.connect();
      return () => socket.disconnect();
    }
  }, [wallet]);

  const handleConnect = async () => {
    try {
      const walletInfo = await adapter.connectWallet();
      setWallet(walletInfo);
      navigate('/dashboard');
    } catch (err) {
      console.error('Wallet connection failed:', err);
    }
  };

  if (!wallet) {
    return <Landing onConnect={handleConnect} />;
  }

  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="canvas" element={<Canvas />} />
        <Route path="agent/:id" element={<AgentMonitor />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
