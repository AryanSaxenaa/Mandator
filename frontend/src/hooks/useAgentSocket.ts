import { useEffect } from 'react';
import { socket, joinAgent, leaveAgent } from '../lib/socket';
import { useExecutionStore } from '../store/executionStore';
import { useAgentStore } from '../store/agentStore';
import { useWalletStore } from '../store/walletStore';
import { adapter } from '../adapters';
import * as api from '../lib/api';

export function useAgentSocket(agentId: string | null) {
  const exec = useExecutionStore();
  const agentStore = useAgentStore();
  const walletStore = useWalletStore();

  useEffect(() => {
    if (!agentId) return;

    if (!socket.connected) socket.connect();
    joinAgent(agentId);

    const onExecuting = (data: { nodeId: string; nodeName: string; nodeType: string }) => {
      exec.handleNodeExecuting(data.nodeId, data.nodeName, data.nodeType);
    };
    const onComplete = (data: { nodeId: string; result: string; edge: string }) => {
      exec.handleNodeComplete(data.nodeId, data.result, data.edge);
    };
    const onBlocked = (data: { nodeId: string; reason: string }) => {
      exec.handleNodeBlocked(data.nodeId, data.reason);
    };
    const onError = (data: { nodeId: string; error: string }) => {
      exec.handleNodeError(data.nodeId, data.error);
    };
    const onSignRequired = (data: { journalId: string; nodeId: string; to: string; amountWei: string; memo?: string }) => {
      exec.handleTxSignRequired(data);
    };
    const onConfirmed = (data: { journalId: string; nodeId: string; txHash: string; explorerUrl: string; amount: string; to: string }) => {
      exec.handleTxConfirmed(data);
      walletStore.refreshBalance();
      if (agentId && walletStore.balanceRaw !== undefined) {
        api.updateAgentBalance(agentId, walletStore.balanceRaw.toString()).catch(() => {});
      }
    };
    const onFailed = (data: { journalId: string; nodeId: string; reason: string }) => {
      exec.handleTxFailed(data);
    };
    const onPaused = () => {
      agentStore.fetchAgents();
    };
    const onBalanceUpdate = () => {
      walletStore.refreshBalance();
    };

    socket.on('node:executing', onExecuting);
    socket.on('node:complete', onComplete);
    socket.on('node:blocked', onBlocked);
    socket.on('node:error', onError);
    socket.on('tx:sign_required', onSignRequired);
    socket.on('tx:confirmed', onConfirmed);
    socket.on('tx:failed', onFailed);
    socket.on('agent:paused', onPaused);
    socket.on('balance:update', onBalanceUpdate);

    return () => {
      leaveAgent(agentId);
      socket.off('node:executing', onExecuting);
      socket.off('node:complete', onComplete);
      socket.off('node:blocked', onBlocked);
      socket.off('node:error', onError);
      socket.off('tx:sign_required', onSignRequired);
      socket.off('tx:confirmed', onConfirmed);
      socket.off('tx:failed', onFailed);
      socket.off('agent:paused', onPaused);
      socket.off('balance:update', onBalanceUpdate);
    };
  }, [agentId]);

  return {
    executionLog: exec.executionLog,
    executingNodeIds: exec.executingNodeIds,
    pendingSignature: exec.pendingSignature,
    completedNodeIds: exec.completedNodeIds,
    errorNodeIds: exec.errorNodeIds,
    blockedNodeIds: exec.blockedNodeIds,
  };
}
