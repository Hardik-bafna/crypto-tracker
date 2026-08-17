"use client";

import React, { useState } from "react";
import { Evidence } from "@crypto-tracer/types";
import { ShieldAlert, AlertTriangle, AlertOctagon, Info, Search, Copy } from "lucide-react";

interface Props {
  evidenceList: Evidence[];
}

export const EvidencePanel: React.FC<Props> = ({ evidenceList }) => {
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const filtered = evidenceList.filter((ev) => {
    if (filterSeverity !== "ALL" && ev.severity !== filterSeverity) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        ev.title.toLowerCase().includes(q) ||
        ev.description.toLowerCase().includes(q) ||
        ev.type.toLowerCase().includes(q) ||
        ev.id.toLowerCase().includes(q) ||
        ev.addresses.some((a) => a.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-surface/90 border border-gray-800 rounded-2xl p-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-brand-400" />
          <h2 className="text-sm font-bold tracking-wide uppercase text-gray-200">
            Forensic Evidence Ledger ({evidenceList.length})
          </h2>
        </div>

        {/* Severity Filter Pills */}
        <div className="flex items-center gap-1.5 bg-gray-900/80 p-1 rounded-xl border border-gray-800">
          {["ALL", "CRITICAL", "HIGH", "MEDIUM"].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                filterSeverity === sev
                  ? "bg-brand-600 text-white shadow"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter evidence by keyword, Evidence ID, address or type..."
          className="w-full bg-black/40 border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand-500"
        />
      </div>

      {/* Evidence Table / Cards */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-xs text-gray-500">
            No evidentiary records matched the current filter.
          </div>
        ) : (
          filtered.map((ev) => {
            let badge = "bg-gray-800 text-gray-300 border-gray-700";
            if (ev.severity === "CRITICAL") badge = "bg-red-950 text-red-300 border-red-800";
            else if (ev.severity === "HIGH") badge = "bg-orange-950 text-orange-300 border-orange-800";
            else if (ev.severity === "MEDIUM") badge = "bg-amber-950 text-amber-300 border-amber-800";

            return (
              <div
                key={ev.id}
                className="p-4 rounded-xl bg-gray-900/70 border border-gray-800/90 hover:border-gray-700 transition space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge}`}>
                      {ev.severity}
                    </span>
                    <span className="font-mono text-xs text-gray-400 font-medium">
                      {ev.id}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">
                    Confidence: {Math.round(ev.confidence * 100)}%
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-gray-200 mb-1">{ev.title}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">{ev.description}</p>
                </div>

                {/* Supporting Links */}
                {(ev.transactionHashes.length > 0 || ev.addresses.length > 0) && (
                  <div className="pt-2 border-t border-gray-800/80 flex flex-wrap items-center gap-2 text-[11px] font-mono text-gray-400">
                    {ev.transactionHashes.map((h, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-black/40 border border-gray-800 text-gray-300"
                      >
                        <span>Tx: {h.slice(0, 10)}...</span>
                        <button
                          onClick={() => handleCopy(h)}
                          className="hover:text-brand-400"
                          title="Copy hash"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
