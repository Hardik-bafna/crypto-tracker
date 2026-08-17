"use client";

import React from "react";
import { RiskAssessment } from "@crypto-tracer/types";
import { ShieldAlert, CheckCircle2, AlertTriangle, AlertOctagon, Info } from "lucide-react";

interface Props {
  risk: RiskAssessment;
}

export const RiskMeter: React.FC<Props> = ({ risk }) => {
  const score = risk.overallScore;
  const level = risk.riskLevel;

  let gaugeColor = "text-emerald-400 stroke-emerald-500";
  let bgHalo = "from-emerald-500/20";
  let LevelIcon = CheckCircle2;

  if (level === "CRITICAL") {
    gaugeColor = "text-rose-400 stroke-rose-500";
    bgHalo = "from-rose-500/20";
    LevelIcon = AlertOctagon;
  } else if (level === "HIGH") {
    gaugeColor = "text-orange-400 stroke-orange-500";
    bgHalo = "from-orange-500/20";
    LevelIcon = ShieldAlert;
  } else if (level === "MEDIUM") {
    gaugeColor = "text-amber-400 stroke-amber-500";
    bgHalo = "from-amber-500/20";
    LevelIcon = AlertTriangle;
  }

  // Calculate circle stroke offset for 0-100 gauge (circumference = 2 * PI * 40 = 251.3)
  const strokeDashoffset = 251.3 - (251.3 * score) / 100;

  return (
    <div className="bg-surface/90 border border-gray-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <LevelIcon className={`w-5 h-5 ${gaugeColor.split(" ")[0]}`} />
          <h2 className="text-sm font-bold tracking-wide uppercase text-gray-200">
            Forensic Risk Engine
          </h2>
        </div>
        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
          Deterministic 0-100
        </span>
      </div>

      {/* Radial Meter & Summary */}
      <div className="flex items-center gap-6 p-4 rounded-xl bg-gradient-to-r via-transparent to-transparent border border-gray-800/80 mb-5">
        <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              className="stroke-gray-800"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              className={`${gaugeColor.split(" ")[1]} transition-all duration-1000 ease-out`}
              strokeWidth="8"
              strokeDasharray="251.3"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-white">{score}</span>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
              {level}
            </span>
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-xs font-bold text-gray-200 uppercase mb-1">
            {level} Risk Assessment
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            {risk.summary}
          </p>
        </div>
      </div>

      {/* Factor Breakdown */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wide mb-2 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5" />
          <span>Contributing Risk Factors ({risk.factors.length})</span>
        </h4>

        {risk.factors.map((factor) => (
          <div
            key={factor.id}
            className="p-3 rounded-xl bg-gray-900/60 border border-gray-800/90 flex items-start justify-between gap-3"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-gray-200">{factor.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-800 text-gray-400 font-mono">
                  {factor.category}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 leading-normal">
                {factor.description}
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-rose-400 shrink-0 px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800/60">
              +{factor.scoreDelta}
            </span>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      {risk.recommendations.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <h4 className="text-xs font-bold uppercase text-amber-400 tracking-wide mb-2">
            Investigative Next Steps
          </h4>
          <ul className="space-y-1.5">
            {risk.recommendations.map((rec, i) => (
              <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
