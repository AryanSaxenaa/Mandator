import { memo } from 'react';
import BaseNode from './BaseNode';
import { Clock } from 'lucide-react';

export default memo(function TimeTriggerNode({ data }: { data: Record<string, unknown> }) {
  const config = (data?.config || {}) as Record<string, unknown>;
  const interval = config.intervalValue || '?';
  const type = config.intervalType || 'hours';
  return (
    <BaseNode data={data} icon={Clock} label="Time Trigger" color="#F59E0B" handles={{ bottom: true }}>
      <p style={{ color: 'var(--text-dim)' }}>Every {String(interval)} {String(type)}</p>
    </BaseNode>
  );
});
