import { memo } from 'react';
import BaseNode from './BaseNode';
import { ShieldCheck } from 'lucide-react';

export default memo(function SpendLimitCheckNode({ data }: { data: Record<string, unknown> }) {
  const config = (data?.config || {}) as Record<string, unknown>;
  const limit = config.maxAmount ? `${config.maxAmount} ETH` : 'No limit';
  return (
    <BaseNode data={data} icon={ShieldCheck} label="Spend Limit" color="#F97316" handles={{
      top: true,
      outputs: [
        { id: 'PASS', label: 'PASS', color: '#10B981' },
        { id: 'BLOCK', label: 'BLOCK', color: '#EF4444' },
      ],
    }}>
      <p style={{ color: 'var(--text-dim)' }}>Max: {limit}</p>
    </BaseNode>
  );
});
