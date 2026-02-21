import { Router } from 'express';
import { randomUUID } from 'crypto';
import { getPipelines, getPipeline, addPipeline, updatePipeline, removePipeline, getAgents } from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const pipelines = await getPipelines();
    const sorted = [...pipelines].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    res.json(sorted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, nodes = [], edges = [] } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const now = new Date().toISOString();
    const pipeline = {
      id: randomUUID(),
      name,
      nodes,
      edges,
      createdAt: now,
      updatedAt: now,
    };
    await addPipeline(pipeline);
    res.status(201).json(pipeline);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const pipeline = await getPipeline(req.params.id);
    res.json(pipeline);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { nodes, edges, name } = req.body;
    const patch = { updatedAt: new Date().toISOString() };
    if (nodes !== undefined) patch.nodes = nodes;
    if (edges !== undefined) patch.edges = edges;
    if (name !== undefined) patch.name = name;
    const updated = await updatePipeline(req.params.id, patch);
    res.json(updated);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const agents = await getAgents();
    const linked = agents.find(a => a.pipelineId === req.params.id && a.status === 'active');
    if (linked) {
      return res.status(409).json({ error: `Pipeline is used by active agent "${linked.name}"` });
    }
    await removePipeline(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

export default router;
