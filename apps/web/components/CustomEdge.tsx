"use client";

import React from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  EdgeProps,
} from "@xyflow/react";

export interface CustomEdgeData {
  amount: string;
  formattedAmount: string;
  asset: string;
  txHash: string;
  timestamp: string;
  isTokenTransfer?: boolean;
  isCrossChain?: boolean;
  bridgeName?: string;
  [key: string]: unknown;
}

export const CustomEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  selected,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetPosition,
    targetX,
    targetY,
  });

  const edgeData = data as unknown as CustomEdgeData & { isDimmed?: boolean; isPathHighlighted?: boolean };
  const isCrossChain = edgeData?.isCrossChain;
  const bridgeName = edgeData?.bridgeName;
  const isPath = edgeData?.isPathHighlighted;
  const isDimmed = edgeData?.isDimmed;

  let strokeColor = "#4b5563";
  let strokeWidth = 1.5;

  if (isPath) {
    strokeColor = "#22d3ee";
    strokeWidth = 3;
  } else if (selected) {
    strokeColor = "#6366f1";
    strokeWidth = 2.5;
  } else if (isCrossChain) {
    strokeColor = "#a855f7";
    strokeWidth = 2.5;
  }

  const opacityStyle = isDimmed ? { opacity: 0.15 } : { opacity: 1 };

  // Build label text — show bridge name for cross-chain edges
  const amountLabel = edgeData?.formattedAmount || `${edgeData?.amount || ""} ${edgeData?.asset || ""}`;
  const labelText = isCrossChain && bridgeName
    ? `🌉 ${amountLabel}`
    : amountLabel;

  return (
    <>
      {/* For cross-chain edges, render a secondary glow path underneath */}
      {isCrossChain && !isDimmed && (
        <BaseEdge
          path={edgePath}
          style={{
            ...style,
            strokeWidth: strokeWidth + 4,
            stroke: "#a855f7",
            opacity: 0.15,
            strokeDasharray: "8,6",
            filter: "blur(3px)",
          }}
        />
      )}
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          ...opacityStyle,
          strokeWidth,
          stroke: strokeColor,
          strokeDasharray: isCrossChain ? "8,4" : undefined,
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
            ...opacityStyle,
          }}
          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium shadow-lg backdrop-blur-md cursor-pointer transition-transform hover:scale-110 ${
            isPath
              ? "bg-cyan-900 text-cyan-200 border border-cyan-400 font-bold ring-2 ring-cyan-400"
              : selected
              ? "bg-brand-600 text-white ring-2 ring-brand-400 font-bold"
              : isCrossChain
              ? "bg-purple-950/90 text-purple-200 border border-purple-500 ring-1 ring-purple-500/50"
              : "bg-gray-900/90 text-gray-300 border border-gray-700 hover:border-gray-500"
          }`}
          title={`Tx: ${edgeData?.txHash || "N/A"}${bridgeName ? ` | Bridge: ${bridgeName}` : ""}`}
        >
          {labelText}
        </div>
        {/* Bridge name badge below the edge label for cross-chain */}
        {isCrossChain && bridgeName && !isDimmed && (
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY + 18}px)`,
              pointerEvents: "none",
            }}
            className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-purple-900/80 text-purple-300 border border-purple-700/60 tracking-wider"
          >
            {bridgeName}
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
};

