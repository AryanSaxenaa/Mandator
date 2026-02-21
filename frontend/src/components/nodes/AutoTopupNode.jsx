import { memo } from 'react';
import BaseNode from './BaseNode';
import { ArrowUpCircle } from 'lucide-react';

export default memo(function AutoTopupNode({ data }) {
  return (
    <BaseNode data={data} icon={ArrowUpCircle} label="Auto Topup" color="#14B8A6" handles={{ top: true, bottom: true }}>
      <p style={{ color: 'var(--text-dim)' }}>Amount: {data?.amount || '1'} ETH</p>
    </BaseNode>
  );
});
