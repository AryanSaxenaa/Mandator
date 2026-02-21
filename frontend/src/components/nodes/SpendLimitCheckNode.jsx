import { memo } from 'react';
import BaseNode from './BaseNode';
import { ShieldCheck } from 'lucide-react';

export default memo(function SpendLimitCheckNode({ data }) {
  return (
    <BaseNode
      data={data}
      icon={ShieldCheck}
      label="Spend Limit"
      color="#F97316"
      handles={{
        top: true,
        outputs: [
          { id: 'PASS', label: 'Pass', color: '#10B981' },
          { id: 'BLOCK', label: 'Block', color: '#EF4444' },
        ],
      }}
    >
      <p style={{ color: 'var(--text-dim)' }}>Limit: {data?.limit || '1'} ETH</p>
    </BaseNode>
  );
});
