import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set – DB calls will fail');
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

// ─── Initialisation ─────────────────────────────────────────
export async function initDb() {
  // Supabase tables are created via the SQL schema.
  // This is a no-op kept for backward compat with server.js boot.
  console.log('Supabase client ready →', supabaseUrl);
}

// ─── Pipelines ──────────────────────────────────────────────
export async function getPipelines() {
  const { data, error } = await supabase
    .from('pipelines')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(rowToPipeline);
}

export async function getPipeline(id) {
  const { data, error } = await supabase.from('pipelines').select('*').eq('id', id).single();
  if (error || !data) throw new Error(`Pipeline ${id} not found`);
  return rowToPipeline(data);
}

export async function addPipeline(pipeline) {
  const row = pipelineToRow(pipeline);
  const { error } = await supabase.from('pipelines').insert(row);
  if (error) throw error;
}

export async function updatePipeline(id, patch) {
  const updateData = {};
  if (patch.name !== undefined)  updateData.name  = patch.name;
  if (patch.nodes !== undefined) updateData.nodes = JSON.stringify(patch.nodes);
  if (patch.edges !== undefined) updateData.edges = JSON.stringify(patch.edges);
  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase.from('pipelines').update(updateData).eq('id', id).select().single();
  if (error) throw error;
  return rowToPipeline(data);
}

export async function removePipeline(id) {
  const { error } = await supabase.from('pipelines').delete().eq('id', id);
  if (error) throw error;
}

// ─── Agents ─────────────────────────────────────────────────
export async function getAgents() {
  const { data, error } = await supabase.from('agents').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(rowToAgent);
}

export async function getAgent(id) {
  const { data, error } = await supabase.from('agents').select('*').eq('id', id).single();
  if (error || !data) throw new Error(`Agent ${id} not found`);
  return rowToAgent(data);
}

export function getAgentByPipelineId(pipelineId) {
  // Kept async-capable; callers may await or not
  return supabase.from('agents').select('*').eq('pipeline_id', pipelineId).maybeSingle()
    .then(({ data }) => data ? rowToAgent(data) : null);
}

export async function addAgent(agent) {
  const row = agentToRow(agent);
  const { error } = await supabase.from('agents').insert(row);
  if (error) throw error;
}

export async function updateAgent(id, patch) {
  const updateData = {};
  for (const [k, v] of Object.entries(patch)) {
    updateData[camelToSnake(k)] = v;
  }
  const { data, error } = await supabase.from('agents').update(updateData).eq('id', id).select().single();
  if (error) throw error;
  return rowToAgent(data);
}

export async function removeAgent(id) {
  // journal + notifications cascade via FK, but delete explicitly to be safe
  await supabase.from('journal').delete().eq('agent_id', id);
  await supabase.from('notifications').delete().eq('agent_id', id);
  const { error } = await supabase.from('agents').delete().eq('id', id);
  if (error) throw error;
}

// ─── Journal ────────────────────────────────────────────────
export async function saveJournalEntry(entry) {
  const row = journalToRow(entry);
  const { error } = await supabase.from('journal').insert(row);
  if (error) throw error;
}

export async function getJournal(agentId, opts = {}) {
  let q = supabase.from('journal').select('*').eq('agent_id', agentId);
  if (opts.nodeType) q = q.eq('node_type', opts.nodeType);
  q = q.order('timestamp', { ascending: false });
  if (opts.limit) q = q.limit(opts.limit);
  if (opts.offset) q = q.range(opts.offset, opts.offset + (opts.limit || 50) - 1);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []).map(rowToJournal);
}

export async function getAllJournal(limit = 100) {
  const { data, error } = await supabase
    .from('journal')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []).map(rowToJournal);
}

export async function getDailySpent(agentId) {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('journal')
    .select('amount_wei')
    .eq('agent_id', agentId)
    .eq('node_type', 'PAY')
    .eq('status', 'confirmed')
    .gte('timestamp', cutoff);
  if (error) throw error;
  return (data || []).reduce((sum, j) => sum + Number(j.amount_wei || 0), 0);
}

// ─── Notifications ──────────────────────────────────────────
export async function saveNotification(notif) {
  const row = notificationToRow(notif);
  const { error } = await supabase.from('notifications').insert(row);
  if (error) throw error;
}

