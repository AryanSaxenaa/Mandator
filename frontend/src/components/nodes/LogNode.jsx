import { memo } from 'react';
import BaseNode from './BaseNode';
import { FileText } from 'lucide-react';

export default memo(function LogNode({ data }) {
  return (
    <BaseNode data={data} icon={FileText} label="Log" color="#64748B" handles={{ top: true, bottom: true }}>
      <p className="truncate max-w-[160px]" style={{ color: 'var(--text-dim)' }}>
        {data?.message || 'Log entry'}
      </p>
    </BaseNode>
  );
});
