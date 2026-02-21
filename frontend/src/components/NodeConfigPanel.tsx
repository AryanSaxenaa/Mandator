import { useState, useEffect } from 'react';
import type { Node } from 'reactflow';
import { Copy, ExternalLink, Zap } from 'lucide-react';
import { AppButton } from './ui/TechCard';

interface Props {
  node: Node;
  onConfigChange: (config: Record<string, unknown>) => void;
  linkedAgent?: { id: string; webhookUrl?: string; webhookSecret?: string } | null;
}

function ConfigField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="text-[10px] uppercase tracking-wider font-mono font-bold block mb-1" style={{ color: 'var(--text-dim)' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-2 py-1.5 text-xs font-mono outline-none"
      style={{ background: 'var(--bg-dark)', color: 'var(--text-main)', border: '1px solid var(--border-tech)' }}
    />
  );
}

function NumberInput({ value, onChange, min, step, placeholder }: { value: number | string; onChange: (v: number) => void; min?: number; step?: number; placeholder?: string }) {
  return (
    <input
      type="number"
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      min={min}
      step={step}
      placeholder={placeholder}
      className="w-full px-2 py-1.5 text-xs font-mono outline-none"
      style={{ background: 'var(--bg-dark)', color: 'var(--text-main)', border: '1px solid var(--border-tech)' }}
    />
  );
}

function SelectInput({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-2 py-1.5 text-xs font-mono outline-none"
      style={{ background: 'var(--bg-dark)', color: 'var(--text-main)', border: '1px solid var(--border-tech)' }}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function TextArea({ value, onChange, placeholder, rows }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows || 3}
      className="w-full px-2 py-1.5 text-xs font-mono outline-none resize-none"
      style={{ background: 'var(--bg-dark)', color: 'var(--text-main)', border: '1px solid var(--border-tech)' }}
    />
  );
}

export default function NodeConfigPanel({ node, onConfigChange, linkedAgent }: Props) {
  const config = (node.data?.config || {}) as Record<string, any>;

  const update = (key: string, value: unknown) => {
    onConfigChange({ ...config, [key]: value });
  };

  const nodeType = node.type || '';

  return (
    <div>
      <h3 className="font-rajdhani font-bold text-sm uppercase tracking-wider mb-1" style={{ color: 'var(--text-main)' }}>
        Configure Node
      </h3>
      <p className="text-[10px] font-mono mb-4" style={{ color: 'var(--text-dim)' }}>
        {node.data?.label || nodeType} — {node.id}
      </p>

      {/* Label */}
      <ConfigField label="Label">
        <TextInput
          value={node.data?.label || ''}
          onChange={v => onConfigChange({ ...config, __label: v })}
          placeholder="Node label"
        />
      </ConfigField>

      {/* Type-specific configs */}
      {renderNodeConfig(nodeType, config, update, linkedAgent)}
    </div>
  );
}

