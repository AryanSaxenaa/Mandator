import { randomUUID } from 'crypto';
import { getPipeline, getAgent, getAgentByPipelineId, saveJournalEntry, saveNotification, updateAgent, getDailySpent } from './db.js';
import { callGroq } from './groq.js';

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function findNextPayNode(sourceNodeId, pipeline) {
  const edgeMap = new Map();
  for (const edge of pipeline.edges) {
    if (!edgeMap.has(edge.source)) edgeMap.set(edge.source, []);
    edgeMap.get(edge.source).push(edge);
  }

  const visited = new Set();
  const queue = [sourceNodeId];

  while (queue.length > 0) {
    const current = queue.shift();
    if (visited.has(current)) continue;
    visited.add(current);

    const edges = edgeMap.get(current) || [];
    for (const edge of edges) {
      const targetNode = pipeline.nodes.find(n => n.id === edge.target);
      if (!targetNode) continue;
      if (targetNode.type === 'payNode' || targetNode.type === 'PAY') return targetNode;
      queue.push(targetNode.id);
    }
  }
  return null;
}

export async function executePipeline(pipelineId, triggerType, triggerPayload = {}, io) {
  let pipeline, agent;

  try {
    pipeline = getPipeline(pipelineId);
  } catch {
    throw new Error(`Pipeline ${pipelineId} not found`);
  }

  agent = getAgentByPipelineId(pipelineId);
  if (!agent) throw new Error(`No agent linked to pipeline ${pipelineId}`);

  try {
    await updateAgent(agent.id, { lastRun: new Date().toISOString(), status: 'active' });

    const context = {
      agentId: agent.id,
      agentName: agent.name,
      pipelineId,
      vaultAddress: agent.vaultAddress,
      dailySpent: getDailySpent(agent.id),
      timestamp: new Date().toISOString(),
      triggerType,
      triggerPayload,
      lastTxAmount: '0',
      lastTxRecipient: '',
    };

    const startNode = pipeline.nodes.find(n => n.type === 'startNode' || n.type === 'START');
    if (!startNode) throw new Error('Pipeline has no START node');

    const edgeMap = new Map();
    for (const edge of pipeline.edges) {
      if (!edgeMap.has(edge.source)) edgeMap.set(edge.source, []);
      edgeMap.get(edge.source).push(edge);
    }

    let currentNode = startNode;
    let safetyCounter = 0;

    while (currentNode && safetyCounter < 50) {
      safetyCounter++;
      const result = await evaluateNode(currentNode, context, io, pipeline, agent);

      await saveJournalEntry({
        id: randomUUID(),
        agentId: agent.id,
        pipelineId,
        nodeId: currentNode.id,
        nodeName: currentNode.data?.label || currentNode.type,
        nodeType: currentNode.type,
        ...result,
        timestamp: new Date().toISOString(),
      });

      if (result.txHash) {
        context.lastTxAmount = result.amount?.toString() || '0';
        context.lastTxRecipient = result.recipient || '';
      }

      if (result.halt) break;

      const edges = edgeMap.get(currentNode.id) || [];
      const nextEdge = edges.find(e => e.sourceHandle === result.edge) || edges[0];
      if (!nextEdge) break;
      currentNode = pipeline.nodes.find(n => n.id === nextEdge.target);
    }

    await updateAgent(agent.id, { status: 'idle' });
  } catch (err) {
    await updateAgent(agent.id, { status: 'error' }).catch(() => {});
    io.to(agent.id).emit('node:error', { nodeId: 'pipeline', error: err.message });
    await saveJournalEntry({
      id: randomUUID(),
      agentId: agent.id,
      pipelineId,
      nodeId: 'pipeline',
      nodeName: 'Pipeline',
      nodeType: 'SYSTEM',
      event: 'error',
      result: 'pipeline_error',
      error: err.message,
      timestamp: new Date().toISOString(),
    });
    throw err;
  }
}

