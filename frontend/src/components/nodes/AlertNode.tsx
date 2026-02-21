import { memo } from 'react';
import BaseNode from './BaseNode';
import { Bell } from 'lucide-react';

export default memo(function AlertNode({ data }: { data: Record<string, unknown> }) {
  const config = (data?.config || {}) as Record<string, unknown>;
  const msg = (config.message as string) || 'Alert';
  return (
    <BaseNode data={data} icon={Bell} label="Alert" color="#F59E0B" handles={{ top: true, bottom: true }}>
      <p className="truncate max-w-[160px]" style={{ color: 'var(--text-dim)' }}>{msg}</p>
    </BaseNode>
  );
});
