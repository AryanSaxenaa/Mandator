import { create } from 'zustand';

export interface LogEntry {
  id: string;
  timestamp: string;
  nodeId: string;
  nodeName: string;
  nodeType: string;
  event: string;
  result?: string;
  edge?: string;
  txHash?: string;
  explorerUrl?: string;
  error?: string;
  message?: string;
}

export interface PendingTx {
  journalId: string;
  nodeId: string;
  to: string;
  amountWei: string;
  memo?: string;
}

interface ExecutionState {
  executingNodeIds: Set<string>;
  completedNodeIds: Map<string, { result: string; edge: string }>;
  errorNodeIds: Map<string, string>;
  blockedNodeIds: Set<string>;
  executionLog: LogEntry[];
  pendingSignature: PendingTx | null;

  handleNodeExecuting: (nodeId: string, nodeName: string, nodeType: string) => void;
  handleNodeComplete: (nodeId: string, result: string, edge: string) => void;
  handleNodeBlocked: (nodeId: string, reason: string) => void;
  handleNodeError: (nodeId: string, error: string) => void;
  handleTxSignRequired: (data: PendingTx) => void;
  handleTxConfirmed: (data: { journalId: string; nodeId: string; txHash: string; explorerUrl: string; amount: string; to: string }) => void;
  handleTxFailed: (data: { journalId: string; nodeId: string; reason: string }) => void;
  resetExecution: () => void;
  clearNode: (nodeId: string) => void;
}

let logCounter = 0;

export const useExecutionStore = create<ExecutionState>((set, get) => ({
  executingNodeIds: new Set(),
  completedNodeIds: new Map(),
  errorNodeIds: new Map(),
  blockedNodeIds: new Set(),
  executionLog: [],
  pendingSignature: null,

  handleNodeExecuting: (nodeId, nodeName, nodeType) => {
    const s = get();
    const executing = new Set(s.executingNodeIds);
    executing.add(nodeId);
    const entry: LogEntry = {
      id: String(++logCounter),
      timestamp: new Date().toISOString(),
      nodeId, nodeName, nodeType,
      event: 'executing',
    };
    set({ executingNodeIds: executing, executionLog: [...s.executionLog, entry] });
  },

  handleNodeComplete: (nodeId, result, edge) => {
    const s = get();
    const executing = new Set(s.executingNodeIds);
    executing.delete(nodeId);
    const completed = new Map(s.completedNodeIds);
    completed.set(nodeId, { result, edge });
    const entry: LogEntry = {
      id: String(++logCounter),
      timestamp: new Date().toISOString(),
      nodeId, nodeName: '', nodeType: '',
      event: 'complete', result, edge,
    };
    set({ executingNodeIds: executing, completedNodeIds: completed, executionLog: [...s.executionLog, entry] });
  },

  handleNodeBlocked: (nodeId, reason) => {
    const s = get();
    const executing = new Set(s.executingNodeIds);
    executing.delete(nodeId);
    const blocked = new Set(s.blockedNodeIds);
    blocked.add(nodeId);
    const entry: LogEntry = {
      id: String(++logCounter),
      timestamp: new Date().toISOString(),
      nodeId, nodeName: '', nodeType: '',
      event: 'blocked', message: reason,
    };
    set({ executingNodeIds: executing, blockedNodeIds: blocked, executionLog: [...s.executionLog, entry] });
  },

  handleNodeError: (nodeId, error) => {
    const s = get();
    const executing = new Set(s.executingNodeIds);
    executing.delete(nodeId);
    const errors = new Map(s.errorNodeIds);
    errors.set(nodeId, error);
    const entry: LogEntry = {
      id: String(++logCounter),
      timestamp: new Date().toISOString(),
      nodeId, nodeName: '', nodeType: '',
      event: 'error', error,
    };
    set({ executingNodeIds: executing, errorNodeIds: errors, executionLog: [...s.executionLog, entry] });
  },

  handleTxSignRequired: (data) => {
    set({ pendingSignature: data });
  },

  handleTxConfirmed: (data) => {
    const s = get();
    const entry: LogEntry = {
      id: String(++logCounter),
      timestamp: new Date().toISOString(),
      nodeId: data.nodeId, nodeName: '', nodeType: 'PAY',
      event: 'tx_confirmed', txHash: data.txHash, explorerUrl: data.explorerUrl,
    };
    set({ pendingSignature: null, executionLog: [...s.executionLog, entry] });
  },

  handleTxFailed: (data) => {
    const s = get();
    const entry: LogEntry = {
      id: String(++logCounter),
      timestamp: new Date().toISOString(),
      nodeId: data.nodeId, nodeName: '', nodeType: 'PAY',
      event: 'tx_failed', error: data.reason,
    };
    set({ pendingSignature: null, executionLog: [...s.executionLog, entry] });
  },

  resetExecution: () => {
    set({
      executingNodeIds: new Set(),
      completedNodeIds: new Map(),
      errorNodeIds: new Map(),
      blockedNodeIds: new Set(),
      executionLog: [],
      pendingSignature: null,
    });
  },

  clearNode: (nodeId) => {
    const s = get();
    const executing = new Set(s.executingNodeIds);
    executing.delete(nodeId);
    const completed = new Map(s.completedNodeIds);
    completed.delete(nodeId);
    const errors = new Map(s.errorNodeIds);
    errors.delete(nodeId);
    const blocked = new Set(s.blockedNodeIds);
    blocked.delete(nodeId);
    set({ executingNodeIds: executing, completedNodeIds: completed, errorNodeIds: errors, blockedNodeIds: blocked });
  },
}));
