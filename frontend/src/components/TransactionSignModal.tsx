import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, AlertTriangle, Loader2 } from 'lucide-react';
import { useExecutionStore } from '../store/executionStore';
import { adapter } from '../adapters';
import { socket } from '../lib/socket';
import { AppButton } from './ui/TechCard';

function formatWei(weiStr: string): string {
  const wei = BigInt(weiStr);
  const whole = wei / 10n ** 18n;
  const frac = wei % 10n ** 18n;
  const fracStr = frac.toString().padStart(18, '0').slice(0, 6);
  return `${whole}.${fracStr}`;
}

export default function TransactionSignModal() {
  const pendingSignature = useExecutionStore(s => s.pendingSignature);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!pendingSignature) return null;

  const { journalId, nodeId, to, amountWei, memo } = pendingSignature;

  const handleApprove = async () => {
    setSigning(true);
    setError(null);
    try {
      const result = await adapter.sendPayment({
        to,
        amountWei: BigInt(amountWei),
        memo,
      });
      socket.emit('tx:signed', {
        journalId,
        txHash: result.txHash,
        explorerUrl: result.explorerUrl,
      });
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Transaction failed';
      setError(msg);
      socket.emit('tx:rejected', {
        journalId,
        reason: msg,
      });
    } finally {
      setSigning(false);
    }
  };

  const handleReject = () => {
    socket.emit('tx:rejected', {
      journalId,
      reason: 'User rejected in UI',
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-md mx-4 p-6"
          style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-tech)',
          }}
        >
          <div className="absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2" style={{ borderColor: 'var(--accent)' }} />
          <div className="absolute -bottom-px -right-px w-3 h-3 border-b-2 border-r-2" style={{ borderColor: 'var(--accent)' }} />

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Send size={18} style={{ color: 'var(--accent)' }} />
              <h3 className="font-rajdhani font-bold text-lg uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
                Transaction Request
              </h3>
            </div>
            <button onClick={handleReject} className="p-1 hover:opacity-70">
              <X size={18} style={{ color: 'var(--text-dim)' }} />
            </button>
          </div>

          <div className="space-y-3 font-mono text-sm mb-6">
            <div className="flex justify-between" style={{ borderBottom: '1px solid var(--border-tech)', paddingBottom: 8 }}>
              <span style={{ color: 'var(--text-dim)' }}>To</span>
              <span style={{ color: 'var(--text-main)' }} className="truncate ml-4 max-w-[200px]">{to}</span>
            </div>
            <div className="flex justify-between" style={{ borderBottom: '1px solid var(--border-tech)', paddingBottom: 8 }}>
              <span style={{ color: 'var(--text-dim)' }}>Amount</span>
              <span style={{ color: 'var(--success)' }} className="font-bold">{formatWei(amountWei)} ETH</span>
            </div>
            {memo && (
              <div className="flex justify-between" style={{ borderBottom: '1px solid var(--border-tech)', paddingBottom: 8 }}>
                <span style={{ color: 'var(--text-dim)' }}>Memo</span>
                <span style={{ color: 'var(--text-main)' }}>{memo}</span>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 text-xs font-mono" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <AlertTriangle size={14} className="text-red-400 shrink-0" />
              <span className="text-red-400">{error}</span>
            </div>
          )}

          <div className="flex gap-3">
            <AppButton variant="danger" onClick={handleReject} disabled={signing} className="flex-1">
              Reject
            </AppButton>
            <AppButton variant="primary" onClick={handleApprove} disabled={signing} className="flex-1">
              {signing ? <Loader2 size={16} className="animate-spin" /> : null}
              {signing ? 'Signing...' : 'Approve'}
            </AppButton>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
