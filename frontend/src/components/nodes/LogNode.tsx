import { memo } from 'react';
import BaseNode from './BaseNode';
import { FileText } from 'lucide-react';

export default memo(function LogNode({ data }: { data: Record<string, unknown> }) {
  const config = (data?.config || {}) as Record<string, unknown>;
  const msg = (config.message as string) || 'Log';
  return (
    <BaseNode data={data} icon={FileText} label="Log" color="#64748B" handles={{ top: true, bottom: true }}>
      <p className="truncate max-w-[160px]" style={{ color: 'var(--text-dim)' }}>{msg}</p>
    </BaseNode>
  );
});
