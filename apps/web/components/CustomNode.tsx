"use client";

import React from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import {
  ShieldAlert,
  ArrowDownRight,
  Shuffle,
  Landmark,
  Building2,
  AlertTriangle,
  Wallet,
  Coins,
} from "lucide-react";

export interface CustomNodeData {
  address: string;
  label: string;
  chain: string;
  type: string;
  entityName?: string;
  entityType?: string;
  riskScore?: number;
  balance?: string;
  isTarget?: boolean;
  isSuspect?: boolean;
  hopLevel?: number;
  tags?: string[];
  isDimmed?: boolean;
  isPathHighlighted?: boolean;
  isNeighborHighlighted?: boolean;
  [key: string]: unknown;
}

// Chain-specific color accents for the left border indicator
const CHAIN_COLORS: Record<string, { border: string; dot: string; label: string }> = {
  ethereum: { border: "border-l-blue-500", dot: "bg-blue-500", label: "text-blue-400" },
  bitcoin: { border: "border-l-orange-500", dot: "bg-orange-500", label: "text-orange-400" },
  polygon: { border: "border-l-purple-500", dot: "bg-purple-500", label: "text-purple-400" },
  arbitrum: { border: "border-l-sky-500", dot: "bg-sky-500", label: "text-sky-400" },
  optimism: { border: "border-l-red-500", dot: "bg-red-500", label: "text-red-400" },
  bsc: { border: "border-l-yellow-500", dot: "bg-yellow-500", label: "text-yellow-400" },
  avalanche: { border: "border-l-rose-500", dot: "bg-rose-500", label: "text-rose-400" },
  solana: { border: "border-l-gradient-to-r from-purple-500 to-teal-500", dot: "bg-teal-500", label: "text-teal-400" },
};

const getChainStyle = (chain: string) => {
  const normalized = chain?.toLowerCase() || "";
  return CHAIN_COLORS[normalized] || { border: "border-l-gray-600", dot: "bg-gray-600", label: "text-gray-500" };
};

export const CustomNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as unknown as CustomNodeData;
  const isTarget = nodeData.isTarget;
  const entityType = nodeData.entityType;
  const entityName = nodeData.entityName;
  const isDimmed = nodeData.isDimmed;
  const isPath = nodeData.isPathHighlighted;
  const isNeighbor = nodeData.isNeighborHighlighted;
  const chainStyle = getChainStyle(nodeData.chain);

  // Human readable label for entity types
  let entityLabel = "Unknown Wallet";
  let badgeColor = "bg-gray-800/90 text-gray-300 border-gray-700";
  let EntityIcon = Wallet;

  if (entityType === "EXCHANGE") {
    entityLabel = "Known Exchange";
    badgeColor = "bg-emerald-950/90 text-emerald-300 border-emerald-600";
    EntityIcon = Landmark;
  } else if (entityType === "MIXER") {
    entityLabel = "Known Mixer";
    badgeColor = "bg-rose-950/90 text-rose-300 border-rose-600";
    EntityIcon = Shuffle;
  } else if (entityType === "BRIDGE") {
    entityLabel = "Known Bridge";
    badgeColor = "bg-cyan-950/90 text-cyan-300 border-cyan-500";
    EntityIcon = ArrowDownRight;
  } else if (entityType === "SERVICE") {
    entityLabel = "DEX / Protocol";
    badgeColor = "bg-purple-950/90 text-purple-300 border-purple-500";
    EntityIcon = Coins;
  } else if (entityType === "KNOWN_ILLICIT" || entityType === "SCAM") {
    entityLabel = "Flagged Target";
    badgeColor = "bg-red-950 text-red-300 border-red-600 animate-pulse";
    EntityIcon = AlertTriangle;
  } else if (isTarget) {
    entityLabel = "Target Seed";
    badgeColor = "bg-amber-950/90 text-amber-300 border-amber-500";
    EntityIcon = ShieldAlert;
  }

  // Border halo and highlight effects
  let borderClass = "border-gray-800 hover:border-gray-600";

  if (isPath) {
    borderClass = "border-cyan-400 shadow-[0_0_22px_rgba(34,211,238,0.7)] ring-2 ring-cyan-400";
  } else if (selected) {
    borderClass = "border-brand-500 shadow-[0_0_20px_rgba(99,102,241,0.5)] ring-2 ring-brand-500";
  } else if (isNeighbor) {
    borderClass = "border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)] ring-1 ring-amber-400";
  } else if (isTarget) {
    borderClass = "border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]";
  } else if (entityType === "MIXER" || entityType === "KNOWN_ILLICIT") {
    borderClass = "border-rose-600";
  } else if (entityType === "EXCHANGE") {
    borderClass = "border-emerald-600";
  } else if (entityType === "BRIDGE") {
    borderClass = "border-cyan-600";
  } else if (entityType === "SERVICE") {
    borderClass = "border-purple-600";
  }

  const opacityClass = isDimmed
    ? "opacity-20 grayscale transition-opacity duration-300"
    : "opacity-100 transition-opacity duration-300";

  const displayName = entityName || (isTarget ? "Target Wallet" : "Unknown Wallet");
  const formattedAddress = `${nodeData.address.slice(0, 6)}...${nodeData.address.slice(-4)}`;

  return (
    <div
      className={`relative min-w-[200px] max-w-[260px] rounded-xl bg-gray-900/95 backdrop-blur-md p-3.5 shadow-2xl border border-l-[3px] ${chainStyle.border} transition-all duration-200 cursor-pointer ${borderClass} ${opacityClass}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-gray-400 !border-2 !border-gray-900 hover:!bg-brand-400"
      />

      {/* Header with Entity Name & Hop */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <EntityIcon className="w-3.5 h-3.5 shrink-0 text-gray-300" />
          <span className="text-xs font-bold truncate text-white tracking-wide">
            {displayName}
          </span>
        </div>
        {nodeData.hopLevel !== undefined && (
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 font-mono">
            Hop {nodeData.hopLevel}
          </span>
        )}
      </div>

      {/* Entity Category Badge */}
      <div className="mb-2">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${badgeColor}`}
        >
          {entityLabel}
        </span>
      </div>

      {/* Address */}
      <div className="font-mono text-[11px] text-gray-300 font-medium mb-2 break-all bg-black/50 px-2 py-1 rounded border border-gray-800/80 flex items-center justify-between">
        <span title={nodeData.address}>{formattedAddress}</span>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1.5 border-t border-gray-800/60">
        <div className="flex items-center gap-1">
          <Coins className="w-3 h-3 text-gray-500" />
          <span>{nodeData.balance || "Active"}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${chainStyle.dot}`} />
          <span className={`uppercase ${chainStyle.label}`}>{nodeData.chain}</span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-gray-400 !border-2 !border-gray-900 hover:!bg-brand-400"
      />
    </div>
  );
};
