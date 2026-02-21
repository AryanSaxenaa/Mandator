import cron from 'node-cron';
import { getAgents, getPipeline } from './db.js';
import { executePipeline } from './executor.js';

const jobs = new Map();

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

export async function initScheduler(io) {
  const agents = await getAgents();
  for (const agent of agents) {
    if (agent.status !== 'active') continue;
    try {
      const pipeline = await getPipeline(agent.pipelineId);
      const triggerNode = pipeline.nodes.find(n =>
        n.type === 'timeTriggerNode' || n.type === 'TIME_TRIGGER'
      );
      if (triggerNode && triggerNode.data?.config) {
        const cronExpr = parseTriggerToCron(triggerNode.data.config);
        registerCronJob(agent.id, agent.pipelineId, cronExpr, io);
      }
    } catch (err) {
      console.error(`Failed to init scheduler for agent ${agent.id}:`, err.message);
    }
  }
}

export default { initScheduler, registerCronJob, cancelCronJob, parseTriggerToCron };
