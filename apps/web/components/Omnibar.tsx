"use client";

import React, { useState } from "react";
import { Search, Sparkles, AlertCircle, Shield } from "lucide-react";
import { SyntheticDemoCase } from "@crypto-tracer/blockchain";

interface Props {
  demoCases: SyntheticDemoCase[];
  onSearch: (params: { target: string; chain: string; maxHops: number; direction: "forward" | "backward" | "both"; mode: "live" | "demo" }) => void;
  isLoading?: boolean;
  error?: string | null;
}

export const Omnibar: React.FC<Props> = ({ demoCases, onSearch, isLoading, error }) => {
  const [activeTab, setActiveTab] = useState<"live" | "demo">("live");
  const [target, setTarget] = useState("");
  const [chain, setChain] = useState("ethereum");
  const [maxHops, setMaxHops] = useState(6);
  const [direction, setDirection] = useState<"forward" | "backward" | "both">("forward");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!target.trim() && activeTab === "live") return;
    onSearch({ target: target.trim(), chain, maxHops, direction, mode: "live" });
  };

  const handleSelectCase = (demo: SyntheticDemoCase) => {
    setTarget(demo.suspectAddress);
    setChain(demo.chain);
    setMaxHops(demo.recommendedHops);
    onSearch({
      target: demo.suspectAddress,
      chain: demo.chain,
      maxHops: demo.recommendedHops,
      direction: "forward",
      mode: "demo",
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="bg-surface/95 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Tabs */}
        <div className="flex border-b border-gray-800/80 bg-black/40">
          <button
            onClick={() => setActiveTab("live")}
            className={`flex-1 py-3 text-sm font-semibold transition ${activeTab === "live" ? "text-brand-400 border-b-2 border-brand-500 bg-gray-900/40" : "text-gray-500 hover:text-gray-300"}`}
          >
            <div className="flex items-center justify-center gap-2">
              <Search className="w-4 h-4" />
              Live Investigation
            </div>
          </button>
          <button
            onClick={() => setActiveTab("demo")}
            className={`flex-1 py-3 text-sm font-semibold transition ${activeTab === "demo" ? "text-brand-400 border-b-2 border-brand-500 bg-gray-900/40" : "text-gray-500 hover:text-gray-300"}`}
          >
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              Demo Scenarios
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {error && (
            <div className="mb-4 p-3 bg-red-950/40 border border-red-900/50 rounded-xl flex items-start gap-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-red-300 mb-0.5">Investigation Error</strong>
                {error}
              </div>
            </div>
          )}

          {activeTab === "live" ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <p className="text-xs text-gray-400 mb-1">Enter a real cryptocurrency address or transaction hash to trace live on-chain data.</p>
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="e.g. 0xd8dA6BF26964aF9D... or bc1q9d8..."
                    className="w-full bg-black/50 border border-gray-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono text-gray-100 placeholder-gray-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <select
                    value={chain}
                    onChange={(e) => setChain(e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-200 focus:outline-none focus:border-brand-500"
                  >
                    <option value="ethereum">Ethereum (ETH / ERC-20)</option>
                    <option value="bitcoin">Bitcoin (BTC)</option>
                    <option value="monero">Monero (XMR)</option>
                  </select>

                  <select
                    value={maxHops}
                    onChange={(e) => setMaxHops(Number(e.target.value))}
                    className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-200 focus:outline-none focus:border-brand-500"
                  >
                    <option value={3}>3 Hops</option>
                    <option value={5}>5 Hops</option>
                    <option value={8}>8 Hops</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={isLoading || !target.trim()}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-sm font-bold shadow-lg shadow-brand-600/30 transition"
                >
                  {isLoading ? "Tracing..." : "Start Live Trace"}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-gray-400 mb-1">Select a pre-loaded synthetic case study to explore forensic features without live queries.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {demoCases.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelectCase(c)}
                    className="flex flex-col items-start p-3 rounded-xl bg-gray-800/50 hover:bg-brand-950/40 hover:border-brand-500/50 border border-gray-700/80 transition text-left group"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Shield className="w-4 h-4 text-brand-400" />
                      <span className="font-semibold text-gray-200 text-xs truncate max-w-[150px]">{c.name.split(" (")[0]}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed group-hover:text-gray-400 transition">
                      {c.category}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
