"use client";

import React, { useMemo, useCallback, useEffect } from "react";
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
import { GraphData, GraphNode, GraphEdge } from "@crypto-tracer/types";
import { CustomNode } from "./CustomNode";
import { CustomEdge } from "./CustomEdge";

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
  // Convert GraphData into React Flow nodes and edges with layered positioning
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
        nodes.push({
          id: node.address.toLowerCase(),
          type: "custom",
          position: {
            x: hop * X_SPACING + 100,
            y: startY + idx * Y_SPACING + 280,
          },
          data: {
            ...node,
          },
          selected: node.address.toLowerCase() === selectedNodeId?.toLowerCase(),
        });
      });
    });

    graphData.edges.forEach((edge) => {
      edges.push({
        id: edge.id,
        source: edge.source.toLowerCase(),
        target: edge.target.toLowerCase(),
        type: "custom",
        data: {
          ...edge,
        },
        animated: edge.isCrossChain,
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [graphData, selectedNodeId]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Synchronize internal React Flow state when graphData updates
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

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
    <div className="w-full h-full min-h-[500px] relative bg-[#0b0f19]">
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
  );
};
