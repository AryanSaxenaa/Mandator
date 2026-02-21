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
import { Save, Play, Rocket, Trash2, Circle } from 'lucide-react';
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
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pipelineId = searchParams.get('id') || pipelineStore.activePipelineId;
  const linkedAgent = agentStore.agents.find(a => a.pipelineId === pipelineId);

  // Always derive selectedNode from the live nodes array so it stays fresh on every config update
  const selectedNode = useMemo(
    () => (selectedNodeId ? nodes.find(n => n.id === selectedNodeId) ?? null : null),
    [nodes, selectedNodeId],
  );

  useAgentSocket(linkedAgent?.id || null);

  const executingNodeIds = useExecutionStore(s => s.executingNodeIds);
  const completedNodeIds = useExecutionStore(s => s.completedNodeIds);
  const errorNodeIds = useExecutionStore(s => s.errorNodeIds);
  const blockedNodeIds = useExecutionStore(s => s.blockedNodeIds);

  const decoratedNodes = useMemo(() => {
    return nodes.map(n => ({
      ...n,
      data: {
        ...n.data,
        _executing: executingNodeIds.has(n.id),
        _completed: completedNodeIds.has(n.id),
        _errored: errorNodeIds.has(n.id),
        _blocked: blockedNodeIds.has(n.id),
      },
    }));
  }, [nodes, executingNodeIds, completedNodeIds, errorNodeIds, blockedNodeIds]);

  useEffect(() => {
    pipelineStore.fetchPipelines();
    agentStore.fetchAgents();
  }, []);

  useEffect(() => {
    if (pipelineId) {
      const pipe = pipelineStore.pipelines.find(p => p.id === pipelineId);
      if (pipe) {
        setNodes(pipe.nodes || []);
        setEdges(pipe.edges || []);
        setPipelineName(pipe.name || 'Pipeline');
      }
    }
  }, [pipelineId, pipelineStore.pipelines]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes(nds => applyNodeChanges(changes, nds));
    pipelineStore.markDirty();
    debouncedSave();
  }, [pipelineId]);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges(eds => applyEdgeChanges(changes, eds));
    pipelineStore.markDirty();
    debouncedSave();
  }, [pipelineId]);

  const onConnect = useCallback((connection: Connection) => {
    setEdges(eds => addEdge(connection, eds));
    pipelineStore.markDirty();
    debouncedSave();
  }, [pipelineId]);

  const debouncedSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      if (pipelineId) {
        pipelineStore.savePipeline(pipelineId, nodes, edges).catch(() => {});
      }
    }, 2000);
  }, [pipelineId, nodes, edges]);

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

    const position = reactFlowInstance.screenToFlowPosition({
      x: e.clientX,
      y: e.clientY,
    });

    const newNode: Node = {
      id: `node_${++nodeIdCounter}_${Date.now()}`,
      type,
      position,
      data: { label: label || type, config: {} },
    };

    setNodes(nds => [...nds, newNode]);
    pipelineStore.markDirty();
    debouncedSave();
  }, [reactFlowInstance, pipelineId]);

  const handleSave = async () => {
    if (!pipelineId) {
      const pipe = await pipelineStore.createPipeline(pipelineName);
      pipelineStore.setActivePipeline(pipe.id);
      navigate(`/canvas?id=${pipe.id}`, { replace: true });
      await pipelineStore.savePipeline(pipe.id, nodes, edges);
    } else {
      await pipelineStore.savePipeline(pipelineId, nodes, edges);
    }
  };

  const handleClear = () => {
    setNodes([]);
    setEdges([]);
    pipelineStore.markDirty();
  };

  const handleDeploy = async () => {
    await handleSave();
    const currentPipelineId = pipelineId || pipelineStore.activePipelineId;
    if (!currentPipelineId) return;

    const existing = agentStore.agents.find(a => a.pipelineId === currentPipelineId);
    if (existing) {
      await agentStore.deployAgent(existing.id);
      navigate(`/agent/${existing.id}`);
    } else {
      setShowCreateAgent(true);
    }
  };

  const handleCreateAndDeploy = async () => {
    const currentPipelineId = pipelineId || pipelineStore.activePipelineId;
    if (!currentPipelineId || !agentName) return;
    const agent = await agentStore.createAgent({
      name: agentName,
      pipelineId: currentPipelineId,
      vaultAddress: agentVault || walletStore.address || '',
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
  };

  const handleRun = async () => {
    if (!linkedAgent) {
      // No agent yet — open the create-agent modal and run immediately after deploying
      setRunAfterDeploy(true);
      setShowCreateAgent(true);
      return;
    }
    executionStore.resetExecution();
    await agentStore.runAgent(linkedAgent.id);
  };

  const updateNodeConfig = useCallback((nodeId: string, config: Record<string, unknown>) => {
    setNodes(nds => nds.map(n => {
      if (n.id === nodeId) {
        // Extract __label if present and apply it to data.label
        const { __label, ...restConfig } = config;
        const newData = { 
          ...n.data, 
          config: restConfig 
        };
        if (__label !== undefined) {
          newData.label = __label as string;
        }
        return { ...n, data: newData };
      }
      return n;
    }));
    pipelineStore.markDirty();
    debouncedSave();
  }, [pipelineId]);

  const handleNewPipeline = async () => {
    const pipe = await pipelineStore.createPipeline('Untitled Pipeline');
    pipelineStore.setActivePipeline(pipe.id);
    setNodes([]);
    setEdges([]);
    setPipelineName(pipe.name);
    navigate(`/canvas?id=${pipe.id}`, { replace: true });
  };

  return (
    <div className="flex h-full">
      {/* Left: Node Library */}
      <div className="w-56 shrink-0 p-3 overflow-y-auto" style={{ borderRight: '1px solid var(--border-tech)', background: 'var(--bg-panel)' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-rajdhani font-bold text-sm uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>Nodes</h3>
        </div>
        {nodeCategories.map(cat => (
          <div key={cat.name} className="mb-4">
            <p className="text-[10px] uppercase tracking-wider mb-2 font-bold" style={{ color: 'var(--text-dim)' }}>{cat.name}</p>
            <div className="space-y-1">
              {cat.nodes.map(n => (
                <div
                  key={n.type}
                  className="flex items-center gap-2 px-2 py-1.5 cursor-grab text-xs font-mono"
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
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-4 py-2" style={{ borderBottom: '1px solid var(--border-tech)', background: 'var(--bg-panel)' }}>
          <input
            value={pipelineName}
            onChange={e => setPipelineName(e.target.value)}
            className="bg-transparent font-rajdhani font-bold text-lg uppercase tracking-wider outline-none"
            style={{ color: 'var(--text-main)', width: 200 }}
          />
          {pipelineStore.isDirty && (
            <Circle size={8} fill="var(--warning)" color="var(--warning)" />
          )}
          <div className="flex-1" />

          {/* Pipeline selector */}
          <select
            value={pipelineId || ''}
            onChange={e => {
              if (e.target.value === '__new__') {
                handleNewPipeline();
              } else if (e.target.value) {
                pipelineStore.setActivePipeline(e.target.value);
                navigate(`/canvas?id=${e.target.value}`, { replace: true });
              }
            }}
            className="text-xs font-mono px-2 py-1 outline-none"
            style={{ background: 'var(--bg-dark)', color: 'var(--text-main)', border: '1px solid var(--border-tech)' }}
          >
            <option value="">Select Pipeline</option>
            {pipelineStore.pipelines.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
            <option value="__new__">+ New Pipeline</option>
          </select>

          <AppButton variant="secondary" icon={Trash2} onClick={handleClear}>Clear</AppButton>
          <AppButton variant="secondary" icon={Save} onClick={handleSave}>Save</AppButton>
          <AppButton variant="secondary" icon={Play} onClick={handleRun}
            title={linkedAgent ? 'Run pipeline now' : 'Deploy pipeline as agent, then run'}
          >Run</AppButton>
          <AppButton variant="primary" icon={Rocket} onClick={handleDeploy}>Deploy</AppButton>
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

      {/* Create Agent Modal */}
      {showCreateAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <TechCard className="w-96">
            <h3 className="font-rajdhani font-bold text-lg uppercase tracking-wider mb-1" style={{ color: 'var(--text-main)' }}>
              {runAfterDeploy ? 'Deploy & Run' : 'Create Agent'}
            </h3>
            <p className="text-xs font-mono mb-4" style={{ color: 'var(--text-dim)' }}>
              {runAfterDeploy
                ? 'Give this pipeline an agent name, then it will deploy and run immediately.'
                : 'Create an agent to deploy and manage this pipeline.'}
            </p>
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-xs font-mono block mb-1" style={{ color: 'var(--text-dim)' }}>Agent Name</label>
                <input
                  value={agentName}
                  onChange={e => setAgentName(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono outline-none"
                  style={{ background: 'var(--bg-dark)', color: 'var(--text-main)', border: '1px solid var(--border-tech)' }}
                  placeholder="My Agent"
                />
              </div>
              <div>
                <label className="text-xs font-mono block mb-1" style={{ color: 'var(--text-dim)' }}>Vault Address</label>
                <input
                  value={agentVault}
                  onChange={e => setAgentVault(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono outline-none"
                  style={{ background: 'var(--bg-dark)', color: 'var(--text-main)', border: '1px solid var(--border-tech)' }}
                  placeholder={walletStore.address || '0x...'}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <AppButton variant="secondary" onClick={() => { setShowCreateAgent(false); setRunAfterDeploy(false); }} className="flex-1">Cancel</AppButton>
              <AppButton variant="primary" onClick={handleCreateAndDeploy} disabled={!agentName} className="flex-1">
                {runAfterDeploy ? 'Deploy & Run' : 'Deploy'}
              </AppButton>
            </div>
          </TechCard>
        </div>
      )}
    </div>
  );
}
