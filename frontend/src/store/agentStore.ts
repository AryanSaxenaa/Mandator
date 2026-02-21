import { create } from 'zustand';
import * as api from '../lib/api';

export interface Agent {
  id: string;
  name: string;
  pipelineId: string;
  status: 'active' | 'paused' | 'error' | 'idle';
  vaultAddress: string;
  lastRun: string | null;
  dailySpent: number;
  totalSpent: number;
  createdAt: string;
  webhookUrl: string;
  webhookSecret?: string;
  lastKnownBalance?: string;
}

interface AgentState {
  agents: Agent[];
  isLoading: boolean;
  error: string | null;
  fetchAgents: () => Promise<void>;
  createAgent: (data: { name: string; pipelineId: string; vaultAddress: string }) => Promise<Agent>;
  updateAgent: (id: string, patch: Partial<Agent>) => Promise<void>;
  deleteAgent: (id: string) => Promise<void>;
  deployAgent: (id: string) => Promise<void>;
  pauseAgent: (id: string) => Promise<void>;
  runAgent: (id: string) => Promise<void>;
}

export const useAgentStore = create<AgentState>((set, get) => ({
  agents: [],
  isLoading: false,
  error: null,

  fetchAgents: async () => {
    set({ isLoading: true, error: null });
    try {
      const agents = await api.listAgents();
      set({ agents, isLoading: false });
    } catch (err: unknown) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  createAgent: async (data) => {
    const agent = await api.createAgent(data);
    set({ agents: [agent, ...get().agents] });
    return agent;
  },

  updateAgent: async (id, patch) => {
    const updated = await api.updateAgent(id, patch);
    set({ agents: get().agents.map(a => a.id === id ? { ...a, ...updated } : a) });
  },

  deleteAgent: async (id) => {
    await api.deleteAgent(id);
    set({ agents: get().agents.filter(a => a.id !== id) });
  },

  deployAgent: async (id) => {
    const updated = await api.deployAgent(id);
    set({ agents: get().agents.map(a => a.id === id ? { ...a, ...updated } : a) });
  },

  pauseAgent: async (id) => {
    const updated = await api.pauseAgent(id);
    set({ agents: get().agents.map(a => a.id === id ? { ...a, ...updated } : a) });
  },

  runAgent: async (id) => {
    await api.runAgent(id);
  },
}));
