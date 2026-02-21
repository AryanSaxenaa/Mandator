import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, 'data');
mkdirSync(dataDir, { recursive: true });

const defaultData = {
  pipelines: [],
  agents: [],
  journal: [],
  notifications: [],
};

const dbFile = join(dataDir, 'db.json');
const adapter = new JSONFile(dbFile);
const db = new Low(adapter, defaultData);

export async function initDb() {
  await db.read();
  if (!db.data.pipelines) db.data.pipelines = [];
  if (!db.data.agents) db.data.agents = [];
  if (!db.data.journal) db.data.journal = [];
  if (!db.data.notifications) db.data.notifications = [];
  await db.write();
}

export function getPipelines() {
  return db.data.pipelines;
}

export function getPipeline(id) {
  const p = db.data.pipelines.find(p => p.id === id);
  if (!p) throw new Error(`Pipeline ${id} not found`);
  return p;
}

export function getAgents() {
  return db.data.agents;
}

export function getAgent(id) {
  const a = db.data.agents.find(a => a.id === id);
  if (!a) throw new Error(`Agent ${id} not found`);
  return a;
}

export function getAgentByPipelineId(pipelineId) {
  return db.data.agents.find(a => a.pipelineId === pipelineId) || null;
}

export async function saveJournalEntry(entry) {
  db.data.journal.push(entry);
  await db.write();
}

export async function saveNotification(notif) {
  db.data.notifications.push(notif);
  await db.write();
}

export async function updateAgent(id, patch) {
  const agent = getAgent(id);
  Object.assign(agent, patch);
  await db.write();
  return agent;
}

export async function updatePipeline(id, patch) {
  const pipeline = getPipeline(id);
  Object.assign(pipeline, patch);
  await db.write();
  return pipeline;
}

export async function addPipeline(pipeline) {
  db.data.pipelines.push(pipeline);
  await db.write();
}

export async function addAgent(agent) {
  db.data.agents.push(agent);
  await db.write();
}

export async function removePipeline(id) {
  db.data.pipelines = db.data.pipelines.filter(p => p.id !== id);
  await db.write();
}

export async function removeAgent(id) {
  db.data.agents = db.data.agents.filter(a => a.id !== id);
  db.data.journal = db.data.journal.filter(j => j.agentId !== id);
  await db.write();
}

export function getJournal(agentId, opts = {}) {
  let entries = db.data.journal.filter(j => j.agentId === agentId);
  if (opts.nodeType) entries = entries.filter(j => j.nodeType === opts.nodeType);
  entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return entries;
}

export function getAllJournal() {
  return [...db.data.journal].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getDailySpent(agentId) {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  return db.data.journal
    .filter(j =>
      j.agentId === agentId &&
      j.nodeType === 'PAY' &&
      j.status === 'confirmed' &&
      new Date(j.timestamp).getTime() > cutoff
    )
    .reduce((sum, j) => sum + Number(j.amountWei || 0), 0);
}

export function getNotifications(opts = {}) {
  let notifs = [...db.data.notifications];
  if (opts.agentId) notifs = notifs.filter(n => n.agentId === opts.agentId);
  if (opts.unread) notifs = notifs.filter(n => !n.read);
  return notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function markNotificationRead(id) {
  const n = db.data.notifications.find(n => n.id === id);
  if (!n) throw new Error(`Notification ${id} not found`);
  n.read = true;
  await db.write();
  return n;
}

export default db;
