import { Router } from 'express';
import { getAgent } from './db.js';
import { executePipeline } from './executor.js';

export function createWebhookRouter(io) {
  const router = Router();

  router.post('/:agentId', async (req, res) => {
    try {
      let agent;
      try {
        agent = await getAgent(req.params.agentId);
      } catch {
        return res.status(404).json({ error: 'Agent not found' });
      }

      if (agent.status !== 'active') {
        return res.status(409).json({ error: 'Agent is not active' });
      }

      if (agent.webhookSecret && req.headers['x-webhook-secret'] !== agent.webhookSecret) {
        return res.status(401).json({ error: 'Invalid webhook secret' });
      }

      res.status(200).json({
        received: true,
        agentId: req.params.agentId,
        timestamp: new Date().toISOString(),
      });

      setImmediate(() => {
        executePipeline(agent.pipelineId, 'webhook', req.body, io).catch(err => {
          console.error(`Webhook execution failed for agent ${agent.id}:`, err.message);
        });
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
