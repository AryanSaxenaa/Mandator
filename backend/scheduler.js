import cron from 'node-cron';
import { getAgents, getPipeline } from './db.js';
import { executePipeline } from './executor.js';

const jobs = new Map();
const balancePolls = new Map();

export function parseTriggerToCron(config) {
  const type = config.intervalType || 'hours';
  const value = parseInt(config.intervalValue) || 1;

  // Custom cron expression — return as-is
  if (type === 'cron' && config.cronExpression) {
    return config.cronExpression;
  }

  // Daily at specific time
  if (type === 'daily' && config.specificTime) {
    const [h, m] = config.specificTime.split(':').map(Number);
    if (!isNaN(h) && !isNaN(m)) {
      return `${m} ${h} * * *`;
    }
  }

  switch (type) {
    case 'minutes':
      return `*/${Math.max(1, Math.min(59, value))} * * * *`;
    case 'hours':
      return `0 */${Math.max(1, Math.min(23, value))} * * *`;
    case 'days':
      return `0 0 */${Math.max(1, Math.min(30, value))} * *`;
    default:
      return '0 * * * *';
  }
}

export function registerCronJob(agentId, pipelineId, cronExpression, io) {
  cancelCronJob(agentId);
  if (!cron.validate(cronExpression)) {
    console.error(`Invalid cron expression for agent ${agentId}: ${cronExpression}`);
    return;
  }
  const task = cron.schedule(cronExpression, () => {
    executePipeline(pipelineId, 'cron', {}, io).catch(err => {
      console.error(`Cron execution failed for agent ${agentId}:`, err.message);
    });
  });
  jobs.set(agentId, task);
}

export function cancelCronJob(agentId) {
  const existing = jobs.get(agentId);
  if (existing) {
    existing.stop();
    jobs.delete(agentId);
  }
}

/**
 * Poll balance trigger nodes on a fixed interval (default 60s).
 * Each time it fires, the executor checks agent.lastKnownBalance against the
 * threshold — if the condition is not met the pipeline halts at that node.
 */
export function registerBalancePoll(agentId, pipelineId, triggerConfig, io) {
  cancelBalancePoll(agentId);
  const intervalMs = Math.max(10, parseInt(triggerConfig.pollIntervalSeconds) || 60) * 1000;
  const id = setInterval(() => {
    executePipeline(pipelineId, 'balance_poll', {}, io).catch(err => {
      console.error(`Balance poll failed for agent ${agentId}:`, err.message);
    });
  }, intervalMs);
  balancePolls.set(agentId, id);
  console.log(`Balance poll registered for agent ${agentId} every ${intervalMs / 1000}s`);
}

export function cancelBalancePoll(agentId) {
  const existing = balancePolls.get(agentId);
  if (existing) {
    clearInterval(existing);
    balancePolls.delete(agentId);
  }
}

export async function initScheduler(io) {
  const agents = await getAgents();
  for (const agent of agents) {
    if (agent.status !== 'active') continue;
    try {
      const pipeline = await getPipeline(agent.pipelineId);
      const timeTriggerNode = pipeline.nodes.find(n =>
        n.type === 'timeTriggerNode' || n.type === 'TIME_TRIGGER'
      );
      if (timeTriggerNode && timeTriggerNode.data?.config) {
        const cronExpr = parseTriggerToCron(timeTriggerNode.data.config);
        registerCronJob(agent.id, agent.pipelineId, cronExpr, io);
      }
      const balanceTriggerNode = pipeline.nodes.find(n =>
        n.type === 'balanceTriggerNode' || n.type === 'BALANCE_TRIGGER'
      );
      if (balanceTriggerNode && balanceTriggerNode.data?.config) {
        registerBalancePoll(agent.id, agent.pipelineId, balanceTriggerNode.data.config, io);
      }
    } catch (err) {
      console.error(`Failed to init scheduler for agent ${agent.id}:`, err.message);
    }
  }
}

export default { initScheduler, registerCronJob, cancelCronJob, parseTriggerToCron, registerBalancePoll, cancelBalancePoll };
