import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TransactionSignModal from './TransactionSignModal';

export default function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-dark)' }}>
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
      <TransactionSignModal />
    </div>
  );
}
