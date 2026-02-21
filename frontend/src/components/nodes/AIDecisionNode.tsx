import { memo } from 'react';
import BaseNode from './BaseNode';
import { Brain } from 'lucide-react';

export default memo(function AIDecisionNode({ data }: { data: Record<string, unknown> }) {
  const config = (data?.config || {}) as Record<string, unknown>;
  const prompt = (config.prompt as string) || 'No prompt set';
  return (
    <BaseNode data={data} icon={Brain} label="AI Decision" color="#EC4899" handles={{
      top: true,
      outputs: [
        { id: 'YES', label: 'YES', color: '#10B981' },
        { id: 'NO', label: 'NO', color: '#EF4444' },
      ],
    }}>
      <p className="truncate max-w-[160px]" style={{ color: 'var(--text-dim)' }}>{prompt}</p>
    </BaseNode>
  );
});
