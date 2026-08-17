"use client";

import React from "react";
import { Investigation } from "@crypto-tracer/types";
import {
  ShieldAlert,
  Download,
  Bot,
  Activity,
  Network,
  Scale,
  RefreshCw,
} from "lucide-react";

interface Props {
  investigation: Investigation | null;
  onOpenAI: () => void;
  onOpenReport: () => void;
  onReset: () => void;
  isLoading?: boolean;
}

export const InvestigationHeader: React.FC<Props> = ({
  investigation,
  onOpenAI,
  onOpenReport,
  onReset,
  isLoading,
}) => {
  const riskScore = investigation?.risk?.overallScore ?? 0;
  const riskLevel = investigation?.risk?.riskLevel ?? "LOW";

  let riskBadgeColor = "bg-emerald-950/80 text-emerald-300 border-emerald-600";
  if (riskLevel === "CRITICAL") riskBadgeColor = "bg-red-950 text-red-300 border-red-600";
  else if (riskLevel === "HIGH") riskBadgeColor = "bg-orange-950 text-orange-300 border-orange-600";
  else if (riskLevel === "MEDIUM") riskBadgeColor = "bg-amber-950 text-amber-300 border-amber-600";

  return (
    <header className="h-16 border-b border-gray-800 bg-surface/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Brand & Target Information */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-brand-600/20 border border-brand-500/30 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-wide text-white uppercase">
                CryptoTrace Forensic Platform
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-800 text-gray-400 border border-gray-700">
                v1.0 (LEO)
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              {investigation?.caseNumber ? `Case: ${investigation.caseNumber}` : "Authorized Narcotics Intelligence Tracing"}
            </p>
          </div>
        </div>

        {investigation && (
          <div className="hidden lg:flex items-center gap-3 pl-4 border-l border-gray-800">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/40 border border-gray-800 text-xs font-mono">
              <span className="text-gray-500">TARGET:</span>
              <span className="text-gray-200 font-medium">
                {investigation.target.slice(0, 10)}...{investigation.target.slice(-6)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-800/80 border border-gray-700 text-[11px] font-semibold uppercase text-gray-300">
              <Network className="w-3 h-3 text-brand-400" />
              {investigation.chain}
            </div>

            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold border ${riskBadgeColor}`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{riskLevel} RISK ({riskScore}/100)</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onReset}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-300 text-xs font-medium border border-gray-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>New Target</span>
        </button>

        <button
          onClick={onOpenReport}
          disabled={!investigation}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-200 text-xs font-medium border border-gray-700 transition disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5 text-gray-400" />
          <span>Export Dossier</span>
        </button>

        <button
          onClick={onOpenAI}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition"
        >
          <Bot className="w-3.5 h-3.5" />
          <span>AI Investigator</span>
        </button>
      </div>
    </header>
  );
};
