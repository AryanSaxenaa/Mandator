import { memo } from 'react';
import BaseNode from './BaseNode';
import { Timer } from 'lucide-react';

export default memo(function CooldownTimerNode({ data }: { data: Record<string, unknown> }) {
  const config = (data?.config || {}) as Record<string, unknown>;
  const secs = (config.cooldownSeconds as number) || 60;
  return (
    <BaseNode data={data} icon={Timer} label="Cooldown" color="#A855F7" handles={{
      top: true,
      outputs: [
        { id: 'READY', label: 'READY', color: '#10B981' },
        { id: 'WAIT', label: 'WAIT', color: '#F59E0B' },
      ],
    }}>
      <p style={{ color: 'var(--text-dim)' }}>{secs}s cooldown</p>
    </BaseNode>
  );
});
