"use client";

import React, { useState } from "react";
import { AlternativeExplanation } from "@crypto-tracer/types";
import {
  Scale,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  Shield,
  Info,
} from "lucide-react";

interface Props {
  alternativeExplanations: AlternativeExplanation[];
}

export const AlternativeExplanationsPanel: React.FC<Props> = ({
  alternativeExplanations,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(
    alternativeExplanations[0]?.id ?? null
  );

  if (alternativeExplanations.length === 0) {
    return (
      <div className="bg-surface/90 border border-gray-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Scale className="w-5 h-5 text-brand-400" />
          <h2 className="text-sm font-bold tracking-wide uppercase text-gray-200">
            Alternative Explanation Analysis
          </h2>
        </div>
        <div className="text-center py-10 text-xs text-gray-500">
          No suspicious patterns were detected, so no alternative explanations are needed.
        </div>
      </div>
    );
  }

  const likelihoodColor = (level: string) => {
    switch (level) {
      case "HIGH":
        return "bg-emerald-950/60 text-emerald-300 border-emerald-800/60";
      case "MEDIUM":
        return "bg-amber-950/60 text-amber-300 border-amber-800/60";
      case "LOW":
        return "bg-gray-800/80 text-gray-400 border-gray-700";
      default:
        return "bg-gray-800 text-gray-400 border-gray-700";
    }
  };

  const categoryIcon = (cat: string) => {
    switch (cat) {
      case "DEFI_ACTIVITY":
        return "🔄";
      case "LEGITIMATE_BUSINESS":
        return "🏢";
      case "PRIVACY":
        return "🔒";
      case "OPERATIONAL":
        return "⚙️";
      case "REGULATORY":
        return "📋";
      default:
        return "📎";
    }
  };

  const categoryLabel = (cat: string) => {
    switch (cat) {
      case "DEFI_ACTIVITY":
        return "DeFi Activity";
      case "LEGITIMATE_BUSINESS":
        return "Legitimate Business";
      case "PRIVACY":
        return "Privacy";
      case "OPERATIONAL":
        return "Operational";
      case "REGULATORY":
        return "Regulatory";
      default:
        return cat;
    }
  };

  return (
    <div className="space-y-5">
      {/* Header Card */}
      <div className="bg-surface/90 border border-gray-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-brand-400" />
            <h2 className="text-sm font-bold tracking-wide uppercase text-gray-200">
              Alternative Explanation Analysis
            </h2>
          </div>
          <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded bg-brand-950/60 text-brand-300 border border-brand-800/60">
            {alternativeExplanations.length} Patterns Analyzed
          </span>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/20 via-transparent to-transparent border border-blue-900/30 mb-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-gray-200 mb-1">
                Why This Matters
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Blockchain patterns detected during an investigation may have <strong>innocent explanations</strong>. 
                This analysis presents legitimate, non-criminal interpretations for each detected pattern to help 
                investigators avoid confirmation bias and ensure balanced, defensible conclusions.
              </p>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-gray-600 leading-relaxed">
          These are <strong>deterministic, rule-based</strong> alternative interpretations — not AI-generated. 
          Each alternative is a known legitimate blockchain usage pattern that can produce the same on-chain signature as the flagged suspicious behavior.
        </p>
      </div>

      {/* Pattern Cards */}
      {alternativeExplanations.map((alt) => {
        const isExpanded = expandedId === alt.id;

        return (
          <div
            key={alt.id}
            className="bg-surface/90 border border-gray-800 rounded-2xl shadow-xl overflow-hidden transition-all duration-200"
          >
            {/* Pattern Header — Clickable */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : alt.id)}
              className="w-full p-5 flex items-start justify-between gap-4 text-left hover:bg-gray-800/20 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-brand-400 shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500 shrink-0" />
                  )}
                  <span className="text-xs font-bold text-gray-200">
                    {alt.patternTitle}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/60 font-mono font-bold">
                    {alt.patternType}
                  </span>
                </div>

                {/* Suspicious Interpretation */}
                <div className="ml-6 p-2.5 rounded-lg bg-rose-950/15 border border-rose-900/30">
                  <div className="flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                    <span className="text-[10px] font-bold uppercase text-rose-400">
                      Suspicious Interpretation
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-300 leading-relaxed">
                    {alt.suspiciousInterpretation}
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-bold px-2 py-1 rounded bg-blue-950/60 text-blue-300 border border-blue-800/60 shrink-0">
                {alt.alternativeExplanations.length} alternatives
              </span>
            </button>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="border-t border-gray-800/60">
                {/* Alternative Explanations */}
                <div className="px-5 pt-4 pb-2">
                  <span className="text-[10px] font-bold uppercase text-emerald-400/80 tracking-wider flex items-center gap-1.5 mb-3">
                    <Lightbulb className="w-3.5 h-3.5" />
                    Legitimate Alternative Explanations
                  </span>

                  <div className="space-y-3">
                    {alt.alternativeExplanations.map((explanation, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800/90 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">
                              {categoryIcon(explanation.category)}
                            </span>
                            <span className="text-xs font-bold text-gray-200">
                              {explanation.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${likelihoodColor(
                                explanation.likelihood
                              )}`}
                            >
                              {explanation.likelihood} likelihood
                            </span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                              {categoryLabel(explanation.category)}
                            </span>
                          </div>
                        </div>
                        <p className="text-[11px] text-gray-400 leading-relaxed">
                          {explanation.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Investigator Guidance */}
                <div className="px-5 pb-5 pt-2">
                  <div className="p-3.5 rounded-xl bg-amber-950/15 border border-amber-900/30">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Shield className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-[10px] font-bold uppercase text-amber-400">
                        Investigator Guidance
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-300 leading-relaxed">
                      {alt.investigatorGuidance}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
