import { memo } from 'react';
import BaseNode from './BaseNode';
import { CalendarCheck } from 'lucide-react';

export default memo(function DailyBudgetGateNode({ data }: { data: Record<string, unknown> }) {
  const config = (data?.config || {}) as Record<string, unknown>;
  const limit = config.dailyLimitWei ? `${Number(BigInt(config.dailyLimitWei as string)) / 1e18} ETH/day` : 'No limit';
  return (
    <BaseNode data={data} icon={CalendarCheck} label="Daily Budget" color="#F59E0B" handles={{
      top: true,
      outputs: [
        { id: 'PASS', label: 'PASS', color: '#10B981' },
        { id: 'BLOCK', label: 'BLOCK', color: '#EF4444' },
      ],
    }}>
      <p style={{ color: 'var(--text-dim)' }}>{limit}</p>
    </BaseNode>
  );
});
