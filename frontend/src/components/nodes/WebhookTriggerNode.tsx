import { memo } from 'react';
import BaseNode from './BaseNode';
import { Webhook } from 'lucide-react';

export default memo(function WebhookTriggerNode({ data }: { data: Record<string, unknown> }) {
  return (
    <BaseNode data={data} icon={Webhook} label="Webhook Trigger" color="#8B5CF6" handles={{ bottom: true }}>
      <p style={{ color: 'var(--text-dim)' }}>Awaiting webhook call</p>
    </BaseNode>
  );
});
