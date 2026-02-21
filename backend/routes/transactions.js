import { Router } from 'express';
import { getJournal, getAllJournal, getNotifications, markNotificationRead } from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { agentId, limit = '50', offset = '0', nodeType } = req.query;
    const limitNum = Math.min(parseInt(limit) || 50, 200);
    const offsetNum = parseInt(offset) || 0;

    let entries;
    if (agentId) {
      entries = await getJournal(agentId, { nodeType: nodeType || undefined });
    } else {
      entries = await getAllJournal(limitNum + offsetNum);
    }
    const total = entries.length;
    entries = entries.slice(offsetNum, offsetNum + limitNum);

    res.json({ entries, total, limit: limitNum, offset: offsetNum });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/notifications', async (req, res) => {
  try {
    const { agentId, unread } = req.query;
    const notifs = await getNotifications({
      agentId: agentId || undefined,
      unread: unread === 'true',
    });
    res.json(notifs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/notifications/:id/read', async (req, res) => {
  try {
    const notif = await markNotificationRead(req.params.id);
    res.json(notif);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

export default router;
