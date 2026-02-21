import { memo } from 'react';
import BaseNode from './BaseNode';
import { ListChecks } from 'lucide-react';

export default memo(function WhitelistCheckNode({ data }: { data: Record<string, unknown> }) {
  const config = (data?.config || {}) as Record<string, unknown>;
  const recipients = (config.recipients || []) as string[];
  return (
    <BaseNode data={data} icon={ListChecks} label="Whitelist" color="#06B6D4" handles={{
      top: true,
      outputs: [
        { id: 'APPROVED', label: 'APPROVED', color: '#10B981' },
        { id: 'REJECTED', label: 'REJECTED', color: '#EF4444' },
      ],
    }}>
      <p style={{ color: 'var(--text-dim)' }}>{recipients.length} address{recipients.length !== 1 ? 'es' : ''}</p>
    </BaseNode>
  );
});
