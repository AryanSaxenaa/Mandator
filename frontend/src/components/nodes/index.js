import StartNode from './StartNode';
import EndNode from './EndNode';
import TimeTriggerNode from './TimeTriggerNode';
import BalanceTriggerNode from './BalanceTriggerNode';
import WebhookTriggerNode from './WebhookTriggerNode';
import ManualTriggerNode from './ManualTriggerNode';
import SpendLimitCheckNode from './SpendLimitCheckNode';
import DailyBudgetGateNode from './DailyBudgetGateNode';
import WhitelistCheckNode from './WhitelistCheckNode';
import CooldownTimerNode from './CooldownTimerNode';
import AIDecisionNode from './AIDecisionNode';
import PayNode from './PayNode';
import AutoTopupNode from './AutoTopupNode';
import AlertNode from './AlertNode';
import LogNode from './LogNode';
import PausePipelineNode from './PausePipelineNode';

import {
  Play, Square, Clock, Wallet, Webhook, MousePointerClick,
  ShieldCheck, CalendarCheck, ListChecks, Timer,
  Brain, Send, ArrowUpCircle, Bell, FileText, PauseCircle,
} from 'lucide-react';

export const nodeTypes = {
  startNode: StartNode,
  endNode: EndNode,
  timeTriggerNode: TimeTriggerNode,
  balanceTriggerNode: BalanceTriggerNode,
  webhookTriggerNode: WebhookTriggerNode,
  manualTriggerNode: ManualTriggerNode,
  spendLimitCheckNode: SpendLimitCheckNode,
  dailyBudgetGateNode: DailyBudgetGateNode,
  whitelistCheckNode: WhitelistCheckNode,
  cooldownTimerNode: CooldownTimerNode,
  aiDecisionNode: AIDecisionNode,
  payNode: PayNode,
  autoTopupNode: AutoTopupNode,
  alertNode: AlertNode,
  logNode: LogNode,
  pausePipelineNode: PausePipelineNode,
};

export const nodeCategories = [
  {
    name: 'Entry / Exit',
    nodes: [
      { type: 'startNode', label: 'START', icon: Play, color: '#10B981' },
      { type: 'endNode', label: 'END', icon: Square, color: '#EF4444' },
    ],
  },
  {
    name: 'Triggers',
    nodes: [
      { type: 'timeTriggerNode', label: 'Time Trigger', icon: Clock, color: '#F59E0B' },
      { type: 'balanceTriggerNode', label: 'Balance Trigger', icon: Wallet, color: '#3B82F6' },
      { type: 'webhookTriggerNode', label: 'Webhook Trigger', icon: Webhook, color: '#8B5CF6' },
      { type: 'manualTriggerNode', label: 'Manual Trigger', icon: MousePointerClick, color: '#6366F1' },
    ],
  },
  {
    name: 'Logic',
    nodes: [
      { type: 'spendLimitCheckNode', label: 'Spend Limit', icon: ShieldCheck, color: '#F97316' },
      { type: 'dailyBudgetGateNode', label: 'Daily Budget', icon: CalendarCheck, color: '#F59E0B' },
      { type: 'whitelistCheckNode', label: 'Whitelist', icon: ListChecks, color: '#06B6D4' },
      { type: 'cooldownTimerNode', label: 'Cooldown', icon: Timer, color: '#A855F7' },
    ],
  },
  {
    name: 'AI',
    nodes: [
      { type: 'aiDecisionNode', label: 'AI Decision', icon: Brain, color: '#EC4899' },
    ],
  },
  {
    name: 'Actions',
    nodes: [
      { type: 'payNode', label: 'Pay', icon: Send, color: '#10B981' },
      { type: 'autoTopupNode', label: 'Auto Topup', icon: ArrowUpCircle, color: '#14B8A6' },
      { type: 'alertNode', label: 'Alert', icon: Bell, color: '#F59E0B' },
      { type: 'logNode', label: 'Log', icon: FileText, color: '#64748B' },
      { type: 'pausePipelineNode', label: 'Pause', icon: PauseCircle, color: '#EF4444' },
    ],
  },
];
