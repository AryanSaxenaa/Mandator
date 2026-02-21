import { memo } from 'react';
import BaseNode from './BaseNode';
import { CalendarCheck } from 'lucide-react';

export default memo(function DailyBudgetGateNode({ data }) {
  return (
    <BaseNode
      data={data}
      icon={CalendarCheck}
      label="Daily Budget"
      color="#F59E0B"
      handles={{
        top: true,
        outputs: [
          { id: 'PASS', label: 'Pass', color: '#10B981' },
          { id: 'BLOCK', label: 'Block', color: '#EF4444' },
        ],
      }}
    >
      <p style={{ color: 'var(--text-dim)' }}>Budget: {data?.budget || '5'} ETH/day</p>
    </BaseNode>
  );
});
