"use client";

import React from "react";
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
  if (!selectedNode && !selectedEdge) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

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
              {selectedNode ? "Address Node Inspector" : "Transfer Edge Inspector"}
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
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/50 border border-gray-800 font-mono text-xs text-gray-200">
                <span className="break-all">{selectedNode.address}</span>
                <button
                  onClick={() => handleCopy(selectedNode.address)}
                  className="p-1 text-gray-400 hover:text-brand-400 ml-2"
                  title="Copy address"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Entity Attribution */}
            {selectedNode.entityName && (
              <div className="p-3.5 rounded-xl bg-gray-900 border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-200">
                    {selectedNode.entityName}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-950 text-brand-300 border border-brand-800">
                    {selectedNode.entityType}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Attributed via verified intelligence dataset.
                </p>
              </div>
            )}

            {/* Meta Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800">
                <span className="text-[10px] font-bold uppercase text-gray-500 block mb-1">
                  Network
                </span>
                <span className="text-xs font-bold text-gray-200 uppercase">
                  {selectedNode.chain}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800">
                <span className="text-[10px] font-bold uppercase text-gray-500 block mb-1">
                  Hop Depth
                </span>
                <span className="text-xs font-bold text-gray-200">
                  {selectedNode.hopLevel ?? "Target (Hop 0)"}
                </span>
              </div>
            </div>

            {/* Attribution Status */}
            {investigation?.attributions && (
              <div className="pt-3 border-t border-gray-800">
                <label className="text-[10px] font-bold uppercase text-gray-500 mb-2 block">
                  Attribution Analysis
                </label>
                {investigation.attributions
                  .filter((a) => a.address.toLowerCase() === selectedNode.address.toLowerCase())
                  .map((att, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 text-xs text-gray-300 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-brand-400 uppercase">
                          {att.attributionType}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          Confidence: {Math.round(att.confidence * 100)}%
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400">{att.explanation}</p>
                    </div>
                  ))}
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
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/50 border border-gray-800 font-mono text-xs text-gray-200">
                <span className="break-all">{selectedEdge.txHash}</span>
                <button
                  onClick={() => handleCopy(selectedEdge.txHash)}
                  className="p-1 text-gray-400 hover:text-brand-400 ml-2"
                  title="Copy tx hash"
                >
                  <Copy className="w-3.5 h-3.5" />
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
            </div>

            {/* Source & Destination */}
            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-gray-900/60 border border-gray-800">
                <span className="text-[10px] font-bold uppercase text-gray-500 block mb-0.5">
                  From Address
                </span>
                <span className="text-xs font-mono text-gray-300 break-all">
                  {selectedEdge.source}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-900/60 border border-gray-800">
                <span className="text-[10px] font-bold uppercase text-gray-500 block mb-0.5">
                  To Address
                </span>
                <span className="text-xs font-mono text-gray-300 break-all">
                  {selectedEdge.target}
                </span>
              </div>
            </div>

            {/* Timestamp */}
            <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-gray-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Timestamp</span>
              </div>
              <span className="font-mono text-gray-200">
                {new Date(selectedEdge.timestamp).toUTCString()}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-gray-800 text-center">
        <span className="text-[10px] text-gray-500 font-mono">
          AntiGravity Forensic Graph Node Inspector
        </span>
      </div>
    </div>
  );
};
