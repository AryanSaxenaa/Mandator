import { memo } from 'react';
import BaseNode from './BaseNode';
import { MousePointerClick } from 'lucide-react';

export default memo(function ManualTriggerNode({ data }: { data: Record<string, unknown> }) {
  const config = (data?.config || {}) as Record<string, unknown>;
  const label = (config.buttonLabel as string) || 'Manual Run';
  return (
    <BaseNode data={data} icon={MousePointerClick} label="Manual Trigger" color="#6366F1" handles={{ bottom: true }}>
      <p style={{ color: 'var(--text-dim)' }}>{label}</p>
    </BaseNode>
  );
});
