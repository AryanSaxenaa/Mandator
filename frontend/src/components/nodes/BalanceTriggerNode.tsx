import { memo } from 'react';
import BaseNode from './BaseNode';
import { Wallet } from 'lucide-react';

export default memo(function BalanceTriggerNode({ data }: { data: Record<string, unknown> }) {
  const config = (data?.config || {}) as Record<string, unknown>;
  const direction = (config.direction as string) || 'above';
  const threshold = config.threshold ? `${config.threshold} ETH` : '?';
  return (
    <BaseNode data={data} icon={Wallet} label="Balance Trigger" color="#3B82F6" handles={{ bottom: true }}>
      <p style={{ color: 'var(--text-dim)' }}>When {direction} {threshold}</p>
    </BaseNode>
  );
});