export async function getNotifications(opts = {}) {
  let q = supabase.from('notifications').select('*');
  if (opts.agentId) q = q.eq('agent_id', opts.agentId);
  if (opts.unread)  q = q.eq('read', false);
  q = q.order('created_at', { ascending: false });
  const { data, error } = await q;
  if (error) throw error;
  return (data || []).map(rowToNotification);
}

export async function markNotificationRead(id) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id)
    .select()
    .single();
  if (error || !data) throw new Error(`Notification ${id} not found`);
  return rowToNotification(data);
}

// ─── Row ↔ Object mappers (snake_case ↔ camelCase) ─────────

function camelToSnake(s) {
  return s.replace(/[A-Z]/g, m => '_' + m.toLowerCase());
}
function snakeToCamel(s) {
  return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function mapKeys(obj, fn) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) out[fn(k)] = v;
  return out;
}

function rowToPipeline(r) {
  return {
    id: r.id,
    name: r.name,
    nodes: typeof r.nodes === 'string' ? JSON.parse(r.nodes) : r.nodes || [],
    edges: typeof r.edges === 'string' ? JSON.parse(r.edges) : r.edges || [],
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function pipelineToRow(p) {
  return {
    id: p.id,
    name: p.name || 'Untitled Pipeline',
    nodes: JSON.stringify(p.nodes || []),
    edges: JSON.stringify(p.edges || []),
    created_at: p.createdAt || new Date().toISOString(),
    updated_at: p.updatedAt || new Date().toISOString(),
  };
}

function rowToAgent(r) {
  return {
    id: r.id,
    name: r.name,
    pipelineId: r.pipeline_id,
    status: r.status,
    vaultAddress: r.vault_address,
    lastRun: r.last_run,
    dailySpent: r.daily_spent,
    totalSpent: r.total_spent,
    createdAt: r.created_at,
    webhookUrl: r.webhook_url,
    webhookSecret: r.webhook_secret,
    lastKnownBalance: r.last_known_balance,
  };
}

function agentToRow(a) {
  return {
    id: a.id,
    name: a.name,
    pipeline_id: a.pipelineId,
    status: a.status || 'draft',
    vault_address: a.vaultAddress,
    last_run: a.lastRun || null,
    daily_spent: a.dailySpent || '0',
    total_spent: a.totalSpent || '0',
    created_at: a.createdAt || new Date().toISOString(),
    webhook_url: a.webhookUrl || null,
    webhook_secret: a.webhookSecret || null,
    last_known_balance: a.lastKnownBalance || null,
  };
}

function rowToJournal(r) {
  return {
    id: r.id,
    agentId: r.agent_id,
    pipelineId: r.pipeline_id,
    nodeId: r.node_id,
    nodeType: r.node_type,
    status: r.status,
    txHash: r.tx_hash,
    amount: r.amount,
    amountWei: r.amount_wei,
    to: r.to,
    memo: r.memo,
    error: r.error,
    result: r.result,
    timestamp: r.timestamp,
    ts: r.timestamp, // alias used by frontend
  };
}

function journalToRow(j) {
  return {
    id: j.id,
    agent_id: j.agentId,
    pipeline_id: j.pipelineId,
    node_id: j.nodeId,
    node_type: j.nodeType,
    status: j.status,
    tx_hash: j.txHash || null,
    amount: j.amount || null,
    amount_wei: j.amountWei || null,
    to: j.to || null,
    memo: j.memo || null,
    error: j.error || null,
    result: j.result ? JSON.stringify(j.result) : null,
    timestamp: j.timestamp || new Date().toISOString(),
  };
}

function rowToNotification(r) {
  return {
    id: r.id,
    agentId: r.agent_id,
    type: r.type,
    title: r.title,
    message: r.message,
    read: r.read,
    createdAt: r.created_at,
  };
}

function notificationToRow(n) {
  return {
    id: n.id,
    agent_id: n.agentId,
    type: n.type || 'info',
    title: n.title || '',
    message: n.message || '',
    read: n.read || false,
    created_at: n.createdAt || new Date().toISOString(),
  };
}

export default supabase;
