import { memo } from 'react';
import BaseNode from './BaseNode';
import { MousePointerClick } from 'lucide-react';

export default memo(function ManualTriggerNode({ data }) {
  return (
    <BaseNode data={data} icon={MousePointerClick} label="Manual Trigger" color="#6366F1" handles={{ top: false, bottom: true }}>
      <p style={{ color: 'var(--text-dim)' }}>Click to fire</p>
    </BaseNode>
  );
});
