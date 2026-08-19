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
    strokeColor = "#06b6d4";
  }

  const opacityStyle = isDimmed ? { opacity: 0.15 } : { opacity: 1 };

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          ...opacityStyle,
          strokeWidth,
          stroke: strokeColor,
          strokeDasharray: isCrossChain ? "5,5" : undefined,
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
              ? "bg-cyan-950/90 text-cyan-300 border border-cyan-700"
              : "bg-gray-900/90 text-gray-300 border border-gray-700 hover:border-gray-500"
          }`}
          title={`Tx: ${edgeData?.txHash || "N/A"}`}
        >
          {edgeData?.formattedAmount || `${edgeData?.amount || ""} ${edgeData?.asset || ""}`}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
