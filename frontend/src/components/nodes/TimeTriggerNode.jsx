import { memo } from 'react';
import BaseNode from './BaseNode';
import { Clock } from 'lucide-react';

export default memo(function TimeTriggerNode({ data }) {
  return (
    <BaseNode data={data} icon={Clock} label="Time Trigger" color="#F59E0B" handles={{ top: false, bottom: true }}>
      <p style={{ color: 'var(--text-dim)' }}>Cron: {data?.cron || '* * * * *'}</p>
    </BaseNode>
  );
});
