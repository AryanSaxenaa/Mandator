import { memo } from 'react';
import BaseNode from './BaseNode';
import { Send } from 'lucide-react';

export default memo(function PayNode({ data }) {
  return (
    <BaseNode data={data} icon={Send} label="Pay" color="#10B981" handles={{ top: true, bottom: true }}>
      <p style={{ color: 'var(--text-dim)' }}>
        {data?.amount || '?'} ETH &rarr; {data?.recipient ? `${data.recipient.slice(0, 8)}...` : 'recipient'}
      </p>
    </BaseNode>
  );
});
