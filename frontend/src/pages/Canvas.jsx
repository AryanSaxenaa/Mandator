import { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Background,
  Controls,
  MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import { Save, Play, Trash2, GripVertical } from 'lucide-react';
import { nodeTypes, nodeCategories } from '../components/nodes';
import { AppButton, Badge, TechCard } from '../components/ui/TechCard';
import { useCreatePipeline, useUpdatePipeline, usePipelines, useExecutePipeline } from '../hooks/useData';
import { useAppStore } from '../store/appStore';

let idCounter = 0;
const getId = () => `node_${Date.now()}_${idCounter++}`;

export default function Canvas() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [pipelineName, setPipelineName] = useState('Untitled Pipeline');
  const [pipelineId, setPipelineId] = useState(null);
  const [selectedNodeData, setSelectedNodeData] = useState(null);
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const createPipeline = useCreatePipeline();
  const updatePipeline = useUpdatePipeline();
  const executePipeline = useExecutePipeline();
  const { data: pipelines = [] } = usePipelines();
  const { selectedNode, setSelectedNode } = useAppStore();

  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((params) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: 'var(--accent)' } }, eds)), []);

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node.id);
    setSelectedNodeData(node);
  }, [setSelectedNode]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type || !reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: type.replace('Node', '').replace(/([A-Z])/g, ' $1').trim() },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [reactFlowInstance]
  );

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleSave = async () => {
    const payload = { name: pipelineName, nodes, edges };
    if (pipelineId) {
      await updatePipeline.mutateAsync({ id: pipelineId, ...payload });
    } else {
      const result = await createPipeline.mutateAsync(payload);
      setPipelineId(result.id);
    }
  };

  const handleExecute = async () => {
    if (!pipelineId) {
      const result = await createPipeline.mutateAsync({ name: pipelineName, nodes, edges });
      setPipelineId(result.id);
      await executePipeline.mutateAsync({ pipelineId: result.id, context: {} });
    } else {
      await updatePipeline.mutateAsync({ id: pipelineId, nodes, edges });
      await executePipeline.mutateAsync({ pipelineId, context: {} });
    }
  };

  const handleLoadPipeline = (pipeline) => {
    setPipelineId(pipeline.id);
    setPipelineName(pipeline.name);
    setNodes(pipeline.nodes || []);
    setEdges(pipeline.edges || []);
  };

  const handleClear = () => {
    setNodes([]);
    setEdges([]);
    setPipelineId(null);
    setPipelineName('Untitled Pipeline');
    setSelectedNodeData(null);
  };

  const updateNodeData = (key, value) => {
    if (!selectedNodeData) return;
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedNodeData.id
          ? { ...n, data: { ...n.data, [key]: value } }
          : n
      )
    );
    setSelectedNodeData((prev) => ({ ...prev, data: { ...prev.data, [key]: value } }));
  };

  return (
    <div className="h-full flex" style={{ background: 'var(--bg-dark)' }}>
      {/* Left: Node Panel */}
      <div
        className="w-64 min-w-[256px] overflow-y-auto"
        style={{ borderRight: '1px solid var(--border-tech)', background: 'var(--bg-panel)' }}
      >
        <div className="px-4 py-4" style={{ borderBottom: '1px solid var(--border-tech)' }}>
          <p className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>
            Node Library
          </p>
        </div>

        {nodeCategories.map((cat) => (
          <div key={cat.name} className="px-4 py-3">
            <p className="text-[10px] font-mono uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
              {cat.name}
            </p>
            <div className="space-y-1">
              {cat.nodes.map((n) => (
                <div
                  key={n.type}
                  draggable
                  onDragStart={(e) => onDragStart(e, n.type)}
                  className="flex items-center gap-2 px-3 py-2 cursor-grab active:cursor-grabbing transition-colors"
                  style={{
                    border: '1px solid var(--border-tech)',
                    background: 'var(--bg-panel-transparent)',
                  }}
                >
                  <GripVertical size={12} style={{ color: 'var(--text-dim)' }} />
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center"
                    style={{ background: `${n.color}20` }}
                  >
                    <n.icon size={12} style={{ color: n.color }} />
                  </div>
                  <span className="text-xs font-mono" style={{ color: 'var(--text-main)' }}>
                    {n.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Saved Pipelines */}
        {pipelines.length > 0 && (
          <div className="px-4 py-3" style={{ borderTop: '1px solid var(--border-tech)' }}>
            <p className="text-[10px] font-mono uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
              Saved Pipelines
            </p>
            <div className="space-y-1">
              {pipelines.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleLoadPipeline(p)}
                  className="w-full text-left px-3 py-2 text-xs font-mono transition-colors"
                  style={{
                    border: '1px solid var(--border-tech)',
                    background: pipelineId === p.id ? 'rgba(var(--accent-rgb), 0.1)' : 'var(--bg-panel-transparent)',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Center: Canvas */}
      <div className="flex-1 relative" ref={reactFlowWrapper}>
        {/* Toolbar */}
        <div
          className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between px-4 py-2"
          style={{ background: 'var(--bg-panel-transparent)', border: '1px solid var(--border-tech)', backdropFilter: 'blur(8px)' }}
        >
          <input
            value={pipelineName}
            onChange={(e) => setPipelineName(e.target.value)}
            className="bg-transparent border-none outline-none font-rajdhani font-bold text-lg uppercase tracking-wider"
            style={{ color: 'var(--text-main)' }}
          />
          <div className="flex items-center gap-2">
            <AppButton variant="secondary" icon={Trash2} onClick={handleClear}>
              Clear
            </AppButton>
            <AppButton variant="secondary" icon={Save} onClick={handleSave}>
              Save
            </AppButton>
            <AppButton variant="primary" icon={Play} onClick={handleExecute}>
              Execute
            </AppButton>
          </div>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
          className="h-full"
          style={{ background: 'var(--bg-dark)' }}
        >
          <Background
            variant="dots"
            gap={20}
            size={1}
            color="var(--dot-color, rgba(var(--accent-rgb), 0.2))"
          />
          <Controls
            style={{
              background: 'var(--bg-panel)',
              border: '1px solid var(--border-tech)',
              borderRadius: 0,
            }}
          />
          <MiniMap
            style={{
              background: 'var(--bg-panel)',
              border: '1px solid var(--border-tech)',
            }}
            nodeColor="var(--accent)"
          />
        </ReactFlow>
      </div>

      {/* Right: Config Panel */}
      <div
        className="w-72 min-w-[288px] overflow-y-auto"
        style={{ borderLeft: '1px solid var(--border-tech)', background: 'var(--bg-panel)' }}
      >
        <div className="px-4 py-4" style={{ borderBottom: '1px solid var(--border-tech)' }}>
          <p className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>
            Node Config
          </p>
        </div>

        {selectedNodeData ? (
          <div className="p-4 space-y-4">
            <div>
              <p className="text-[10px] font-mono uppercase mb-1" style={{ color: 'var(--text-dim)' }}>Type</p>
              <Badge color="accent">{selectedNodeData.type}</Badge>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase mb-1" style={{ color: 'var(--text-dim)' }}>Node ID</p>
              <p className="text-xs font-mono" style={{ color: 'var(--text-main)' }}>{selectedNodeData.id}</p>
            </div>

            {/* Config fields per node type */}
            <NodeConfigFields node={selectedNodeData} updateNodeData={updateNodeData} />
          </div>
        ) : (
          <div className="p-4 text-center">
            <p className="text-sm font-mono" style={{ color: 'var(--text-dim)' }}>
              Click a node to configure
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function NodeConfigFields({ node, updateNodeData }) {
  const type = node.type;
  const data = node.data || {};

  const inputStyle = {
    width: '100%',
    padding: '6px 10px',
    fontSize: '12px',
    fontFamily: "'JetBrains Mono', monospace",
    background: 'var(--bg-dark)',
    border: '1px solid var(--border-tech)',
    color: 'var(--text-main)',
    outline: 'none',
  };

  const labelStyle = {
    color: 'var(--text-dim)',
    fontSize: '10px',
    fontFamily: "'JetBrains Mono', monospace",
    textTransform: 'uppercase',
    marginBottom: '4px',
    display: 'block',
  };

  switch (type) {
    case 'timeTriggerNode':
      return (
        <div>
          <label style={labelStyle}>Cron Expression</label>
          <input style={inputStyle} value={data.cron || ''} onChange={(e) => updateNodeData('cron', e.target.value)} placeholder="* * * * *" />
        </div>
      );

    case 'balanceTriggerNode':
      return (
        <>
          <div>
            <label style={labelStyle}>Operator</label>
            <select style={inputStyle} value={data.operator || 'below'} onChange={(e) => updateNodeData('operator', e.target.value)}>
              <option value="below">Below</option>
              <option value="above">Above</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Threshold (ETH)</label>
            <input style={inputStyle} type="number" value={data.threshold || ''} onChange={(e) => updateNodeData('threshold', e.target.value)} />
          </div>
        </>
      );

    case 'spendLimitCheckNode':
      return (
        <div>
          <label style={labelStyle}>Limit (ETH)</label>
          <input style={inputStyle} type="number" value={data.limit || ''} onChange={(e) => updateNodeData('limit', e.target.value)} />
        </div>
      );

    case 'dailyBudgetGateNode':
      return (
        <div>
          <label style={labelStyle}>Daily Budget (ETH)</label>
          <input style={inputStyle} type="number" value={data.budget || ''} onChange={(e) => updateNodeData('budget', e.target.value)} />
        </div>
      );

    case 'whitelistCheckNode':
      return (
        <div>
          <label style={labelStyle}>Addresses (comma-separated)</label>
          <textarea
            style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
            value={data.addresses || ''}
            onChange={(e) => updateNodeData('addresses', e.target.value)}
            placeholder="0xabc..., 0xdef..."
          />
        </div>
      );

    case 'cooldownTimerNode':
      return (
        <div>
          <label style={labelStyle}>Cooldown (minutes)</label>
          <input style={inputStyle} type="number" value={data.minutes || ''} onChange={(e) => updateNodeData('minutes', e.target.value)} />
        </div>
      );

    case 'aiDecisionNode':
      return (
        <>
          <div>
            <label style={labelStyle}>Prompt</label>
            <textarea
              style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
              value={data.prompt || ''}
              onChange={(e) => updateNodeData('prompt', e.target.value)}
              placeholder="Should this transaction proceed?"
            />
          </div>
          <div>
            <label style={labelStyle}>Model</label>
            <input style={inputStyle} value={data.model || 'llama-3.1-8b-instant'} onChange={(e) => updateNodeData('model', e.target.value)} />
          </div>
        </>
      );

    case 'payNode':
      return (
        <>
          <div>
            <label style={labelStyle}>Recipient</label>
            <input style={inputStyle} value={data.recipient || ''} onChange={(e) => updateNodeData('recipient', e.target.value)} placeholder="0x..." />
          </div>
          <div>
            <label style={labelStyle}>Amount (ETH)</label>
            <input style={inputStyle} type="number" value={data.amount || ''} onChange={(e) => updateNodeData('amount', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Memo</label>
            <input style={inputStyle} value={data.memo || ''} onChange={(e) => updateNodeData('memo', e.target.value)} />
          </div>
        </>
      );

    case 'autoTopupNode':
      return (
        <div>
          <label style={labelStyle}>Amount (ETH)</label>
          <input style={inputStyle} type="number" value={data.amount || ''} onChange={(e) => updateNodeData('amount', e.target.value)} />
        </div>
      );

    case 'alertNode':
    case 'logNode':
      return (
        <div>
          <label style={labelStyle}>Message</label>
          <textarea
            style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
            value={data.message || ''}
            onChange={(e) => updateNodeData('message', e.target.value)}
          />
        </div>
      );

    default:
      return <p className="text-xs font-mono" style={{ color: 'var(--text-dim)' }}>No configurable fields</p>;
  }
}
