import { memo } from 'react';
import BaseNode from './BaseNode';
import { PauseCircle } from 'lucide-react';

export default memo(function PausePipelineNode({ data }: { data: Record<string, unknown> }) {
  const config = (data?.config || {}) as Record<string, unknown>;
  const msg = (config.message as string) || 'Pipeline paused';
  return (
    <BaseNode data={data} icon={PauseCircle} label="Pause" color="#EF4444" handles={{ top: true }}>
      <p className="truncate max-w-[160px]" style={{ color: 'var(--text-dim)' }}>{msg}</p>
    </BaseNode>
  );
});
