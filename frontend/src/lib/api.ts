// In production set VITE_API_URL to your Railway backend URL, e.g.:
// https://mandator-production.up.railway.app  (include https://)
// Leave empty in dev — Vite proxy handles /api/* → localhost:3001
function resolveBase(): string {
  let url = (import.meta.env.VITE_API_URL as string | undefined) ?? '';
  if (!url) return '';
  url = url.replace(/\/$/, ''); // strip trailing slash
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url; // add protocol if missing
  return url;
}
const BASE = resolveBase();

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    ...opts,
  });
  if (res.status === 204) return undefined as T;
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || `Request failed: ${res.status}`);
  return body as T;
}

export function listPipelines() {
  return request<any[]>('/api/pipelines');
}

export function getPipeline(id: string) {
  return request<any>(`/api/pipelines/${id}`);
}

export function createPipeline(data: { name: string; nodes: any[]; edges: any[] }) {
  return request<any>('/api/pipelines', { method: 'POST', body: JSON.stringify(data) });
}

export function updatePipeline(id: string, data: any) {
  return request<any>(`/api/pipelines/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deletePipeline(id: string) {
  return request<void>(`/api/pipelines/${id}`, { method: 'DELETE' });
}

export function listAgents() {
  return request<any[]>('/api/agents');
}

export function getAgent(id: string) {
  return request<any>(`/api/agents/${id}`);
}

export function createAgent(data: { name: string; pipelineId: string; vaultAddress: string }) {
  return request<any>('/api/agents', { method: 'POST', body: JSON.stringify(data) });
}

export function updateAgent(id: string, patch: any) {
  return request<any>(`/api/agents/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
}

export function deleteAgent(id: string) {
  return request<void>(`/api/agents/${id}`, { method: 'DELETE' });
}

export function deployAgent(id: string) {
  return request<any>(`/api/agents/${id}/deploy`, { method: 'POST' });
}

export function pauseAgent(id: string) {
  return request<any>(`/api/agents/${id}/pause`, { method: 'POST' });
}

export function runAgent(id: string) {
  return request<any>(`/api/agents/${id}/run`, { method: 'POST' });
}

export function updateAgentBalance(id: string, balanceWei: string) {
  return request<any>(`/api/agents/${id}/balance`, { method: 'POST', body: JSON.stringify({ balanceWei }) });
}

export function listTransactions(agentId?: string, opts: { limit?: number; offset?: number; nodeType?: string } = {}) {
  const params = new URLSearchParams();
  if (agentId) params.set('agentId', agentId);
  if (opts.limit) params.set('limit', String(opts.limit));
  if (opts.offset) params.set('offset', String(opts.offset));
  if (opts.nodeType) params.set('nodeType', opts.nodeType);
  return request<{ entries: any[]; total: number; limit: number; offset: number }>(`/api/transactions?${params}`);
}

export function listNotifications(opts: { agentId?: string; unread?: boolean } = {}) {
  const params = new URLSearchParams();
  if (opts.agentId) params.set('agentId', opts.agentId);
  if (opts.unread) params.set('unread', 'true');
  return request<any[]>(`/api/transactions/notifications?${params}`);
}

export function markNotificationRead(id: string) {
  return request<any>(`/api/transactions/notifications/${id}/read`, { method: 'PATCH' });
}
