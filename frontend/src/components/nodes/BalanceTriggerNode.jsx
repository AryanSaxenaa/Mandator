import { memo } from 'react';
import BaseNode from './BaseNode';
import { Wallet } from 'lucide-react';

export default memo(function BalanceTriggerNode({ data }) {
  return (
    <BaseNode data={data} icon={Wallet} label="Balance Trigger" color="#3B82F6" handles={{ top: false, bottom: true }}>
      <p style={{ color: 'var(--text-dim)' }}>
        {data?.operator || 'below'} {data?.threshold || '0'} ETH
      </p>
    </BaseNode>
  );
});
