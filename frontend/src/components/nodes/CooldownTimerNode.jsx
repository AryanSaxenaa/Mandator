import { memo } from 'react';
import BaseNode from './BaseNode';
import { Timer } from 'lucide-react';

export default memo(function CooldownTimerNode({ data }) {
  return (
    <BaseNode
      data={data}
      icon={Timer}
      label="Cooldown"
      color="#A855F7"
      handles={{
        top: true,
        outputs: [
          { id: 'READY', label: 'Ready', color: '#10B981' },
          { id: 'WAIT', label: 'Wait', color: '#F59E0B' },
        ],
      }}
    >
      <p style={{ color: 'var(--text-dim)' }}>{data?.minutes || '5'} min cooldown</p>
    </BaseNode>
  );
});
