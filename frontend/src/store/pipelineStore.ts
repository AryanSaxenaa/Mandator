import { create } from 'zustand';
import type { Node, Edge } from 'reactflow';
import * as api from '../lib/api';

// Strip React Flow internal properties before serialising to JSON.
// Raw Node objects contain circular refs (__rf, internals) that crash JSON.stringify.
function sanitizeNode(n: Node): object {
  return {
    id: n.id,
    type: n.type,
    position: { x: n.position.x, y: n.position.y },
    data: n.data,
  };
}

function sanitizeEdge(e: Edge): object {
  return {
    id: e.id,
    source: e.source,
    target: e.target,
    ...(e.sourceHandle != null && { sourceHandle: e.sourceHandle }),
    ...(e.targetHandle != null && { targetHandle: e.targetHandle }),
    ...(e.type && { type: e.type }),
  };
}

export interface Pipeline {
  id: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
  createdAt: string;
  updatedAt: string;
}

interface PipelineState {
  pipelines: Pipeline[];
  activePipelineId: string | null;
  isDirty: boolean;
  isLoading: boolean;
  error: string | null;
  fetchPipelines: () => Promise<void>;
  savePipeline: (id: string, nodes: Node[], edges: Edge[]) => Promise<void>;
  createPipeline: (name: string) => Promise<Pipeline>;
  deletePipeline: (id: string) => Promise<void>;
  setActivePipeline: (id: string | null) => void;
  markDirty: () => void;
  markClean: () => void;
}

export const usePipelineStore = create<PipelineState>((set, get) => ({
  pipelines: [],
  activePipelineId: null,
  isDirty: false,
  isLoading: false,
  error: null,

  fetchPipelines: async () => {
    set({ isLoading: true, error: null });
    try {
      const pipelines = await api.listPipelines();
      set({ pipelines, isLoading: false });
    } catch (err: unknown) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  savePipeline: async (id, nodes, edges) => {
    const updated = await api.updatePipeline(id, {
      nodes: nodes.map(sanitizeNode),
      edges: edges.map(sanitizeEdge),
      updatedAt: new Date().toISOString(),
    });
    set({
      pipelines: get().pipelines.map(p => p.id === id ? { ...p, ...updated } : p),
      isDirty: false,
    });
  },

  createPipeline: async (name) => {
    const pipeline = await api.createPipeline({ name, nodes: [], edges: [] });
    set({ pipelines: [pipeline, ...get().pipelines] });
    return pipeline;
  },

  deletePipeline: async (id) => {
    await api.deletePipeline(id);
    set({
      pipelines: get().pipelines.filter(p => p.id !== id),
      activePipelineId: get().activePipelineId === id ? null : get().activePipelineId,
    });
  },

  setActivePipeline: (id) => set({ activePipelineId: id }),
  markDirty: () => set({ isDirty: true }),
  markClean: () => set({ isDirty: false }),
}));
