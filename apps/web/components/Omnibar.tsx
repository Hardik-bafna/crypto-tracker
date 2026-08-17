"use client";

import React, { useState } from "react";
import { Search, Sparkles, Filter, ChevronDown, Shield } from "lucide-react";
import { SyntheticDemoCase } from "@crypto-tracer/blockchain";

interface Props {
  demoCases: SyntheticDemoCase[];
  onSearch: (params: { target: string; chain: string; maxHops: number; direction: "forward" | "backward" | "both" }) => void;
  isLoading?: boolean;
}

export const Omnibar: React.FC<Props> = ({ demoCases, onSearch, isLoading }) => {
  const [target, setTarget] = useState("");
  const [chain, setChain] = useState("ethereum");
  const [maxHops, setMaxHops] = useState(6);
  const [direction, setDirection] = useState<"forward" | "backward" | "both">("forward");
  const [showPresets, setShowPresets] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!target.trim()) return;
    onSearch({ target: target.trim(), chain, maxHops, direction });
  };

  const handleSelectCase = (demo: SyntheticDemoCase) => {
    setTarget(demo.suspectAddress);
    setChain(demo.chain);
    setMaxHops(demo.recommendedHops);
    setShowPresets(false);
    onSearch({
      target: demo.suspectAddress,
      chain: demo.chain,
      maxHops: demo.recommendedHops,
      direction: "forward",
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="bg-surface/95 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-2xl p-4">
        {/* Top bar with Omnibar Search */}
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Enter suspect wallet address, tx hash (e.g. 0x98174f... or bc1q9d8...)"
              className="w-full bg-black/50 border border-gray-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-gray-100 placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Chain Selector */}
            <select
              value={chain}
              onChange={(e) => setChain(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-xs font-medium text-gray-200 focus:outline-none focus:border-brand-500"
            >
              <option value="ethereum">Ethereum (ETH / USDT)</option>
              <option value="bitcoin">Bitcoin (BTC)</option>
              <option value="monero">Monero (XMR)</option>
              <option value="synthetic">Synthetic Mode</option>
            </select>

            {/* Hop Limit */}
            <select
              value={maxHops}
              onChange={(e) => setMaxHops(Number(e.target.value))}
              className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-xs font-medium text-gray-200 focus:outline-none focus:border-brand-500"
            >
              <option value={3}>3 Hops</option>
              <option value={5}>5 Hops</option>
              <option value={6}>6 Hops</option>
              <option value={8}>8 Hops</option>
              <option value={10}>10 Hops</option>
            </select>

            <button
              type="submit"
              disabled={isLoading || !target.trim()}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition shrink-0"
            >
              {isLoading ? "Tracing..." : "Trace Funds"}
            </button>
          </div>
        </form>

        {/* Preset demo investigation cases */}
        <div className="mt-3 pt-3 border-t border-gray-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span className="font-semibold text-gray-300">Preset Investigation Scenarios:</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            {demoCases.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleSelectCase(c)}
                className="px-2.5 py-1 rounded-lg bg-gray-800/80 hover:bg-brand-950/60 hover:border-brand-600 border border-gray-700 text-[11px] text-gray-300 transition flex items-center gap-1.5 shrink-0"
              >
                <Shield className="w-3 h-3 text-brand-400" />
                <span>{c.name.split(" (")[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
