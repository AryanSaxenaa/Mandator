import { memo } from 'react';
import BaseNode from './BaseNode';
import { ListChecks } from 'lucide-react';

export default memo(function WhitelistCheckNode({ data }) {
  const count = data?.addresses ? data.addresses.split(',').filter(Boolean).length : 0;

  return (
    <BaseNode
      data={data}
      icon={ListChecks}
      label="Whitelist"
      color="#06B6D4"
      handles={{
        top: true,
        outputs: [
          { id: 'APPROVED', label: 'Approved', color: '#10B981' },
          { id: 'REJECTED', label: 'Rejected', color: '#EF4444' },
        ],
      }}
    >
      <p style={{ color: 'var(--text-dim)' }}>{count} address(es)</p>
    </BaseNode>
  );
});
