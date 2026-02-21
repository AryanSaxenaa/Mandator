import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getPipelinesDb, getAgentsDb, getJournalDb } from './db.js';
import { executePipeline } from './executor.js';

export function createRoutes(io) {
  const router = express.Router();

  // --- Pipelines ---
  router.get('/pipelines', async (req, res) => {
    const db = getPipelinesDb();
    await db.read();
    res.json(db.data.pipelines);
  });

  router.get('/pipelines/:id', async (req, res) => {
    const db = getPipelinesDb();
    await db.read();
    const pipeline = db.data.pipelines.find(p => p.id === req.params.id);
    if (!pipeline) return res.status(404).json({ error: 'Pipeline not found' });
    res.json(pipeline);
  });

  router.post('/pipelines', async (req, res) => {
    const db = getPipelinesDb();
    const pipeline = {
      id: uuidv4(),
      name: req.body.name || 'Untitled Pipeline',
      nodes: req.body.nodes || [],
      edges: req.body.edges || [],
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.data.pipelines.push(pipeline);
    await db.write();
    res.status(201).json(pipeline);
  });

  router.put('/pipelines/:id', async (req, res) => {
    const db = getPipelinesDb();
    await db.read();
    const idx = db.data.pipelines.findIndex(p => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Pipeline not found' });

    db.data.pipelines[idx] = {
      ...db.data.pipelines[idx],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    await db.write();
    res.json(db.data.pipelines[idx]);
  });

  router.delete('/pipelines/:id', async (req, res) => {
    const db = getPipelinesDb();
    await db.read();
    db.data.pipelines = db.data.pipelines.filter(p => p.id !== req.params.id);
    await db.write();
    res.json({ success: true });
  });

  // --- Agents ---
  router.get('/agents', async (req, res) => {
    const db = getAgentsDb();
    await db.read();
    res.json(db.data.agents);
  });

  router.get('/agents/:id', async (req, res) => {
    const db = getAgentsDb();
    await db.read();
    const agent = db.data.agents.find(a => a.id === req.params.id);
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    res.json(agent);
  });

  router.post('/agents', async (req, res) => {
    const db = getAgentsDb();
    const agent = {
      id: uuidv4(),
      name: req.body.name || 'Untitled Agent',
      pipelineId: req.body.pipelineId || null,
      status: 'idle',
      vaultAddress: req.body.vaultAddress || '',
      lastRun: null,
      dailySpent: 0,
    };
    db.data.agents.push(agent);
    await db.write();
    res.status(201).json(agent);
  });

  router.put('/agents/:id', async (req, res) => {
    const db = getAgentsDb();
    await db.read();
    const idx = db.data.agents.findIndex(a => a.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Agent not found' });

    db.data.agents[idx] = { ...db.data.agents[idx], ...req.body };
    await db.write();
    res.json(db.data.agents[idx]);
  });

  router.delete('/agents/:id', async (req, res) => {
    const db = getAgentsDb();
    await db.read();
    db.data.agents = db.data.agents.filter(a => a.id !== req.params.id);
    await db.write();
    res.json({ success: true });
  });

  // --- Journal ---
  router.get('/journal', async (req, res) => {
    const db = getJournalDb();
    await db.read();
    let entries = db.data.entries;
    if (req.query.pipelineId) {
      entries = entries.filter(e => e.pipelineId === req.query.pipelineId);
    }
    res.json(entries.slice(-100).reverse());
  });

  // --- Execute pipeline ---
  router.post('/execute/:pipelineId', async (req, res) => {
    const pDb = getPipelinesDb();
    await pDb.read();
    const pipeline = pDb.data.pipelines.find(p => p.id === req.params.pipelineId);
    if (!pipeline) return res.status(404).json({ error: 'Pipeline not found' });

    const context = {
      vault_balance: req.body.vault_balance ?? 10,
      daily_spent: req.body.daily_spent ?? 0,
      last_tx_amount: req.body.last_tx_amount ?? 0,
      last_tx_recipient: req.body.last_tx_recipient ?? '',
      pipeline_id: pipeline.id,
      agent_name: req.body.agent_name ?? 'manual',
      timestamp: new Date().toISOString(),
      trigger_type: 'manual',
      trigger_payload: req.body.trigger_payload ?? {},
    };

    try {
      const log = await executePipeline(pipeline, context, io);
      res.json({ success: true, log });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Webhook trigger ---
  router.post('/webhook/:agentId', async (req, res) => {
    const aDb = getAgentsDb();
    await aDb.read();
    const agent = aDb.data.agents.find(a => a.id === req.params.agentId);
    if (!agent || !agent.pipelineId) {
      return res.status(404).json({ error: 'Agent or pipeline not found' });
    }

    const pDb = getPipelinesDb();
    await pDb.read();
    const pipeline = pDb.data.pipelines.find(p => p.id === agent.pipelineId);
    if (!pipeline) return res.status(404).json({ error: 'Pipeline not found' });

    const context = {
      vault_balance: 10,
      daily_spent: agent.dailySpent || 0,
      last_tx_amount: 0,
      last_tx_recipient: '',
      pipeline_id: pipeline.id,
      agent_name: agent.name,
      timestamp: new Date().toISOString(),
      trigger_type: 'webhook',
      trigger_payload: req.body,
    };

    try {
      const log = await executePipeline(pipeline, context, io);
      agent.lastRun = new Date().toISOString();
      await aDb.write();
      res.json({ success: true, log });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
