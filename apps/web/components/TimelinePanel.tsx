"use client";

import React from "react";
import { GraphEdge } from "@crypto-tracer/types";
import { Clock, ArrowRight, ShieldCheck, Shuffle, ArrowDownRight, Landmark } from "lucide-react";

interface Props {
  edges: GraphEdge[];
}

export const TimelinePanel: React.FC<Props> = ({ edges }) => {
  const sorted = [...edges].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div className="bg-surface/90 border border-gray-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-brand-400" />
          <h2 className="text-sm font-bold tracking-wide uppercase text-gray-200">
            Transaction Flow Timeline ({edges.length} Hops)
          </h2>
        </div>
        <span className="text-[10px] text-gray-400 font-mono">
          Chronological Stream
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-800">
        {sorted.map((edge, index) => {
          const isCross = edge.isCrossChain;
          return (
            <div key={edge.id || index} className="relative group">
              {/* Dot */}
              <div
                className={`absolute -left-6 top-1 w-3 h-3 rounded-full border-2 border-background transition-transform group-hover:scale-125 ${
                  isCross
                    ? "bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                    : index === 0
                    ? "bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                    : "bg-brand-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]"
                }`}
              />

              <div className="p-3.5 rounded-xl bg-gray-900/80 border border-gray-800/90 hover:border-gray-700 transition">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-mono font-bold text-gray-400">
                    {new Date(edge.timestamp).toUTCString()}
                  </span>
                  <span className="text-xs font-mono font-bold text-white bg-black/50 px-2 py-0.5 rounded border border-gray-800">
                    {edge.formattedAmount || `${edge.amount} ${edge.asset}`}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-gray-300">
                  <span className="truncate max-w-[140px]" title={edge.source}>
                    {edge.source.slice(0, 8)}...{edge.source.slice(-4)}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  <span className="truncate max-w-[140px]" title={edge.target}>
                    {edge.target.slice(0, 8)}...{edge.target.slice(-4)}
                  </span>
                </div>

                {edge.bridgeName && (
                  <div className="mt-2 text-[10px] font-bold text-cyan-400 flex items-center gap-1">
                    <ArrowDownRight className="w-3 h-3" />
                    <span>Bridge Route: {edge.bridgeName}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
