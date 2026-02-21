import { memo } from 'react';
import BaseNode from './BaseNode';
import { Send } from 'lucide-react';

export default memo(function PayNode({ data }: { data: Record<string, unknown> }) {
  const config = (data?.config || {}) as Record<string, unknown>;
  const amountEth = config.amount ? `${config.amount}` : '?';
  const recipient = config.recipientAddress as string;
  return (
    <BaseNode data={data} icon={Send} label="Pay" color="#10B981" handles={{ top: true, bottom: true }}>
      <p style={{ color: 'var(--text-dim)' }}>
        {amountEth} ETH &rarr; {recipient ? `${recipient.slice(0, 8)}...` : 'recipient'}
      </p>
    </BaseNode>
  );
});
