"use client";

import React, { useState } from "react";
import { GraphNode, GraphEdge, Investigation } from "@crypto-tracer/types";
import {
  Wallet,
  ArrowRight,
  ExternalLink,
  Shield,
  Layers,
  Copy,
  Clock,
  Coins,
  FileText,
  X,
  Check,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldAlert,
  AlertTriangle,
  Shuffle,
  Landmark,
  Activity,
  Link2,
} from "lucide-react";

interface Props {
  selectedNode: GraphNode | null;
  selectedEdge: GraphEdge | null;
  investigation: Investigation | null;
  onClose: () => void;
}

export const InspectorDrawer: React.FC<Props> = ({
  selectedNode,
  selectedEdge,
  investigation,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!selectedNode && !selectedEdge) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shortAddr = (addr: string) => {
    if (!addr || addr.length <= 16) return addr || "";
    return `${addr.slice(0, 8)}…${addr.slice(-6)}`;
  };

  // Compute node metrics from investigation edges if available
  const edges = investigation?.graph?.edges || [];
  const nodeAddr = selectedNode?.address.toLowerCase();

  const incomingEdges = edges.filter((e) => e.target.toLowerCase() === nodeAddr);
  const outgoingEdges = edges.filter((e) => e.source.toLowerCase() === nodeAddr);

  const incomingVal = incomingEdges.reduce(
    (sum, e) => sum + (parseFloat(e.formattedAmount || e.amount) || 0),
    0
  );
  const outgoingVal = outgoingEdges.reduce(
    (sum, e) => sum + (parseFloat(e.formattedAmount || e.amount) || 0),
    0
  );

  const allNodeEdges = [...incomingEdges, ...outgoingEdges].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  const firstSeen = allNodeEdges[0]?.timestamp;
  const lastSeen = allNodeEdges[allNodeEdges.length - 1]?.timestamp;

  // Find detection patterns & evidence involving this wallet node
  const nodePatterns =
    investigation?.patterns?.filter(
      (p) =>
        nodeAddr &&
        p.affectedAddresses.some((a) => a.toLowerCase() === nodeAddr)
    ) || [];

  const nodeEvidence =
    investigation?.evidence?.filter(
      (ev) =>
        nodeAddr &&
        ev.addresses.some((a) => a.toLowerCase() === nodeAddr)
    ) || [];

  return (
    <div className="w-96 bg-surface/95 backdrop-blur-xl border-l border-gray-800 h-full p-5 overflow-y-auto flex flex-col justify-between shadow-2xl z-20">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800 mb-4">
          <div className="flex items-center gap-2">
            {selectedNode ? (
              <Wallet className="w-4 h-4 text-brand-400" />
            ) : (
              <ArrowRight className="w-4 h-4 text-cyan-400" />
            )}
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200">
              {selectedNode ? "Wallet Inspector" : "Transaction Edge Inspector"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* NODE INSPECTION */}
        {selectedNode && (
          <div className="space-y-4">
            {/* Address Pill */}
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">
                Blockchain Address
              </label>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/60 border border-gray-800 font-mono text-xs text-gray-200">
                <span className="break-all">{selectedNode.address}</span>
                <button
                  onClick={() => handleCopy(selectedNode.address)}
                  className="p-1 text-gray-400 hover:text-brand-400 ml-2 shrink-0"
                  title="Copy address"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Entity Attribution Badge or Unknown Wallet Card */}
            {selectedNode.entityName ? (
              <div className="p-3.5 rounded-xl bg-gray-900 border border-gray-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-100">
                    {selectedNode.entityName}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-950 text-brand-300 border border-brand-800">
                    {selectedNode.entityType}
                  </span>
                </div>

                <div>
                  <span className="text-[9px] font-bold uppercase text-gray-500 block mb-0.5">
                    Why Recognized / Attribution Rationale
                  </span>
                  <p className="text-[11px] text-gray-300 leading-relaxed">
                    {selectedNode.entityType === "EXCHANGE"
                      ? "Identified as a regulated Centralized Exchange (CEX) deposit or hot wallet. Subpoena response unit available."
                      : selectedNode.entityType === "MIXER"
                      ? "Identified as a privacy mixer smart contract or CoinJoin pool designed to break transaction linkability."
                      : selectedNode.entityType === "BRIDGE"
                      ? "Identified as a cross-chain liquidity bridge router protocol."
                      : selectedNode.entityType === "SERVICE"
                      ? "Identified as a decentralized protocol / DEX smart contract."
                      : selectedNode.entityType === "KNOWN_ILLICIT"
                      ? "Flagged by law enforcement task force bulletins or sanctions list."
                      : "Matched against verified public blockchain entity registry."}
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between text-[10px] text-gray-400">
                  <span>Source: Verified Label Cloud</span>
                  <span className="text-emerald-400 font-bold">Status: VERIFIED</span>
                </div>

                <p className="text-[9px] text-gray-500 italic pt-1">
                  Note: Entity identification is an attribution descriptor and does not inherently imply criminal liability.
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400">
                    Unknown Wallet
                  </span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                    UNATTRIBUTED
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  No matching entity attribution found in local entity registry or public label cloud. Treated as an unhosted private wallet.
                </p>
              </div>
            )}

            {/* Network & Role Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800">
                <span className="text-[10px] font-bold uppercase text-gray-500 block mb-0.5">
                  Blockchain
                </span>
                <span className="text-xs font-bold text-gray-200 uppercase">
                  {selectedNode.chain}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800">
                <span className="text-[10px] font-bold uppercase text-gray-500 block mb-0.5">
                  Role / Hop Depth
                </span>
                <span className="text-xs font-bold text-gray-200">
                  {selectedNode.isTarget
                    ? "Target Seed (Hop 0)"
                    : selectedNode.hopLevel !== undefined
                    ? `Hop ${selectedNode.hopLevel}`
                    : "Intermediary Wallet"}
                </span>
              </div>
            </div>

            {/* Transaction Metrics (Inbound vs Outbound) */}
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-500 mb-1.5 block">
                Observed Flow Metrics
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {/* Incoming */}
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase mb-1">
                    <ArrowDownLeft className="w-3 h-3" />
                    <span>Incoming ({incomingEdges.length})</span>
                  </div>
                  <div className="text-sm font-bold font-mono text-emerald-300">
                    {incomingVal > 0
                      ? `${incomingVal.toFixed(2)} ${investigation?.chain === "bitcoin" ? "BTC" : "ETH"}`
                      : "0.00"}
                  </div>
                </div>

                {/* Outgoing */}
                <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/40">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-rose-400 uppercase mb-1">
                    <ArrowUpRight className="w-3 h-3" />
                    <span>Outgoing ({outgoingEdges.length})</span>
                  </div>
                  <div className="text-sm font-bold font-mono text-rose-300">
                    {outgoingVal > 0
                      ? `${outgoingVal.toFixed(2)} ${investigation?.chain === "bitcoin" ? "BTC" : "ETH"}`
                      : "0.00"}
                  </div>
                </div>
              </div>
            </div>

            {/* Observed Activity Range */}
            {(firstSeen || lastSeen) && (
              <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 text-xs">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase mb-1.5">
                  <Clock className="w-3 h-3" />
                  <span>Activity Period</span>
                </div>
                <div className="space-y-1 font-mono text-[11px] text-gray-300">
                  {firstSeen && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">First Seen:</span>
                      <span>{new Date(firstSeen).toLocaleString()}</span>
                    </div>
                  )}
                  {lastSeen && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Last Seen:</span>
                      <span>{new Date(lastSeen).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Detection Flags for this Wallet */}
            {nodePatterns.length > 0 && (
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-500 mb-1.5 block">
                  Detection Flags ({nodePatterns.length})
                </label>
                <div className="space-y-2">
                  {nodePatterns.map((pat, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-bold text-gray-200">
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          {pat.title}
                        </span>
                        <span className="text-[10px] font-mono text-rose-400">
                          Severity: {pat.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 leading-normal">
                        {pat.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Evidence items */}
            {nodeEvidence.length > 0 && (
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-500 mb-1.5 block">
                  Linked Evidence ({nodeEvidence.length})
                </label>
                <div className="space-y-2">
                  {nodeEvidence.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-2.5 rounded-xl bg-gray-900/80 border border-gray-800 text-xs"
                    >
                      <span className="font-bold text-gray-200 block mb-0.5">
                        {ev.title}
                      </span>
                      <p className="text-[11px] text-gray-400">{ev.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* EDGE INSPECTION */}
        {selectedEdge && (
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">
                Transaction Hash
              </label>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/60 border border-gray-800 font-mono text-xs text-gray-200">
                <span className="break-all">{selectedEdge.txHash}</span>
                <button
                  onClick={() => handleCopy(selectedEdge.txHash)}
                  className="p-1 text-gray-400 hover:text-brand-400 ml-2 shrink-0"
                  title="Copy tx hash"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-900 border border-gray-800">
              <span className="text-[10px] font-bold uppercase text-gray-500 block mb-1">
                Transfer Amount
              </span>
              <div className="text-lg font-bold text-white font-mono">
                {selectedEdge.formattedAmount || `${selectedEdge.amount} ${selectedEdge.asset}`}
              </div>
              {selectedEdge.tokenSymbol && (
                <span className="text-[10px] font-semibold text-brand-400 uppercase mt-1 block">
                  Token: {selectedEdge.tokenSymbol}
                </span>
              )}
            </div>

            {/* Source & Destination */}
            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-gray-900/60 border border-gray-800">
                <span className="text-[10px] font-bold uppercase text-gray-500 block mb-0.5">
                  Sender (From)
                </span>
                <span className="text-xs font-mono text-gray-300 break-all">
                  {selectedEdge.source}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-900/60 border border-gray-800">
                <span className="text-[10px] font-bold uppercase text-gray-500 block mb-0.5">
                  Recipient (To)
                </span>
                <span className="text-xs font-mono text-gray-300 break-all">
                  {selectedEdge.target}
                </span>
              </div>
            </div>

            {/* Bridge or Contract Call details */}
            {selectedEdge.isCrossChain && (
              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/60 text-xs">
                <span className="font-bold text-cyan-400 flex items-center gap-1 mb-1">
                  <Link2 className="w-3.5 h-3.5" />
                  Cross-Chain Bridge Route
                </span>
                <p className="text-[11px] text-gray-300">
                  Routed via {selectedEdge.bridgeName || "Cross-Chain Bridge Protocol"}.
                </p>
              </div>
            )}

            {/* Timestamp */}
            <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-gray-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Timestamp</span>
              </div>
              <span className="font-mono text-gray-200">
                {new Date(selectedEdge.timestamp).toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-gray-800 text-center">
        <span className="text-[10px] text-gray-500 font-mono">
          CryptoTrace™ Interactive Graph Inspector
        </span>
      </div>
    </div>
  );
};
