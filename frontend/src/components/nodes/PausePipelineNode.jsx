import { memo } from 'react';
import BaseNode from './BaseNode';
import { PauseCircle } from 'lucide-react';

export default memo(function PausePipelineNode({ data }) {
  return (
    <BaseNode data={data} icon={PauseCircle} label="Pause Pipeline" color="#EF4444" handles={{ top: true }}>
      <p style={{ color: 'var(--text-dim)' }}>Halts execution</p>
    </BaseNode>
  );
});
