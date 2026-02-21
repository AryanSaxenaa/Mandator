import { Router } from 'express';
import { randomUUID } from 'crypto';
import { getAgents, getAgent, addAgent, updateAgent, removeAgent, getJournal, getDailySpent, getPipeline } from '../db.js';
import { executePipeline } from '../executor.js';

export function createAgentsRouter(io, scheduler) {
  const router = Router();

  router.get('/', async (req, res) => {
    try {
      const agents = await getAgents();
      const enriched = [];
      for (const a of agents) {
        const dailySpent = await getDailySpent(a.id);
        const recentJournal = (await getJournal(a.id)).slice(0, 5);
        enriched.push({ ...a, dailySpent, recentJournal });
      }
      enriched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      res.json(enriched);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/', async (req, res) => {
    try {
      const { name, pipelineId, vaultAddress } = req.body;
      if (!name || !pipelineId || !vaultAddress) {
        return res.status(400).json({ error: 'name, pipelineId, and vaultAddress are required' });
      }
      try { await getPipeline(pipelineId); } catch {
        return res.status(400).json({ error: 'Pipeline not found' });
      }
      const id = randomUUID();
      const agent = {
        id,
        name,
        pipelineId,
        status: 'idle',
        vaultAddress,
        lastRun: null,
        dailySpent: 0,
        totalSpent: 0,
        createdAt: new Date().toISOString(),
        webhookUrl: `/webhook/${id}`,
        webhookSecret: randomUUID(),
        lastKnownBalance: '0',
      };
      await addAgent(agent);
      res.status(201).json(agent);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const agent = await getAgent(req.params.id);
      const journal = (await getJournal(req.params.id)).slice(0, 20);
      const dailySpent = await getDailySpent(agent.id);
      res.json({ ...agent, recentJournal: journal, dailySpent });
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  });

  router.patch('/:id', async (req, res) => {
    try {
      const allowed = ['name', 'vaultAddress', 'status'];
      const patch = {};
      for (const key of allowed) {
        if (req.body[key] !== undefined) patch[key] = req.body[key];
      }
      const updated = await updateAgent(req.params.id, patch);
      res.json(updated);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  });

  router.delete('/:id', async (req, res) => {
    try {
      if (scheduler) {
        scheduler.cancelCronJob(req.params.id);
        scheduler.cancelBalancePoll(req.params.id);
      }
      await removeAgent(req.params.id);
      res.status(204).end();
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  });

  router.post('/:id/deploy', async (req, res) => {
    try {
      const agent = await updateAgent(req.params.id, { status: 'active', lastRun: null });
      if (scheduler) {
        try {
          const pipeline = await getPipeline(agent.pipelineId);
          const timeTriggerNode = pipeline.nodes.find(n =>
            n.type === 'timeTriggerNode' || n.type === 'TIME_TRIGGER'
          );
          if (timeTriggerNode && timeTriggerNode.data?.config) {
            const cronExpr = scheduler.parseTriggerToCron(timeTriggerNode.data.config);
            scheduler.registerCronJob(agent.id, agent.pipelineId, cronExpr, io);
          }
          const balanceTriggerNode = pipeline.nodes.find(n =>
            n.type === 'balanceTriggerNode' || n.type === 'BALANCE_TRIGGER'
          );
          if (balanceTriggerNode && balanceTriggerNode.data?.config) {
            scheduler.registerBalancePoll(agent.id, agent.pipelineId, balanceTriggerNode.data.config, io);
          }
        } catch { /* no trigger nodes */ }
      }
      res.json(agent);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  });

  router.post('/:id/pause', async (req, res) => {
    try {
      if (scheduler) {
        scheduler.cancelCronJob(req.params.id);
        scheduler.cancelBalancePoll(req.params.id);
      }
      const agent = await updateAgent(req.params.id, { status: 'paused' });
      res.json(agent);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  });

  router.post('/:id/run', async (req, res) => {
    try {
      const agent = await getAgent(req.params.id);
      if (agent.status === 'paused') {
        return res.status(409).json({ error: 'Agent is paused' });
      }
      await updateAgent(req.params.id, { status: 'active' });
      setImmediate(() => {
        executePipeline(agent.pipelineId, 'manual', {}, io).catch(err => {
          console.error(`Manual execution failed for agent ${agent.id}:`, err.message);
        });
      });
      res.status(202).json({ message: 'Execution started' });
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  });

  router.post('/:id/balance', async (req, res) => {
    try {
      const { balanceWei } = req.body;
      await updateAgent(req.params.id, { lastKnownBalance: balanceWei });
      res.json({ ok: true });
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  });

  return router;
}
