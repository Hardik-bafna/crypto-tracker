"use client";

import React, { useMemo, useCallback, useEffect, useState } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  NodeTypes,
  EdgeTypes,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  GraphData,
  GraphNode,
  GraphEdge,
  TracePathDetail,
  TracePathOptions,
} from "@crypto-tracer/types";
import { TransactionGraph, findMultipleTracePaths } from "@crypto-tracer/graph";
import { CustomNode } from "./CustomNode";
import { CustomEdge } from "./CustomEdge";
import {
  Compass,
  ArrowRight,
  Filter,
  Play,
  RotateCcw,
  Check,
  ChevronRight,
  Shield,
  Layers,
  Sparkles,
  Link2,
  DollarSign,
} from "lucide-react";

interface Props {
  graphData: GraphData;
  onSelectNode: (node: GraphNode | null) => void;
  onSelectEdge: (edge: GraphEdge | null) => void;
  selectedNodeId?: string;
}

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

export const GraphCanvas: React.FC<Props> = ({
  graphData,
  onSelectNode,
  onSelectEdge,
  selectedNodeId,
}) => {
  // Trace Money Mode state
  const [isTracePanelOpen, setIsTracePanelOpen] = useState(false);
  const [startAddr, setStartAddr] = useState<string>("");
  const [destAddr, setDestAddr] = useState<string>("");
  const [maxHops, setMaxHops] = useState<number>(6);
  const [minAmount, setMinAmount] = useState<string>("");

  // Trace Results
  const [discoveredPaths, setDiscoveredPaths] = useState<TracePathDetail[]>([]);
  const [activePathIndex, setActivePathIndex] = useState<number>(0);
  const [isTraceActive, setIsTraceActive] = useState(false);

  // Set default start address from target or first node
  useEffect(() => {
    if (graphData.nodes.length > 0) {
      const targetNode = graphData.nodes.find((n) => n.isTarget) || graphData.nodes[0];
      if (targetNode && !startAddr) {
        setStartAddr(targetNode.address);
      }
    }
  }, [graphData, startAddr]);

  // Compute active path nodes and edges sets for highlighting
  const activePath = isTraceActive && discoveredPaths.length > 0 ? discoveredPaths[activePathIndex] : null;

  const activePathNodeIds = useMemo(() => {
    if (!activePath) return new Set<string>();
    return new Set(activePath.nodes.map((n) => n.address.toLowerCase()));
  }, [activePath]);

  const activePathEdgeIds = useMemo(() => {
    if (!activePath) return new Set<string>();
    return new Set(activePath.edges.map((e) => e.id));
  }, [activePath]);

  // Neighbor nodes and edges for single selected node
  const { neighborNodeIds, neighborEdgeIds } = useMemo(() => {
    if (!selectedNodeId || isTraceActive) {
      return { neighborNodeIds: new Set<string>(), neighborEdgeIds: new Set<string>() };
    }
    const sel = selectedNodeId.toLowerCase();
    const nodeSet = new Set<string>([sel]);
    const edgeSet = new Set<string>();

    graphData.edges.forEach((edge) => {
      const src = edge.source.toLowerCase();
      const tgt = edge.target.toLowerCase();
      if (src === sel) {
        nodeSet.add(tgt);
        edgeSet.add(edge.id);
      }
      if (tgt === sel) {
        nodeSet.add(src);
        edgeSet.add(edge.id);
      }
    });

    return { neighborNodeIds: nodeSet, neighborEdgeIds: edgeSet };
  }, [selectedNodeId, graphData.edges, isTraceActive]);

  // Convert GraphData into React Flow nodes and edges with layered positioning & highlight states
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Group nodes by hopLevel or BFS layer
    const layerMap = new Map<number, GraphNode[]>();

    graphData.nodes.forEach((node) => {
      const hop = node.hopLevel ?? (node.isTarget ? 0 : 1);
      const list = layerMap.get(hop) || [];
      list.push(node);
      layerMap.set(hop, list);
    });

    const sortedHops = Array.from(layerMap.keys()).sort((a, b) => a - b);
    const X_SPACING = 340;
    const Y_SPACING = 150;

    sortedHops.forEach((hop) => {
      const nodesInHop = layerMap.get(hop) || [];
      const totalInHop = nodesInHop.length;
      const startY = -((totalInHop - 1) * Y_SPACING) / 2;

      nodesInHop.forEach((node, idx) => {
        const addrLower = node.address.toLowerCase();

        const isPathHighlighted = activePathNodeIds.has(addrLower);
        const isNeighborHighlighted = neighborNodeIds.has(addrLower);
        const isSelected = addrLower === selectedNodeId?.toLowerCase();

        // Dim if trace mode is active and not on path, OR if node selected and not in neighborhood
        let isDimmed = false;
        if (isTraceActive) {
          isDimmed = !isPathHighlighted;
        } else if (selectedNodeId) {
          isDimmed = !isNeighborHighlighted;
        }

        nodes.push({
          id: addrLower,
          type: "custom",
          position: {
            x: hop * X_SPACING + 100,
            y: startY + idx * Y_SPACING + 280,
          },
          data: {
            ...node,
            isDimmed,
            isPathHighlighted,
            isNeighborHighlighted,
          },
          selected: isSelected,
        });
      });
    });

    graphData.edges.forEach((edge) => {
      const isPathHighlighted = activePathEdgeIds.has(edge.id);
      const isNeighborEdge = neighborEdgeIds.has(edge.id);

      let isDimmed = false;
      if (isTraceActive) {
        isDimmed = !isPathHighlighted;
      } else if (selectedNodeId) {
        isDimmed = !isNeighborEdge;
      }

      edges.push({
        id: edge.id,
        source: edge.source.toLowerCase(),
        target: edge.target.toLowerCase(),
        type: "custom",
        data: {
          ...edge,
          isDimmed,
          isPathHighlighted,
        },
        animated: edge.isCrossChain || isPathHighlighted,
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [
    graphData,
    selectedNodeId,
    isTraceActive,
    activePathNodeIds,
    activePathEdgeIds,
    neighborNodeIds,
    neighborEdgeIds,
  ]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Synchronize internal React Flow state when graphData updates
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Execute Trace Path algorithm
  const handleExecuteTrace = () => {
    if (!startAddr) return;

    const txGraph = new TransactionGraph(graphData);
    const minValNum = parseFloat(minAmount) || 0;

    const paths = findMultipleTracePaths(txGraph, {
      startAddress: startAddr,
      destinationAddress: destAddr || undefined,
      maxHops,
      minAmount: minValNum,
    });

    setDiscoveredPaths(paths);
    setActivePathIndex(0);
    setIsTraceActive(true);
  };

  const handleClearTrace = () => {
    setIsTraceActive(false);
    setDiscoveredPaths([]);
    setActivePathIndex(0);
  };

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const original = graphData.nodes.find(
        (n) => n.address.toLowerCase() === node.id.toLowerCase()
      );
      onSelectNode(original || null);
    },
    [graphData.nodes, onSelectNode]
  );

  const handleEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      const original = graphData.edges.find((e) => e.id === edge.id);
      onSelectEdge(original || null);
    },
    [graphData.edges, onSelectEdge]
  );

  const handlePaneClick = useCallback(() => {
    onSelectNode(null);
    onSelectEdge(null);
  }, [onSelectNode, onSelectEdge]);

  return (
    <div className="w-full h-full min-h-[500px] relative bg-[#0b0f19] flex flex-col">
      {/* ===== TRACE MONEY TOP CONTROL BAR ===== */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 max-w-xl">
        {/* Toggle Button & Quick Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTracePanelOpen(!isTracePanelOpen)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold shadow-lg transition border ${
              isTraceActive
                ? "bg-cyan-600 text-white border-cyan-400 ring-2 ring-cyan-500/50"
                : isTracePanelOpen
                ? "bg-brand-600 text-white border-brand-500"
                : "bg-surface/90 hover:bg-gray-800 text-gray-200 border-gray-700 backdrop-blur-md"
            }`}
          >
            <Compass className={`w-4 h-4 ${isTraceActive ? "animate-pulse text-white" : "text-cyan-400"}`} />
            <span>{isTraceActive ? "Trace Active" : "Trace Money / Path Finding"}</span>
          </button>

          {isTraceActive && (
            <button
              onClick={handleClearTrace}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-800/90 hover:bg-gray-700 text-gray-300 text-xs font-semibold border border-gray-700 shadow-lg backdrop-blur-md transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gray-400" />
              <span>Clear Trace</span>
            </button>
          )}
        </div>

        {/* Expanded Trace Form Drawer */}
        {isTracePanelOpen && (
          <div className="p-4 rounded-2xl bg-surface/95 backdrop-blur-xl border border-gray-800 shadow-2xl space-y-3 w-96 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-200 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-cyan-400" />
                Path Traversal Controls
              </span>
              <span className="text-[10px] text-gray-500 font-mono">
                Existing Graph Data
              </span>
            </div>

            {/* Form Inputs */}
            <div className="space-y-2.5 text-xs">
              {/* Start Address */}
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">
                  Start Wallet
                </label>
                <select
                  value={startAddr}
                  onChange={(e) => setStartAddr(e.target.value)}
                  className="w-full bg-black/60 border border-gray-800 rounded-lg px-2.5 py-1.5 text-gray-200 font-mono text-xs focus:outline-none focus:border-brand-500"
                >
                  {graphData.nodes.map((node) => (
                    <option key={node.address} value={node.address}>
                      {node.isTarget ? "🎯 [Target] " : ""}{node.entityName ? `[${node.entityName}] ` : ""}{node.address.slice(0, 8)}...{node.address.slice(-6)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination Address / Entity */}
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">
                  Destination Wallet / Entity (Optional)
                </label>
                <select
                  value={destAddr}
                  onChange={(e) => setDestAddr(e.target.value)}
                  className="w-full bg-black/60 border border-gray-800 rounded-lg px-2.5 py-1.5 text-gray-200 font-mono text-xs focus:outline-none focus:border-brand-500"
                >
                  <option value="">Any Cash-out Endpoint / Endpoint Wallet</option>
                  {graphData.nodes.map((node) => (
                    <option key={node.address} value={node.address}>
                      {node.entityName ? `🏦 ${node.entityName} (${node.entityType})` : `${node.address.slice(0, 10)}...${node.address.slice(-6)}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Max Hops & Min Amount Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">
                    Max Hops (1-10)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={maxHops}
                    onChange={(e) => setMaxHops(parseInt(e.target.value) || 6)}
                    className="w-full bg-black/60 border border-gray-800 rounded-lg px-2.5 py-1.5 text-gray-200 font-mono text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">
                    Min Value ($/Tokens)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 50"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    className="w-full bg-black/60 border border-gray-800 rounded-lg px-2.5 py-1.5 text-gray-200 font-mono text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-between gap-2 border-t border-gray-800">
              <button
                onClick={handleExecuteTrace}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-lg"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Find Flow Paths</span>
              </button>

              {isTraceActive && (
                <button
                  onClick={handleClearTrace}
                  className="px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium border border-gray-700 transition"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ===== DISCOVERED PATH METRICS CARD ===== */}
      {isTraceActive && discoveredPaths.length > 0 && activePath && (
        <div className="absolute top-4 right-4 z-20 w-80 bg-surface/95 backdrop-blur-xl border border-cyan-800/80 rounded-2xl p-4 shadow-2xl space-y-3">
          {/* Header & Path Switcher */}
          <div className="flex items-center justify-between border-b border-gray-800 pb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-gray-200 uppercase">
                Path Route {activePathIndex + 1} of {discoveredPaths.length}
              </span>
            </div>
            {discoveredPaths.length > 1 && (
              <div className="flex gap-1">
                {discoveredPaths.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePathIndex(i)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition ${
                      activePathIndex === i
                        ? "bg-cyan-600 text-white border-cyan-400"
                        : "bg-gray-800 text-gray-400 border-gray-700 hover:text-white"
                    }`}
                  >
                    P{i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Metrics Overview */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-gray-900/80 border border-gray-800">
              <span className="text-[9px] font-bold uppercase text-gray-500 block mb-0.5">
                Total Volume
              </span>
              <span className="text-xs font-bold font-mono text-cyan-300">
                {activePath.totalVolume} {activePath.asset}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-gray-900/80 border border-gray-800">
              <span className="text-[9px] font-bold uppercase text-gray-500 block mb-0.5">
                Hop Distance
              </span>
              <span className="text-xs font-bold font-mono text-gray-200">
                {activePath.hopCount} Hops
              </span>
            </div>
          </div>

          {/* Known Entities */}
          {activePath.knownEntities.length > 0 && (
            <div>
              <span className="text-[9px] font-bold uppercase text-gray-500 block mb-1">
                Known Entities Encountered
              </span>
              <div className="flex flex-wrap gap-1">
                {activePath.knownEntities.map((ent, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-semibold"
                  >
                    {ent}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suspicious Indicators */}
          {activePath.suspiciousIndicators.length > 0 && (
            <div>
              <span className="text-[9px] font-bold uppercase text-gray-500 block mb-1">
                Suspicious Indicators
              </span>
              <div className="space-y-1">
                {activePath.suspiciousIndicators.map((ind, idx) => (
                  <div
                    key={idx}
                    className="text-[10px] text-amber-300 flex items-center gap-1 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/60"
                  >
                    <Shield className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>{ind}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sequence Node Flow */}
          <div>
            <span className="text-[9px] font-bold uppercase text-gray-500 block mb-1">
              Path Flow Sequence
            </span>
            <div className="flex items-center gap-1 overflow-x-auto py-1 text-[10px] font-mono text-gray-300">
              {activePath.nodes.map((n, idx) => (
                <React.Fragment key={n.address}>
                  <span
                    className={`px-1.5 py-0.5 rounded ${
                      n.entityName
                        ? "bg-emerald-900/80 text-emerald-300 font-bold"
                        : "bg-gray-800 text-gray-300"
                    }`}
                    title={n.address}
                  >
                    {n.entityName || `${n.address.slice(0, 4)}…${n.address.slice(-2)}`}
                  </span>
                  {idx < activePath.nodes.length - 1 && (
                    <ChevronRight className="w-3 h-3 text-gray-600 shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* No Paths Discovered Alert */}
      {isTraceActive && discoveredPaths.length === 0 && (
        <div className="absolute top-4 right-4 z-20 w-80 bg-surface/95 backdrop-blur-xl border border-rose-800/80 rounded-2xl p-4 shadow-2xl text-xs space-y-2">
          <div className="flex items-center gap-2 text-rose-400 font-bold">
            <Shield className="w-4 h-4" />
            <span>No Path Found</span>
          </div>
          <p className="text-gray-400 text-[11px] leading-relaxed">
            No valid transfer paths matched the selected start wallet and filter parameters within {maxHops} hops. Try relaxing the hop count or minimum value.
          </p>
        </div>
      )}

      {/* React Flow Visualizer Canvas */}
      <div className="flex-1 w-full h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodeClick={handleNodeClick}
          onEdgeClick={handleEdgeClick}
          onPaneClick={handlePaneClick}
          fitView
          minZoom={0.2}
          maxZoom={2}
          attributionPosition="bottom-left"
        >
          <Background color="#1f2937" gap={20} size={1} variant={BackgroundVariant.Dots} />
          <Controls position="bottom-right" />
          <MiniMap
            nodeColor={(n) => {
              const data = n.data as any;
              if (data?.isTarget) return "#f59e0b";
              if (data?.entityType === "MIXER") return "#e11d48";
              if (data?.entityType === "EXCHANGE") return "#10b981";
              if (data?.entityType === "BRIDGE") return "#06b6d4";
              return "#4b5563";
            }}
            maskColor="rgba(11, 15, 25, 0.8)"
            position="bottom-left"
            className="!mb-8 !ml-4"
          />
        </ReactFlow>
      </div>
    </div>
  );
};
