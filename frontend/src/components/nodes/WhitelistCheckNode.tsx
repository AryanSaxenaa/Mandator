import { memo } from 'react';
import BaseNode from './BaseNode';
import { ListChecks } from 'lucide-react';

export default memo(function WhitelistCheckNode({ data }: { data: Record<string, unknown> }) {
  const config = (data?.config || {}) as Record<string, unknown>;
  // config.addresses is a newline-separated string from the config panel
  const addrStr = (config.addresses as string) || '';
  const count = addrStr ? addrStr.split('\n').filter((s: string) => s.trim()).length : 0;
  return (
    <BaseNode data={data} icon={ListChecks} label="Whitelist" color="#06B6D4" handles={{
      top: true,
      outputs: [
        { id: 'APPROVED', label: 'APPROVED', color: '#10B981' },
        { id: 'REJECTED', label: 'REJECTED', color: '#EF4444' },
      ],
    }}>
      <p style={{ color: 'var(--text-dim)' }}>{count} address{count !== 1 ? 'es' : ''}</p>
    </BaseNode>
  );
});
