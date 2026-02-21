import { memo } from 'react';
import BaseNode from './BaseNode';
import { Brain } from 'lucide-react';

export default memo(function AIDecisionNode({ data }) {
  return (
    <BaseNode
      data={data}
      icon={Brain}
      label="AI Decision"
      color="#EC4899"
      handles={{
        top: true,
        outputs: [
          { id: 'YES', label: 'Yes', color: '#10B981' },
          { id: 'NO', label: 'No', color: '#EF4444' },
        ],
      }}
    >
      <p className="truncate max-w-[160px]" style={{ color: 'var(--text-dim)' }}>
        {data?.prompt || 'No prompt set'}
      </p>
      <p className="mt-1" style={{ color: 'var(--text-dim)', opacity: 0.6 }}>
        {data?.model || 'llama-3.1-8b-instant'}
      </p>
    </BaseNode>
  );
});
