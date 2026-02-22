import { create } from 'zustand';
import type { Node, Edge } from 'reactflow';
import * as api from '../lib/api';

// Strip React Flow internal / DOM properties before serialising to JSON.
// React Flow injects __rf, internals, and rendered Handle elements (HTMLButtonElement)
// into node.data which contain circular refs that crash JSON.stringify.
function safeClone(obj: unknown): unknown {
  const seen = new WeakSet();
  return JSON.parse(JSON.stringify(obj, (_key, value) => {
    if (typeof value === 'object' && value !== null) {
      // Skip DOM nodes and React fibers
      if (value instanceof HTMLElement || value instanceof SVGElement) return undefined;
      if (seen.has(value)) return undefined;
      seen.add(value);
    }
    // Skip React-internal and React Flow-internal keys
    if (typeof _key === 'string' && (_key.startsWith('__react') || _key.startsWith('__rf') || _key === 'internals')) return undefined;
    // Skip functions
    if (typeof value === 'function') return undefined;
    return value;
  }));
}

function sanitizeNode(n: Node): object {
  // Only keep the data we actually need: label + config
  const cleanData: Record<string, unknown> = {
    label: n.data?.label,
    config: n.data?.config ?? {},
  };
  return {
    id: n.id,
    type: n.type,
    position: { x: n.position.x, y: n.position.y },
    data: safeClone(cleanData),
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

/** Coerce pipeline name to a plain string (DB may contain a serialised object). */
function safeName(v: unknown): string {
  if (typeof v === 'string' && v.length > 0) return v;
  return 'Untitled Pipeline';
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
      const raw = await api.listPipelines();
      const pipelines = raw.map((p: any) => ({ ...p, name: safeName(p.name) }));
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
    const pipeline = await api.createPipeline({ name: safeName(name), nodes: [], edges: [] });
    pipeline.name = safeName(pipeline.name);
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
