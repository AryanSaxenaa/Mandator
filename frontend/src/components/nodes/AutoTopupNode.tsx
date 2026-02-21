import { memo } from 'react';
import BaseNode from './BaseNode';
import { ArrowUpCircle } from 'lucide-react';

export default memo(function AutoTopupNode({ data }: { data: Record<string, unknown> }) {
  const config = (data?.config || {}) as Record<string, unknown>;
  const amountEth = config.amountWei ? `${Number(BigInt(config.amountWei as string)) / 1e18}` : '?';
  return (
    <BaseNode data={data} icon={ArrowUpCircle} label="Auto Topup" color="#14B8A6" handles={{ top: true, bottom: true }}>
      <p style={{ color: 'var(--text-dim)' }}>{amountEth} ETH top-up</p>
    </BaseNode>
  );
});
