"use client";

import React from "react";
import { WalletCluster } from "@crypto-tracer/types";
import { Layers, Users, ShieldCheck, Tag, Copy } from "lucide-react";

interface Props {
  clusters: WalletCluster[];
}

export const ClustersPanel: React.FC<Props> = ({ clusters }) => {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-surface/90 border border-gray-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-brand-400" />
          <h2 className="text-sm font-bold tracking-wide uppercase text-gray-200">
            Co-Owned Wallet Clusters ({clusters.length})
          </h2>
        </div>
        <span className="text-[10px] text-gray-400 font-mono">
          Heuristic Attribution
        </span>
      </div>

      <div className="space-y-4">
        {clusters.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-500">
            No co-ownership clusters identified within target set.
          </div>
        ) : (
          clusters.map((cluster) => (
            <div
              key={cluster.clusterId}
              className="p-4 rounded-xl bg-gray-900/70 border border-gray-800 hover:border-gray-700 transition space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-400" />
                  <h3 className="text-xs font-bold text-gray-200">
                    {cluster.name || cluster.clusterId}
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-brand-950 text-brand-300 border border-brand-800">
                  Confidence: {Math.round(cluster.confidence * 100)}%
                </span>
              </div>

              {/* Signals */}
              <div className="space-y-1">
                {cluster.signals.map((sig, i) => (
                  <p key={i} className="text-xs text-gray-400 flex items-start gap-2">
                    <span className="text-brand-500 font-bold">•</span>
                    <span>{sig}</span>
                  </p>
                ))}
              </div>

              {/* Member Wallets */}
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1.5">
                  Cluster Member Wallets ({cluster.members.length})
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {cluster.members.map((addr, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-gray-800/80 font-mono text-xs text-gray-300"
                    >
                      <span className="break-all">{addr}</span>
                      <button
                        onClick={() => handleCopy(addr)}
                        className="p-1 text-gray-500 hover:text-brand-400 ml-2 shrink-0"
                        title="Copy address"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
