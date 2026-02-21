import axios from 'axios';
import { getJournalDb } from './db.js';
import { v4 as uuidv4 } from 'uuid';

export async function executePipeline(pipeline, context, io) {
  const { nodes, edges } = pipeline;
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const edgeMap = new Map();
  for (const edge of edges) {
    if (!edgeMap.has(edge.source)) edgeMap.set(edge.source, []);
    edgeMap.get(edge.source).push(edge);
  }

  const startNode = nodes.find(n => n.type === 'startNode');
  if (!startNode) throw new Error('No START node found');

  let currentNodeId = startNode.id;
  const executionLog = [];

  while (currentNodeId) {
    const node = nodeMap.get(currentNodeId);
    if (!node) break;

    io?.emit('node:executing', { pipelineId: pipeline.id, nodeId: node.id, type: node.type });

    const result = await executeNode(node, context, io);
    executionLog.push({ nodeId: node.id, type: node.type, result });

    io?.emit('node:complete', { pipelineId: pipeline.id, nodeId: node.id, type: node.type, result });

    if (node.type === 'endNode' || !result) {
      currentNodeId = null;
      break;
    }

    const outEdges = edgeMap.get(node.id) || [];
    let nextEdge = null;

    if (result.output) {
      nextEdge = outEdges.find(e => e.sourceHandle === result.output);
    }
    if (!nextEdge && outEdges.length > 0) {
      nextEdge = outEdges[0];
    }

    currentNodeId = nextEdge ? nextEdge.target : null;
  }

  return executionLog;
}

async function executeNode(node, context, io) {
  const data = node.data || {};

  switch (node.type) {
    case 'startNode':
      return { output: 'default', message: 'Pipeline started' };

    case 'endNode':
      return null;

    case 'timeTriggerNode':
      return { output: 'default', message: `Time trigger: ${data.cron || '* * * * *'}` };

    case 'balanceTriggerNode': {
      const threshold = parseFloat(data.threshold) || 0;
      const op = data.operator || 'below';
      const triggered = op === 'below'
        ? context.vault_balance < threshold
        : context.vault_balance > threshold;
      return { output: triggered ? 'TRIGGERED' : 'SKIP', message: `Balance ${context.vault_balance} ${op} ${threshold}` };
    }

    case 'webhookTriggerNode':
      return { output: 'default', message: 'Webhook received', payload: context.trigger_payload };

    case 'manualTriggerNode':
      return { output: 'default', message: 'Manual trigger fired' };

    case 'spendLimitCheckNode': {
      const limit = parseFloat(data.limit) || 1;
      const pass = context.last_tx_amount <= limit;
      return { output: pass ? 'PASS' : 'BLOCK', message: `Amount ${context.last_tx_amount} vs limit ${limit}` };
    }

    case 'dailyBudgetGateNode': {
      const budget = parseFloat(data.budget) || 5;
      const pass = context.daily_spent < budget;
      return { output: pass ? 'PASS' : 'BLOCK', message: `Daily spent ${context.daily_spent} vs budget ${budget}` };
    }

    case 'whitelistCheckNode': {
      const whitelist = (data.addresses || '').split(',').map(a => a.trim().toLowerCase());
      const recipient = (context.last_tx_recipient || '').toLowerCase();
      const approved = whitelist.includes(recipient);
      return { output: approved ? 'APPROVED' : 'REJECTED', message: `${recipient} ${approved ? 'in' : 'not in'} whitelist` };
    }

    case 'cooldownTimerNode': {
      const cooldownMs = (parseFloat(data.minutes) || 5) * 60 * 1000;
      const lastRun = context.last_run_timestamp || 0;
      const ready = (Date.now() - lastRun) >= cooldownMs;
      return { output: ready ? 'READY' : 'WAIT', message: `Cooldown ${ready ? 'elapsed' : 'active'}` };
    }

    case 'aiDecisionNode': {
      const prompt = data.prompt || 'Should this transaction proceed?';
      const model = data.model || 'llama-3.1-8b-instant';

      try {
        const groqResponse = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model,
            messages: [
              { role: 'system', content: 'You are a spending policy evaluator. Respond YES or NO only.' },
              { role: 'user', content: `Context: ${JSON.stringify(context)}\n\nPolicy: ${prompt}` }
            ],
            temperature: 0,
            max_tokens: 10
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );
        const answer = groqResponse.data.choices[0].message.content.trim().toUpperCase();
        const decision = answer.includes('YES') ? 'YES' : 'NO';
        return { output: decision, message: `AI decided: ${decision}` };
      } catch (err) {
        console.error('Groq API error:', err.message);
        return { output: 'NO', message: `AI error: ${err.message}, defaulting NO` };
      }
    }

    case 'payNode': {
      const to = data.recipient || context.last_tx_recipient;
      const amount = parseFloat(data.amount) || context.last_tx_amount || 0;
      const memo = data.memo || '';
      const txid = `tx_${uuidv4().slice(0, 8)}`;

      const journalDb = getJournalDb();
      journalDb.data.entries.push({
        id: uuidv4(),
        pipelineId: context.pipeline_id,
        timestamp: new Date().toISOString(),
        node: node.id,
        result: 'PAY_EXECUTED',
        txid,
        amount,
        recipient: to
      });
      await journalDb.write();

      context.daily_spent = (context.daily_spent || 0) + amount;
      context.vault_balance = (context.vault_balance || 0) - amount;

      io?.emit('tx:confirmed', { pipelineId: context.pipeline_id, txid, amount, to });
      io?.emit('balance:update', { balance: context.vault_balance });

      return { output: 'default', message: `Paid ${amount} to ${to}`, txid };
    }

    case 'autoTopupNode': {
      const amount = parseFloat(data.amount) || 1;
      context.vault_balance = (context.vault_balance || 0) + amount;
      io?.emit('balance:update', { balance: context.vault_balance });
      return { output: 'default', message: `Top-up ${amount}` };
    }

    case 'alertNode': {
      const alertMsg = data.message || 'Alert triggered';
      io?.emit('alert', { pipelineId: context.pipeline_id, message: alertMsg });
      return { output: 'default', message: alertMsg };
    }

    case 'logNode': {
      const logMsg = data.message || 'Log entry';
      const journalDb = getJournalDb();
      journalDb.data.entries.push({
        id: uuidv4(),
        pipelineId: context.pipeline_id,
        timestamp: new Date().toISOString(),
        node: node.id,
        result: 'LOG',
        txid: null,
        amount: null,
        recipient: null,
        message: logMsg
      });
      await journalDb.write();
      return { output: 'default', message: logMsg };
    }

    case 'pausePipelineNode': {
      io?.emit('pipeline:paused', { pipelineId: context.pipeline_id });
      return null;
    }

    default:
      return { output: 'default', message: `Unknown node type: ${node.type}` };
  }
}