async function evaluateNode(node, context, io, pipeline, agent) {
  const nodeType = node.type;
  const config = node.data?.config || {};
  const roomId = context.agentId;

  const emitExecuting = () => {
    io.to(roomId).emit('node:executing', {
      nodeId: node.id,
      nodeName: node.data?.label || nodeType,
      nodeType,
    });
  };

  const emitComplete = (result, edge) => {
    io.to(roomId).emit('node:complete', {
      nodeId: node.id,
      result,
      edge,
    });
  };

  const emitBlocked = (reason) => {
    io.to(roomId).emit('node:blocked', {
      nodeId: node.id,
      reason,
    });
  };

  switch (nodeType) {
    case 'startNode':
    case 'START': {
      emitExecuting();
      await delay(200);
      emitComplete('started', 'default');
      return { edge: 'default', result: 'started' };
    }

    case 'endNode':
    case 'END': {
      emitExecuting();
      await delay(200);
      emitComplete('completed', 'default');
      return { edge: 'default', result: 'completed', halt: true };
    }

    case 'timeTriggerNode':
    case 'TIME_TRIGGER':
    case 'webhookTriggerNode':
    case 'WEBHOOK_TRIGGER':
    case 'manualTriggerNode':
    case 'MANUAL_TRIGGER': {
      emitExecuting();
      await delay(200);
      emitComplete('triggered', 'default');
      return { edge: 'default', result: 'triggered' };
    }

    case 'balanceTriggerNode':
    case 'BALANCE_TRIGGER': {
      emitExecuting();
      const balance = Number(agent.lastKnownBalance || 0);
      const threshold = Number(config.thresholdWei || 0);
      const direction = config.direction || 'above';
      const passes = direction === 'above' ? balance >= threshold : balance <= threshold;
      if (!passes) {
        emitBlocked('balance_condition_not_met');
        return { edge: 'BLOCKED', result: 'balance_condition_not_met', halt: true };
      }
      emitComplete('balance_condition_met', 'default');
      return { edge: 'default', result: 'balance_condition_met' };
    }

    case 'spendLimitCheckNode':
    case 'SPEND_LIMIT_CHECK': {
      emitExecuting();
      const limit = BigInt(config.maxAmountWei || '0');
      const nextPayNode = findNextPayNode(node.id, pipeline);
      const payAmount = nextPayNode ? BigInt(nextPayNode.data?.config?.amountWei || '0') : 0n;
      const passes = limit === 0n || payAmount <= limit;
      const edge = passes ? 'PASS' : 'BLOCK';
      if (passes) emitComplete('within_limit', edge);
      else emitBlocked('exceeds_limit');
      return { edge, result: passes ? 'within_limit' : 'exceeds_limit' };
    }

    case 'dailyBudgetGateNode':
    case 'DAILY_BUDGET_GATE': {
      emitExecuting();
      const dailyLimit = BigInt(config.dailyLimitWei || '0');
      const spent = BigInt(context.dailySpent || 0);
      const nextPayNode = findNextPayNode(node.id, pipeline);
      const nextPayAmount = BigInt(nextPayNode?.data?.config?.amountWei || '0');
      const wouldExceed = dailyLimit > 0n && (spent + nextPayAmount) > dailyLimit;
      const edge = wouldExceed ? 'BLOCK' : 'PASS';
      if (wouldExceed) emitBlocked('would_exceed_daily_limit');
      else emitComplete('within_daily_budget', edge);
      return { edge, result: wouldExceed ? 'would_exceed_daily_limit' : 'within_daily_budget' };
    }

    case 'whitelistCheckNode':
    case 'WHITELIST_CHECK': {
      emitExecuting();
      const whitelist = (config.recipients || []).map(a => a.toLowerCase().trim());
      const nextPayNode = findNextPayNode(node.id, pipeline);
      const recipient = nextPayNode?.data?.config?.recipientAddress || '';
      const approved = whitelist.length === 0 || whitelist.includes(recipient.toLowerCase().trim());
      const edge = approved ? 'APPROVED' : 'REJECTED';
      if (approved) emitComplete('address_approved', edge);
      else emitBlocked('address_rejected');
      return { edge, result: approved ? 'address_approved' : 'address_rejected', recipient };
    }

    case 'cooldownTimerNode':
    case 'COOLDOWN_TIMER': {
      emitExecuting();
      const cooldownMs = (config.cooldownMinutes || 60) * 60 * 1000;
      const lastRun = agent.lastRun ? new Date(agent.lastRun).getTime() : 0;
      const elapsed = Date.now() - lastRun;
      const ready = elapsed >= cooldownMs;
      if (!ready) {
        const remainingMin = Math.ceil((cooldownMs - elapsed) / 60000);
        emitBlocked(`Cooldown active. ${remainingMin} minutes remaining.`);
        return { edge: 'WAIT', result: `cooldown_active_${remainingMin}min_remaining`, halt: true };
      }
      emitComplete('cooldown_elapsed', 'READY');
      return { edge: 'READY', result: 'cooldown_elapsed' };
    }

    case 'aiDecisionNode':
    case 'AI_DECISION': {
      emitExecuting();
      const systemPrompt = 'You are a spending policy evaluator. Your only job is to evaluate whether a transaction should proceed. Respond with exactly one word: YES or NO. Nothing else.';
      const userPrompt = `Pipeline context: ${JSON.stringify(context, null, 2)}\n\nUser policy question: ${config.prompt}\n\nRespond YES or NO only.`;
      let decision;
      try {
        const raw = await callGroq(systemPrompt, userPrompt);
        decision = raw.toUpperCase().includes('YES') ? 'YES' : 'NO';
      } catch (err) {
        decision = 'NO';
        await saveJournalEntry({
          id: randomUUID(),
          agentId: context.agentId,
          pipelineId: context.pipelineId,
          nodeId: node.id,
          nodeName: node.data?.label || 'AI Decision',
          nodeType: 'AI_DECISION',
          result: 'ai_error',
          error: err.message,
          timestamp: new Date().toISOString(),
        });
      }
      emitComplete(`ai_decided_${decision.toLowerCase()}`, decision);
      return { edge: decision, result: `ai_decided_${decision.toLowerCase()}` };
    }

    case 'payNode':
    case 'PAY': {
      emitExecuting();
      const journalId = randomUUID();
      const to = config.recipientAddress;
      const amountWei = config.amountWei || '0';
      const memo = config.memo || '';

      if (!/^0x[0-9a-fA-F]{40}$/.test(to)) {
        io.to(roomId).emit('node:error', { nodeId: node.id, error: 'Invalid recipient address' });
        return { edge: 'default', result: 'invalid_address', error: 'Invalid recipient address', halt: true };
      }
      if (BigInt(amountWei) <= 0n) {
        io.to(roomId).emit('node:error', { nodeId: node.id, error: 'Amount must be greater than 0' });
        return { edge: 'default', result: 'invalid_amount', error: 'Amount must be greater than 0', halt: true };
      }

      await saveJournalEntry({
        id: journalId,
        agentId: context.agentId,
        pipelineId: context.pipelineId,
        nodeId: node.id,
        nodeName: node.data?.label || 'Pay',
        nodeType: 'PAY',
        status: 'pending_signature',
        to,
        amountWei: amountWei.toString(),
        memo,
        timestamp: new Date().toISOString(),
      });

      io.to(roomId).emit('tx:sign_required', {
        journalId,
        nodeId: node.id,
        to,
        amountWei: amountWei.toString(),
        memo,
      });

      try {
        const txResult = await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Transaction signature timeout after 60 seconds')), 60000);
          const onSigned = (data) => {
            clearTimeout(timeout);
            io.removeListener(`tx:rejected:${journalId}`, onRejected);
            resolve(data);
          };
          const onRejected = (data) => {
            clearTimeout(timeout);
            io.removeListener(`tx:signed:${journalId}`, onSigned);
            resolve({ error: data.reason || 'User rejected transaction' });
          };
          io.once(`tx:signed:${journalId}`, onSigned);
          io.once(`tx:rejected:${journalId}`, onRejected);
        });

        if (txResult.error) {
          await saveJournalEntry({
            id: randomUUID(),
            agentId: context.agentId,
            pipelineId: context.pipelineId,
            nodeId: node.id,
            nodeName: node.data?.label || 'Pay',
            nodeType: 'PAY',
            status: 'rejected',
            error: txResult.error,
            timestamp: new Date().toISOString(),
          });
          io.to(roomId).emit('tx:failed', { journalId, nodeId: node.id, reason: txResult.error });
          return { edge: 'default', result: 'payment_rejected', halt: true };
        }

        await saveJournalEntry({
          id: randomUUID(),
          agentId: context.agentId,
          pipelineId: context.pipelineId,
          nodeId: node.id,
          nodeName: node.data?.label || 'Pay',
          nodeType: 'PAY',
          status: 'confirmed',
          txHash: txResult.txHash,
          explorerUrl: txResult.explorerUrl,
          to,
          amountWei: amountWei.toString(),
          timestamp: new Date().toISOString(),
        });

        const amount = Number(amountWei);
        await updateAgent(context.agentId, {
          dailySpent: (agent.dailySpent || 0) + amount,
          totalSpent: (agent.totalSpent || 0) + amount,
        });

        io.to(roomId).emit('tx:confirmed', {
          journalId,
          nodeId: node.id,
          txHash: txResult.txHash,
          explorerUrl: txResult.explorerUrl,
          amount: amountWei.toString(),
          to,
        });
        io.to(roomId).emit('balance:update', {});

        return {
          edge: 'default',
          result: 'payment_confirmed',
          txHash: txResult.txHash,
          amount: amountWei,
          recipient: to,
        };
      } catch (err) {
        io.to(roomId).emit('tx:failed', { journalId, nodeId: node.id, reason: err.message });
        return { edge: 'default', result: 'payment_timeout', error: err.message, halt: true };
      }
    }

    case 'autoTopupNode':
    case 'AUTO_TOPUP': {
      emitExecuting();
      const journalId = randomUUID();
      const to = agent.vaultAddress;
      const amountWei = config.amountWei || '0';

      if (!to || !/^0x[0-9a-fA-F]{40}$/.test(to)) {
        io.to(roomId).emit('node:error', { nodeId: node.id, error: 'Invalid vault address' });
        return { edge: 'default', result: 'invalid_vault_address', error: 'Invalid vault address', halt: true };
      }

      await saveJournalEntry({
        id: journalId,
        agentId: context.agentId,
        pipelineId: context.pipelineId,
        nodeId: node.id,
        nodeName: node.data?.label || 'Auto Topup',
        nodeType: 'AUTO_TOPUP',
        status: 'pending_signature',
        to,
        amountWei: amountWei.toString(),
        timestamp: new Date().toISOString(),
      });

      io.to(roomId).emit('tx:sign_required', {
        journalId,
        nodeId: node.id,
        to,
        amountWei: amountWei.toString(),
        memo: 'Auto top-up',
      });

      try {
        const txResult = await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Transaction signature timeout after 60 seconds')), 60000);
          const onSigned = (data) => {
            clearTimeout(timeout);
            io.removeListener(`tx:rejected:${journalId}`, onRejected);
            resolve(data);
          };
          const onRejected = (data) => {
            clearTimeout(timeout);
            io.removeListener(`tx:signed:${journalId}`, onSigned);
            resolve({ error: data.reason || 'User rejected transaction' });
          };
          io.once(`tx:signed:${journalId}`, onSigned);
          io.once(`tx:rejected:${journalId}`, onRejected);
        });

        if (txResult.error) {
          await saveJournalEntry({
            id: randomUUID(),
            agentId: context.agentId,
            pipelineId: context.pipelineId,
            nodeId: node.id,
            nodeName: node.data?.label || 'Auto Topup',
            nodeType: 'AUTO_TOPUP',
            status: 'rejected',
            error: txResult.error,
            timestamp: new Date().toISOString(),
          });
          io.to(roomId).emit('tx:failed', { journalId, nodeId: node.id, reason: txResult.error });
          return { edge: 'default', result: 'topup_rejected', halt: true };
        }

        await saveJournalEntry({
          id: randomUUID(),
          agentId: context.agentId,
          pipelineId: context.pipelineId,
          nodeId: node.id,
          nodeName: node.data?.label || 'Auto Topup',
          nodeType: 'AUTO_TOPUP',
          status: 'confirmed',
          txHash: txResult.txHash,
          explorerUrl: txResult.explorerUrl,
          to,
          amountWei: amountWei.toString(),
          timestamp: new Date().toISOString(),
        });

        io.to(roomId).emit('tx:confirmed', {
          journalId,
          nodeId: node.id,
          txHash: txResult.txHash,
          explorerUrl: txResult.explorerUrl,
          amount: amountWei.toString(),
          to,
        });
        io.to(roomId).emit('balance:update', {});

        return {
          edge: 'default',
          result: 'topup_confirmed',
          txHash: txResult.txHash,
          amount: amountWei,
          recipient: to,
        };
      } catch (err) {
        io.to(roomId).emit('tx:failed', { journalId, nodeId: node.id, reason: err.message });
        return { edge: 'default', result: 'topup_timeout', error: err.message, halt: true };
      }
    }

    case 'alertNode':
    case 'ALERT': {
      emitExecuting();
      const template = config.message || 'Alert triggered';
      const resolved = template
        .replace('{agentName}', context.agentName || '')
        .replace('{amount}', context.lastTxAmount || '0')
        .replace('{address}', context.lastTxRecipient || '')
        .replace('{timestamp}', context.timestamp || '')
        .replace('{dailySpent}', context.dailySpent?.toString() || '0');
      const severity = config.severity || 'info';
      const notif = {
        id: randomUUID(),
        agentId: context.agentId,
        message: resolved,
        severity,
        read: false,
        createdAt: new Date().toISOString(),
      };
      await saveNotification(notif);
      io.to(roomId).emit('notification:new', notif);
      emitComplete('alert_sent', 'default');
      return { edge: 'default', result: 'alert_sent' };
    }

    case 'logNode':
    case 'LOG': {
      emitExecuting();
      const template = config.message || 'Log entry';
      const resolved = template.replace(/{(\w+)}/g, (_, key) => context[key]?.toString() || '');
      emitComplete('logged', 'default');
      return { edge: 'default', result: resolved };
    }

    case 'pausePipelineNode':
    case 'PAUSE_PIPELINE': {
      emitExecuting();
      const message = config.message || 'Pipeline paused by policy';
      await updateAgent(context.agentId, { status: 'paused' });
      await saveNotification({
        id: randomUUID(),
        agentId: context.agentId,
        message,
        severity: 'warning',
        read: false,
        createdAt: new Date().toISOString(),
      });
      io.to(roomId).emit('agent:paused', { agentId: context.agentId, message });
      emitComplete('pipeline_paused', 'default');
      return { edge: 'default', result: 'pipeline_paused', halt: true };
    }

    default: {
      emitExecuting();
      emitComplete('unknown_node', 'default');
      return { edge: 'default', result: 'unknown_node_type' };
    }
  }
}
