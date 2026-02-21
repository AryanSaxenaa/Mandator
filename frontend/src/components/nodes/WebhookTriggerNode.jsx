import { memo } from 'react';
import BaseNode from './BaseNode';
import { Webhook } from 'lucide-react';

export default memo(function WebhookTriggerNode({ data }) {
  return (
    <BaseNode data={data} icon={Webhook} label="Webhook Trigger" color="#8B5CF6" handles={{ top: false, bottom: true }}>
      <p style={{ color: 'var(--text-dim)' }}>POST /webhook/:agentId</p>
    </BaseNode>
  );
});