function renderNodeConfig(
  nodeType: string,
  config: Record<string, any>,
  update: (key: string, value: unknown) => void,
  linkedAgent?: { id: string; webhookUrl?: string; webhookSecret?: string } | null,
) {
  switch (nodeType) {
    case 'startNode':
      return (
        <p className="text-xs font-mono" style={{ color: 'var(--text-dim)' }}>
          Entry point. No configuration needed.
        </p>
      );

    case 'endNode':
      return (
        <p className="text-xs font-mono" style={{ color: 'var(--text-dim)' }}>
          Terminal node. Pipeline ends here.
        </p>
      );

    case 'timeTriggerNode':
      return (
        <>
          <ConfigField label="Interval Type">
            <SelectInput
              value={config.intervalType || 'minutes'}
              onChange={v => update('intervalType', v)}
              options={[
                { value: 'minutes', label: 'Every N Minutes' },
                { value: 'hours', label: 'Every N Hours' },
                { value: 'daily', label: 'Daily at Time' },
                { value: 'cron', label: 'Custom Cron' },
              ]}
            />
          </ConfigField>
          {config.intervalType === 'cron' ? (
            <ConfigField label="Cron Expression">
              <TextInput value={config.cronExpression || ''} onChange={v => update('cronExpression', v)} placeholder="*/5 * * * *" />
            </ConfigField>
          ) : config.intervalType === 'daily' ? (
            <ConfigField label="Time (HH:MM)">
              <TextInput value={config.specificTime || ''} onChange={v => update('specificTime', v)} placeholder="09:00" />
            </ConfigField>
          ) : (
            <ConfigField label="Interval Value">
              <NumberInput value={config.intervalValue || 5} onChange={v => update('intervalValue', v)} min={1} />
            </ConfigField>
          )}
        </>
      );

    case 'balanceTriggerNode':
      return (
        <>
          <ConfigField label="Direction">
            <SelectInput
              value={config.direction || 'below'}
              onChange={v => update('direction', v)}
              options={[
                { value: 'below', label: 'Falls Below' },
                { value: 'above', label: 'Rises Above' },
              ]}
            />
          </ConfigField>
          <ConfigField label="Threshold (ETH)">
            <NumberInput value={config.threshold || ''} onChange={v => update('threshold', v)} min={0} step={0.001} placeholder="0.1" />
          </ConfigField>
        </>
      );

    case 'webhookTriggerNode':
      return (
        <>
          {linkedAgent?.webhookUrl ? (
            <>
              <ConfigField label="Webhook URL">
                <div className="flex gap-1">
                  <input
                    readOnly
                    value={linkedAgent.webhookUrl}
                    className="flex-1 px-2 py-1.5 text-[10px] font-mono outline-none"
                    style={{ background: 'var(--bg-dark)', color: 'var(--text-main)', border: '1px solid var(--border-tech)' }}
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(linkedAgent.webhookUrl!)}
                    className="px-2 py-1"
                    style={{ border: '1px solid var(--border-tech)' }}
                  >
                    <Copy size={12} />
                  </button>
                </div>
              </ConfigField>
              {linkedAgent.webhookSecret && (
                <ConfigField label="Secret">
                  <div className="flex gap-1">
                    <input
                      readOnly
                      value={linkedAgent.webhookSecret}
                      className="flex-1 px-2 py-1.5 text-[10px] font-mono outline-none"
                      style={{ background: 'var(--bg-dark)', color: 'var(--text-main)', border: '1px solid var(--border-tech)' }}
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(linkedAgent.webhookSecret!)}
                      className="px-2 py-1"
                      style={{ border: '1px solid var(--border-tech)' }}
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                </ConfigField>
              )}
            </>
          ) : (
            <p className="text-xs font-mono" style={{ color: 'var(--text-dim)' }}>
              Deploy this pipeline as an agent to get a webhook URL.
            </p>
          )}
        </>
      );

    case 'manualTriggerNode':
      return (
        <p className="text-xs font-mono" style={{ color: 'var(--text-dim)' }}>
          Triggered manually via the "Run" button.
        </p>
      );

    case 'spendLimitCheckNode':
      return (
        <>
          <ConfigField label="Max Amount Per Tx (ETH)">
            <NumberInput value={config.maxAmount || ''} onChange={v => update('maxAmount', v)} min={0} step={0.001} placeholder="0.5" />
          </ConfigField>
          <ConfigField label="On Exceed">
            <SelectInput
              value={config.onExceed || 'block'}
              onChange={v => update('onExceed', v)}
              options={[
                { value: 'block', label: 'Block Execution' },
                { value: 'alert', label: 'Alert & Continue' },
              ]}
            />
          </ConfigField>
        </>
      );

    case 'dailyBudgetGateNode':
      return (
        <>
          <ConfigField label="Daily Budget (ETH)">
            <NumberInput value={config.dailyBudget || ''} onChange={v => update('dailyBudget', v)} min={0} step={0.01} placeholder="1.0" />
          </ConfigField>
        </>
      );

    case 'whitelistCheckNode':
      return (
        <>
          <ConfigField label="Whitelisted Addresses">
            <TextArea
              value={config.addresses || ''}
              onChange={v => update('addresses', v)}
              placeholder="0x123...abc&#10;0x456...def&#10;One address per line"
              rows={5}
            />
          </ConfigField>
        </>
      );

    case 'cooldownTimerNode':
      return (
        <>
          <ConfigField label="Cooldown (seconds)">
            <NumberInput value={config.cooldownSeconds || 60} onChange={v => update('cooldownSeconds', v)} min={1} placeholder="60" />
          </ConfigField>
        </>
      );

    case 'aiDecisionNode':
      return (
        <>
          <ConfigField label="System Prompt">
            <TextArea
              value={config.prompt || ''}
              onChange={v => update('prompt', v)}
              placeholder="You are a DeFi advisor. Respond APPROVE or REJECT based on market conditions."
              rows={5}
            />
          </ConfigField>
          <ConfigField label="Context Template">
            <TextArea
              value={config.contextTemplate || ''}
              onChange={v => update('contextTemplate', v)}
              placeholder="Balance: {{balance}} ETH. Amount: {{amount}} ETH."
              rows={3}
            />
          </ConfigField>
        </>
      );

    case 'payNode':
      return (
        <>
          <ConfigField label="Recipient Address">
            <TextInput value={config.recipientAddress || ''} onChange={v => update('recipientAddress', v)} placeholder="0x..." />
          </ConfigField>
          <ConfigField label="Amount (ETH)">
            <NumberInput value={config.amount || ''} onChange={v => update('amount', v)} min={0} step={0.0001} placeholder="0.01" />
          </ConfigField>
          <ConfigField label="Memo">
            <TextInput value={config.memo || ''} onChange={v => update('memo', v)} placeholder="Payment for services" />
          </ConfigField>
        </>
      );

    case 'autoTopupNode':
      return (
        <>
          <ConfigField label="Target Address">
            <TextInput value={config.targetAddress || ''} onChange={v => update('targetAddress', v)} placeholder="0x..." />
          </ConfigField>
          <ConfigField label="Min Balance Threshold (ETH)">
            <NumberInput value={config.minBalance || ''} onChange={v => update('minBalance', v)} min={0} step={0.001} placeholder="0.05" />
          </ConfigField>
          <ConfigField label="Topup Amount (ETH)">
            <NumberInput value={config.topupAmount || ''} onChange={v => update('topupAmount', v)} min={0} step={0.001} placeholder="0.1" />
          </ConfigField>
        </>
      );

    case 'alertNode':
      return (
        <>
          <ConfigField label="Alert Message">
            <TextArea
              value={config.message || ''}
              onChange={v => update('message', v)}
              placeholder="Alert: Pipeline event triggered"
              rows={3}
            />
          </ConfigField>
          <ConfigField label="Severity">
            <SelectInput
              value={config.severity || 'info'}
              onChange={v => update('severity', v)}
              options={[
                { value: 'info', label: 'Info' },
                { value: 'warning', label: 'Warning' },
                { value: 'critical', label: 'Critical' },
              ]}
            />
          </ConfigField>
        </>
      );

    case 'logNode':
      return (
        <>
          <ConfigField label="Log Message">
            <TextArea
              value={config.message || ''}
              onChange={v => update('message', v)}
              placeholder="Execution reached this point"
              rows={3}
            />
          </ConfigField>
          <ConfigField label="Log Level">
            <SelectInput
              value={config.level || 'info'}
              onChange={v => update('level', v)}
              options={[
                { value: 'debug', label: 'Debug' },
                { value: 'info', label: 'Info' },
                { value: 'warn', label: 'Warn' },
                { value: 'error', label: 'Error' },
              ]}
            />
          </ConfigField>
        </>
      );

    case 'pausePipelineNode':
      return (
        <>
          <ConfigField label="Pause Reason">
            <TextArea
              value={config.reason || ''}
              onChange={v => update('reason', v)}
              placeholder="Safety threshold exceeded"
              rows={2}
            />
          </ConfigField>
        </>
      );

    default:
      return (
        <p className="text-xs font-mono" style={{ color: 'var(--text-dim)' }}>
          Unknown node type: {nodeType}
        </p>
      );
  }
}
