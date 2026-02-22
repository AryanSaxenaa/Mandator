import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import ReactFlow, {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type Connection,
  type NodeChange,
  type EdgeChange,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Save, Play, Rocket, Trash2, Circle, AlertTriangle, X } from 'lucide-react';
import { nodeTypes, nodeCategories } from '../components/nodes';
import { usePipelineStore } from '../store/pipelineStore';
import { useAgentStore } from '../store/agentStore';
import { useExecutionStore } from '../store/executionStore';
import { useWalletStore } from '../store/walletStore';
import { useAgentSocket } from '../hooks/useAgentSocket';
import { TechCard, AppButton } from '../components/ui/TechCard';
import NodeConfigPanel from '../components/NodeConfigPanel';

let nodeIdCounter = 0;

export default function Canvas() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pipelineStore = usePipelineStore();
  const agentStore = useAgentStore();
  const walletStore = useWalletStore();
  const executionStore = useExecutionStore();

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [pipelineName, setPipelineName] = useState('New Pipeline');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showCreateAgent, setShowCreateAgent] = useState(false);
  const [runAfterDeploy, setRunAfterDeploy] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [agentVault, setAgentVault] = useState('');
  const [showNamePipeline, setShowNamePipeline] = useState(false);
  const [pendingNameAction, setPendingNameAction] = useState<'save' | 'deploy' | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // FIX 1: Refs always hold the latest nodes/edges — breaks stale closures in debouncedSave
  const latestNodesRef = useRef<Node[]>([]);
  const latestEdgesRef = useRef<Edge[]>([]);
  useEffect(() => { latestNodesRef.current = nodes; }, [nodes]);
  useEffect(() => { latestEdgesRef.current = edges; }, [edges]);

  // FIX 2: Track loaded pipeline id — prevents the useEffect from reloading
  // the canvas after every savePipeline() call that creates a new array reference
  const loadedForIdRef = useRef<string | null>(null);
  const prevPipelineIdRef = useRef<string | null>(null);

  const pipelineId = searchParams.get('id') || pipelineStore.activePipelineId;
  const linkedAgent = agentStore.agents.find(a => a.pipelineId === pipelineId);

  // Derive selectedNode from live nodes so config panel always sees fresh data
  const selectedNode = useMemo(
    () => (selectedNodeId ? nodes.find(n => n.id === selectedNodeId) ?? null : null),
    [nodes, selectedNodeId],
  );

  useAgentSocket(linkedAgent?.id || null);

  const executingNodeIds = useExecutionStore(s => s.executingNodeIds);
  const completedNodeIds = useExecutionStore(s => s.completedNodeIds);
  const errorNodeIds = useExecutionStore(s => s.errorNodeIds);
  const blockedNodeIds = useExecutionStore(s => s.blockedNodeIds);

  const decoratedNodes = useMemo(() => nodes.map(n => ({
    ...n,
    data: {
      ...(n.data || {}),
      _executing: executingNodeIds.has(n.id),
      _completed: completedNodeIds.has(n.id),
      _errored: errorNodeIds.has(n.id),
      _blocked: blockedNodeIds.has(n.id),
    },
  })), [nodes, executingNodeIds, completedNodeIds, errorNodeIds, blockedNodeIds]);

  // Auto-dismiss toast after 4s
  useEffect(() => {
    if (!toastError) return;
    const t = setTimeout(() => setToastError(null), 4000);
    return () => clearTimeout(t);
  }, [toastError]);

  const showError = (msg: string) => setToastError(msg);

  // FIX 3: When pipelineId changes, reset the loaded-guard so new pipeline can load
  // BUT don't reset if handleSave just set it (loadedForIdRef already matches)
  useEffect(() => {
    if (prevPipelineIdRef.current !== pipelineId) {
      prevPipelineIdRef.current = pipelineId ?? null;
      // Only reset if the ref doesn't already match — handleSave sets it ahead of navigate
      if (loadedForIdRef.current !== pipelineId) {
        loadedForIdRef.current = null;
      }
    }
  }, [pipelineId]);

  // FIX 4: Only load pipeline data when we haven't done so for this id yet
  // This prevents re-loading after every savePipeline() store update
  useEffect(() => {
    if (!pipelineId) return;
    if (loadedForIdRef.current === pipelineId) return;
    const pipe = pipelineStore.pipelines.find(p => p.id === pipelineId);
    if (!pipe) return; // not yet fetched from API — wait for next render
    loadedForIdRef.current = pipelineId;
    setNodes(pipe.nodes || []);
    setEdges(pipe.edges || []);
    setPipelineName(pipe.name || 'Pipeline');
  }, [pipelineId, pipelineStore.pipelines]);

  useEffect(() => {
    pipelineStore.fetchPipelines();
    agentStore.fetchAgents();
  }, []);

  // FIX 5: debouncedSave reads from refs — never has stale node/edge data
  const debouncedSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      if (pipelineId) {
        pipelineStore.savePipeline(pipelineId, latestNodesRef.current, latestEdgesRef.current)
          .catch(() => {});
      }
    }, 1500);
  }, [pipelineId]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes(nds => applyNodeChanges(changes, nds));
    pipelineStore.markDirty();
    debouncedSave();
  }, [pipelineId, debouncedSave]);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges(eds => applyEdgeChanges(changes, eds));
    pipelineStore.markDirty();
    debouncedSave();
  }, [pipelineId, debouncedSave]);

  const onConnect = useCallback((connection: Connection) => {
    setEdges(eds => addEdge(connection, eds));
    pipelineStore.markDirty();
    debouncedSave();
  }, [pipelineId, debouncedSave]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/reactflow');
    const label = e.dataTransfer.getData('label');
    if (!type || !reactFlowInstance) return;
    const position = reactFlowInstance.screenToFlowPosition({ x: e.clientX, y: e.clientY });
    const newNode: Node = {
      id: `node_${++nodeIdCounter}_${Date.now()}`,
      type,
      position,
      data: { label: label || type, config: {} },
    };
    setNodes(nds => [...nds, newNode]);
    pipelineStore.markDirty();
    debouncedSave();
  }, [reactFlowInstance, pipelineId, debouncedSave]);

  // FIX 6: handleSave uses refs + has try/catch with visible error
  // For brand-new pipelines (no pipelineId) show a name modal first
  const handleSave = async (overrideName?: string): Promise<string | null> => {
    if (!pipelineId && !overrideName) {
      setPendingNameAction('save');
      setShowNamePipeline(true);
      return null;
    }
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setIsSaving(true);
    const nameToUse = overrideName || pipelineName || 'New Pipeline';
    try {
      if (!pipelineId) {
        const pipe = await pipelineStore.createPipeline(nameToUse);
        setPipelineName(pipe.name);
        pipelineStore.setActivePipeline(pipe.id);
        loadedForIdRef.current = pipe.id;
        navigate(`/canvas?id=${pipe.id}`, { replace: true });
        await pipelineStore.savePipeline(pipe.id, latestNodesRef.current, latestEdgesRef.current);
        return pipe.id;
      } else {
        await pipelineStore.savePipeline(pipelineId, latestNodesRef.current, latestEdgesRef.current);
        return pipelineId;
      }
    } catch (err: any) {
      showError(`Save failed: ${err.message || 'Backend unreachable'}`);
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  // FIX 7: handleClear asks for confirmation + immediately saves the empty state
  const handleClear = () => {
    if (!window.confirm('Clear all nodes and edges from this pipeline?')) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setNodes([]);
    setEdges([]);
    setSelectedNodeId(null);
    pipelineStore.markDirty();
    if (pipelineId) {
      pipelineStore.savePipeline(pipelineId, [], []).catch(() => {});
    }
  };

  // FIX 8: handleDeploy doesn't block on save + has try/catch
  const handleDeploy = async (overrideName?: string) => {
    let currentPipelineId = pipelineId;

    if (!currentPipelineId) {
      if (!overrideName) {
        setPendingNameAction('deploy');
        setShowNamePipeline(true);
        return;
      }
      try {
        const pipe = await pipelineStore.createPipeline(overrideName || pipelineName || 'New Pipeline');
        setPipelineName(pipe.name);
        pipelineStore.setActivePipeline(pipe.id);
        loadedForIdRef.current = pipe.id;
        navigate(`/canvas?id=${pipe.id}`, { replace: true });
        await pipelineStore.savePipeline(pipe.id, latestNodesRef.current, latestEdgesRef.current);
        currentPipelineId = pipe.id;
      } catch (err: any) {
        showError(`Failed to save pipeline: ${err.message || 'Backend unreachable'}`);
        return;
      }
    } else {
      // Background save — don't await so deploy modal opens immediately
      pipelineStore.savePipeline(currentPipelineId, latestNodesRef.current, latestEdgesRef.current).catch(() => {});
    }

    const existing = agentStore.agents.find(a => a.pipelineId === currentPipelineId);
    if (existing) {
      try {
        await agentStore.deployAgent(existing.id);
        navigate(`/agent/${existing.id}`);
      } catch (err: any) {
        showError(`Deploy failed: ${err.message || 'Backend unreachable'}`);
      }
    } else {
      setShowCreateAgent(true);
    }
  };

  const handleCreateAndDeploy = async () => {
    const currentPipelineId = pipelineId || pipelineStore.activePipelineId;
    if (!currentPipelineId || !agentName.trim()) return;
    try {
      const agent = await agentStore.createAgent({
        name: agentName.trim(),
        pipelineId: currentPipelineId,
        vaultAddress: agentVault.trim() || walletStore.address || '',
      });
      await agentStore.deployAgent(agent.id);
      setShowCreateAgent(false);
      if (runAfterDeploy) {
        setRunAfterDeploy(false);
        executionStore.resetExecution();
        await agentStore.runAgent(agent.id);
      } else {
        navigate(`/agent/${agent.id}`);
      }
    } catch (err: any) {
      showError(`Failed: ${err.message || 'Backend unreachable'}`);
    }
  };

  const handleRun = async () => {
    if (!linkedAgent) {
      setRunAfterDeploy(true);
      setShowCreateAgent(true);
      return;
    }
    try {
      executionStore.resetExecution();
      await agentStore.runAgent(linkedAgent.id);
    } catch (err: any) {
      showError(`Run failed: ${err.message || 'Backend unreachable'}`);
    }
  };

  const updateNodeConfig = useCallback((nodeId: string, config: Record<string, unknown>) => {
    setNodes(nds => nds.map(n => {
      if (n.id !== nodeId) return n;
      const { __label, ...restConfig } = config;
      const newData = { ...n.data, config: restConfig };
      if (__label !== undefined) newData.label = __label as string;
      return { ...n, data: newData };
    }));
    pipelineStore.markDirty();
    debouncedSave();
  }, [pipelineId, debouncedSave]);

  const handleConfirmPipelineName = async (name: string) => {
    setShowNamePipeline(false);
    if (!name.trim()) return;
    setPipelineName(name.trim());
    if (pendingNameAction === 'save') {
      await handleSave(name.trim());
    } else if (pendingNameAction === 'deploy') {
      await handleDeploy(name.trim());
    }
    setPendingNameAction(null);
  };

  const handleNewPipeline = async () => {
    try {
      const pipe = await pipelineStore.createPipeline('Untitled Pipeline');
      pipelineStore.setActivePipeline(pipe.id);
      loadedForIdRef.current = pipe.id;
      setNodes([]);
      setEdges([]);
      setSelectedNodeId(null);
      setPipelineName(pipe.name);
      navigate(`/canvas?id=${pipe.id}`, { replace: true });
    } catch (err: any) {
      showError(`Failed to create pipeline: ${err.message || 'Backend unreachable'}`);
    }
  };

  return (
    <div className="flex h-full relative">
      {/* Toast Error Banner */}
      {toastError && (
        <div
          className="absolute top-16 left-1/2 z-50 flex items-center gap-3 px-4 py-3 text-sm font-mono"
          style={{
            transform: 'translateX(-50%)',
            background: 'rgba(127,29,29,0.95)',
            border: '1px solid rgba(239,68,68,0.6)',
            color: '#fecaca',
            minWidth: 320,
            maxWidth: 600,
          }}
        >
          <AlertTriangle size={16} className="shrink-0" />
          <span className="flex-1">{toastError}</span>
          <button onClick={() => setToastError(null)} className="shrink-0"><X size={14} /></button>
        </div>
      )}

      {/* Left: Node Library */}
      <div className="w-56 shrink-0 p-3 overflow-y-auto" style={{ borderRight: '1px solid var(--border-tech)', background: 'var(--bg-panel)' }}>
        <h3 className="font-rajdhani font-bold text-sm uppercase tracking-wider mb-3" style={{ color: 'var(--text-main)' }}>Nodes</h3>
        {nodeCategories.map(cat => (
          <div key={cat.name} className="mb-4">
            <p className="text-[10px] uppercase tracking-wider mb-2 font-bold" style={{ color: 'var(--text-dim)' }}>{cat.name}</p>
            <div className="space-y-1">
              {cat.nodes.map(n => (
                <div
                  key={n.type}
                  className="flex items-center gap-2 px-2 py-1.5 cursor-grab text-xs font-mono select-none"
                  style={{ border: '1px solid var(--border-tech)', background: 'var(--bg-dark)' }}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/reactflow', n.type);
                    e.dataTransfer.setData('label', n.label);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                >
                  <n.icon size={14} style={{ color: n.color }} />
                  <span style={{ color: 'var(--text-main)' }}>{n.label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Center: Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2 flex-wrap" style={{ borderBottom: '1px solid var(--border-tech)', background: 'var(--bg-panel)' }}>
          <input
            value={pipelineName}
            onChange={e => setPipelineName(e.target.value)}
            onKeyDown={e => e.stopPropagation()}
            className="bg-transparent font-rajdhani font-bold text-lg uppercase tracking-wider outline-none"
            style={{ color: 'var(--text-main)', width: 200 }}
          />
          {pipelineStore.isDirty && <Circle size={8} fill="var(--warning)" color="var(--warning)" />}
          {isSaving && <span className="text-[10px] font-mono" style={{ color: 'var(--text-dim)' }}>saving…</span>}
          <div className="flex-1" />

          <select
            value={pipelineId || ''}
            onChange={e => {
              if (e.target.value === '__new__') handleNewPipeline();
              else if (e.target.value) {
                pipelineStore.setActivePipeline(e.target.value);
                navigate(`/canvas?id=${e.target.value}`, { replace: true });
              }
            }}
            className="text-xs font-mono px-2 py-1 outline-none"
            style={{ background: 'var(--bg-dark)', color: 'var(--text-main)', border: '1px solid var(--border-tech)' }}
          >
            <option value="">Select Pipeline</option>
            {pipelineStore.pipelines.map(p => (
              <option key={p.id} value={p.id}>{typeof p.name === 'string' ? p.name : 'Untitled'}</option>
            ))}
            <option value="__new__">+ New Pipeline</option>
          </select>

          <AppButton variant="secondary" icon={Trash2} onClick={handleClear}>Clear</AppButton>
          <AppButton variant="secondary" icon={Save} onClick={() => handleSave()} disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Save'}
          </AppButton>
          <AppButton variant="secondary" icon={Play} onClick={handleRun}
            title={linkedAgent ? 'Run pipeline now' : 'Deploy & run'}>
            Run
          </AppButton>
          <AppButton variant="primary" icon={Rocket} onClick={() => handleDeploy()}>Deploy</AppButton>
        </div>

        {/* React Flow */}
        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={decoratedNodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onInit={setReactFlowInstance}
            nodeTypes={nodeTypes}
            fitView
            deleteKeyCode="Delete"
          >
            <Background color="var(--dot-color)" gap={20} size={1} />
            <Controls />
            <MiniMap
              style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-tech)' }}
              maskColor="rgba(0,0,0,0.2)"
            />
          </ReactFlow>
        </div>
      </div>

      {/* Right: Config Panel */}
      <div className="w-72 shrink-0 p-4 overflow-y-auto" style={{ borderLeft: '1px solid var(--border-tech)', background: 'var(--bg-panel)' }}>
        {selectedNode ? (
          <NodeConfigPanel
            key={selectedNode.id}
            node={selectedNode}
            onConfigChange={(config) => updateNodeConfig(selectedNode.id, config)}
            linkedAgent={linkedAgent}
          />
        ) : (
          <div className="text-center py-8" style={{ color: 'var(--text-dim)' }}>
            <p className="text-sm font-mono">Select a node to configure</p>
          </div>
        )}
      </div>

      {/* Name Pipeline Modal */}
      {showNamePipeline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <TechCard className="w-80 p-6">
            <h3 className="font-rajdhani font-bold text-lg uppercase tracking-wider mb-1" style={{ color: 'var(--text-main)' }}>
              Name Your Pipeline
            </h3>
            <p className="text-xs font-mono mb-4" style={{ color: 'var(--text-dim)' }}>
              Give this pipeline a name before {pendingNameAction === 'deploy' ? 'deploying' : 'saving'}.
            </p>
            <input
              value={pipelineName === 'New Pipeline' ? '' : pipelineName}
              onChange={e => setPipelineName(e.target.value)}
              onKeyDown={e => {
                e.stopPropagation();
                if (e.key === 'Enter') handleConfirmPipelineName(pipelineName);
                if (e.key === 'Escape') { setShowNamePipeline(false); setPendingNameAction(null); }
              }}
              className="w-full px-3 py-2 text-sm font-mono outline-none mb-4"
              style={{ background: 'var(--bg-dark)', color: 'var(--text-main)', border: '1px solid var(--border-tech)' }}
              placeholder="e.g. Daily DeFi Rebalance"
              autoFocus
            />
            <div className="flex gap-2">
              <AppButton
                variant="secondary"
                onClick={() => { setShowNamePipeline(false); setPendingNameAction(null); }}
                className="flex-1"
              >
                Cancel
              </AppButton>
              <AppButton
                variant="primary"
                onClick={() => handleConfirmPipelineName(pipelineName)}
                disabled={!pipelineName.trim() || pipelineName === 'New Pipeline'}
                className="flex-1"
              >
                {pendingNameAction === 'deploy' ? 'Save & Deploy' : 'Save'}
              </AppButton>
            </div>
          </TechCard>
        </div>
      )}

      {/* Create Agent Modal */}
      {showCreateAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <TechCard className="w-96 p-6">
            <h3 className="font-rajdhani font-bold text-lg uppercase tracking-wider mb-1" style={{ color: 'var(--text-main)' }}>
              {runAfterDeploy ? 'Deploy & Run' : 'Create Agent'}
            </h3>
            <p className="text-xs font-mono mb-4" style={{ color: 'var(--text-dim)' }}>
              {runAfterDeploy
                ? "Name this pipeline's agent — it will deploy and immediately execute."
                : 'Wrap this pipeline in an agent to schedule and run it.'}
            </p>
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-xs font-mono block mb-1" style={{ color: 'var(--text-dim)' }}>Agent Name</label>
                <input
                  value={agentName}
                  onChange={e => setAgentName(e.target.value)}
                  onKeyDown={e => e.stopPropagation()}
                  className="w-full px-3 py-2 text-sm font-mono outline-none"
                  style={{ background: 'var(--bg-dark)', color: 'var(--text-main)', border: '1px solid var(--border-tech)' }}
                  placeholder="My Agent"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-mono block mb-1" style={{ color: 'var(--text-dim)' }}>Vault Address (optional)</label>
                <input
                  value={agentVault}
                  onChange={e => setAgentVault(e.target.value)}
                  onKeyDown={e => e.stopPropagation()}
                  className="w-full px-3 py-2 text-sm font-mono outline-none"
                  style={{ background: 'var(--bg-dark)', color: 'var(--text-main)', border: '1px solid var(--border-tech)' }}
                  placeholder={walletStore.address || '0x... (defaults to connected wallet)'}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <AppButton
                variant="secondary"
                onClick={() => { setShowCreateAgent(false); setRunAfterDeploy(false); }}
                className="flex-1"
              >
                Cancel
              </AppButton>
              <AppButton
                variant="primary"
                onClick={handleCreateAndDeploy}
                disabled={!agentName.trim()}
                className="flex-1"
              >
                {runAfterDeploy ? 'Deploy & Run' : 'Deploy'}
              </AppButton>
            </div>
          </TechCard>
        </div>
      )}
    </div>
  );
}
