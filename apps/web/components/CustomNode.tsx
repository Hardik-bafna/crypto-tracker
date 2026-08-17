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
  [key: string]: unknown;
}

export const CustomNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as unknown as CustomNodeData;
  const isTarget = nodeData.isTarget;
  const entityType = nodeData.entityType;
  const entityName = nodeData.entityName;

  // Determine badge styling and icon based on entity type
  let badgeColor = "bg-gray-800 text-gray-300 border-gray-700";
  let EntityIcon = Wallet;

  if (entityType === "MIXER") {
    badgeColor = "bg-rose-950/80 text-rose-300 border-rose-600";
    EntityIcon = Shuffle;
  } else if (entityType === "BRIDGE") {
    badgeColor = "bg-cyan-950/80 text-cyan-300 border-cyan-500";
    EntityIcon = ArrowDownRight;
  } else if (entityType === "EXCHANGE") {
    badgeColor = "bg-emerald-950/80 text-emerald-300 border-emerald-500";
    EntityIcon = Landmark;
  } else if (entityType === "KNOWN_ILLICIT" || entityType === "SCAM") {
    badgeColor = "bg-red-950 text-red-300 border-red-600 animate-pulse";
    EntityIcon = AlertTriangle;
  } else if (isTarget) {
    badgeColor = "bg-amber-950/80 text-amber-300 border-amber-500";
    EntityIcon = ShieldAlert;
  }

  // Border halo
  const borderClass = selected
    ? "border-brand-500 shadow-[0_0_20px_rgba(99,102,241,0.5)] ring-2 ring-brand-500"
    : isTarget
    ? "border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
    : entityType === "MIXER" || entityType === "KNOWN_ILLICIT"
    ? "border-rose-600"
    : entityType === "EXCHANGE"
    ? "border-emerald-600"
    : entityType === "BRIDGE"
    ? "border-cyan-600"
    : "border-gray-800 hover:border-gray-600";

  return (
    <div
      className={`relative min-w-[200px] max-w-[260px] rounded-xl bg-gray-900/95 backdrop-blur-md p-3.5 shadow-2xl border transition-all duration-200 cursor-pointer ${borderClass}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-gray-400 !border-2 !border-gray-900 hover:!bg-brand-400"
      />

      {/* Header with Type & Chain */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <EntityIcon className="w-3.5 h-3.5 shrink-0" />
          <span className="text-[11px] font-semibold truncate tracking-wide uppercase">
            {entityName || (isTarget ? "TARGET WALLET" : nodeData.chain)}
          </span>
        </div>
        {nodeData.hopLevel !== undefined && (
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 font-mono">
            Hop {nodeData.hopLevel}
          </span>
        )}
      </div>

      {/* Address */}
      <div className="font-mono text-xs text-gray-200 font-medium mb-2 break-all bg-black/40 px-2 py-1 rounded border border-gray-800/80">
        {nodeData.label || `${nodeData.address.slice(0, 6)}...${nodeData.address.slice(-4)}`}
      </div>

      {/* Badges / Entity Pill */}
      {entityType && (
        <div className="mb-2">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${badgeColor}`}
          >
            {entityType}
          </span>
        </div>
      )}

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1.5 border-t border-gray-800/60">
        <div className="flex items-center gap-1">
          <Coins className="w-3 h-3 text-gray-500" />
          <span>{nodeData.balance || "Active"}</span>
        </div>
        <span className="text-gray-500 uppercase">{nodeData.chain}</span>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-gray-400 !border-2 !border-gray-900 hover:!bg-brand-400"
      />
    </div>
  );
};
