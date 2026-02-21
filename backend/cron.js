import cron from 'node-cron';
import { getPipelinesDb, getAgentsDb } from './db.js';
import { executePipeline } from './executor.js';

export function startCronJobs(io) {
  cron.schedule('* * * * *', async () => {
    const aDb = getAgentsDb();
    await aDb.read();

    const activeAgents = aDb.data.agents.filter(a => a.status === 'active' && a.pipelineId);

    for (const agent of activeAgents) {
      const pDb = getPipelinesDb();
      await pDb.read();
      const pipeline = pDb.data.pipelines.find(p => p.id === agent.pipelineId);
      if (!pipeline || pipeline.status !== 'active') continue;

      const hasTimeTrigger = pipeline.nodes.some(n => n.type === 'timeTriggerNode');
      if (!hasTimeTrigger) continue;

      const context = {
        vault_balance: 10,
        daily_spent: agent.dailySpent || 0,
        last_tx_amount: 0,
        last_tx_recipient: '',
        pipeline_id: pipeline.id,
        agent_name: agent.name,
        timestamp: new Date().toISOString(),
        trigger_type: 'cron',
        trigger_payload: {},
        last_run_timestamp: agent.lastRun ? new Date(agent.lastRun).getTime() : 0,
      };

      try {
        await executePipeline(pipeline, context, io);
        agent.lastRun = new Date().toISOString();
        await aDb.write();
      } catch (err) {
        console.error(`Cron execution error for agent ${agent.id}:`, err.message);
      }
    }
  });

  console.log('[cron] Pipeline scheduler running (every minute)');
}
