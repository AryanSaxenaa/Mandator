const API = '/api';

export async function fetchPipelines() {
  const res = await fetch(`${API}/pipelines`);
  return res.json();
}

export async function fetchPipeline(id) {
  const res = await fetch(`${API}/pipelines/${id}`);
  return res.json();
}

export async function createPipeline(data) {
  const res = await fetch(`${API}/pipelines`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updatePipeline(id, data) {
  const res = await fetch(`${API}/pipelines/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deletePipeline(id) {
  const res = await fetch(`${API}/pipelines/${id}`, { method: 'DELETE' });
  return res.json();
}

export async function fetchAgents() {
  const res = await fetch(`${API}/agents`);
  return res.json();
}

export async function fetchAgent(id) {
  const res = await fetch(`${API}/agents/${id}`);
  return res.json();
}

export async function createAgent(data) {
  const res = await fetch(`${API}/agents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateAgent(id, data) {
  const res = await fetch(`${API}/agents/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteAgent(id) {
  const res = await fetch(`${API}/agents/${id}`, { method: 'DELETE' });
  return res.json();
}

export async function fetchJournal(pipelineId) {
  const url = pipelineId ? `${API}/journal?pipelineId=${pipelineId}` : `${API}/journal`;
  const res = await fetch(url);
  return res.json();
}

export async function executePipeline(pipelineId, context = {}) {
  const res = await fetch(`${API}/execute/${pipelineId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(context),
  });
  return res.json();
}
