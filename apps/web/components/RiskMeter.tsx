"use client";

import React from "react";
import { RiskAssessment } from "@crypto-tracer/types";
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  ShieldCheck,
  CircleAlert,
  Eye,
} from "lucide-react";

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

  // Confidence data
  const confidence = risk.confidence || computeFallbackConfidence(risk);
  let confColor = "text-gray-400";
  let confBg = "bg-gray-800";
  let confBorder = "border-gray-700";
  let confLabel = "Not Available";
  let ConfIcon = Eye;

  if (confidence) {
    confLabel = confidence.confidenceLevel;
    if (confidence.confidenceLevel === "VERIFIED") {
      confColor = "text-emerald-400";
      confBg = "bg-emerald-950/60";
      confBorder = "border-emerald-700/60";
      ConfIcon = ShieldCheck;
    } else if (confidence.confidenceLevel === "HIGH") {
      confColor = "text-blue-400";
      confBg = "bg-blue-950/60";
      confBorder = "border-blue-700/60";
      ConfIcon = ShieldCheck;
    } else if (confidence.confidenceLevel === "MEDIUM") {
      confColor = "text-amber-400";
      confBg = "bg-amber-950/60";
      confBorder = "border-amber-700/60";
      ConfIcon = Eye;
    } else {
      confColor = "text-gray-400";
      confBg = "bg-gray-800/80";
      confBorder = "border-gray-700";
      ConfIcon = CircleAlert;
    }
  }

  // Confidence mini gauge
  const confScore = confidence?.confidenceScore ?? 0;
  const confStrokeDash = 157.1; // circumference for r=25
  const confStrokeOffset = confStrokeDash - (confStrokeDash * confScore) / 100;


  return (
    <div className="space-y-5">
      {/* ===== RISK SCORE & CONFIDENCE SIDE-BY-SIDE ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* --- Risk Score Card --- */}
        <div className="bg-surface/90 border border-gray-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <LevelIcon className={`w-5 h-5 ${gaugeColor.split(" ")[0]}`} />
              <h2 className="text-sm font-bold tracking-wide uppercase text-gray-200">
                Risk Indicators
              </h2>
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
              0–100 Scale
            </span>
          </div>

          <div className="flex items-center gap-5 p-4 rounded-xl bg-gradient-to-r via-transparent to-transparent border border-gray-800/80">
            {/* Radial Gauge */}
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
                What this means
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                {score >= 75
                  ? "Multiple serious indicators were detected in this investigation, including interaction with services designed to hide the source of funds."
                  : score >= 50
                  ? "Several concerning behaviors were detected, including techniques commonly used to obscure fund origins."
                  : score >= 25
                  ? "Some moderate indicators were found. The activity may be legitimate but warrants further review."
                  : "No significant concerning indicators were detected within the analyzed transactions."}
              </p>
            </div>
          </div>

          <p className="mt-3 text-[10px] text-gray-600 leading-relaxed">
            This score reflects <strong>how many</strong> and <strong>how severe</strong> the suspicious indicators are. It does not represent the probability that the wallet owner is engaged in criminal activity.
          </p>
        </div>

        {/* --- Confidence Card --- */}
        <div className="bg-surface/90 border border-gray-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ConfIcon className={`w-5 h-5 ${confColor}`} />
              <h2 className="text-sm font-bold tracking-wide uppercase text-gray-200">
                Analysis Confidence
              </h2>
            </div>
            <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded border ${confBg} ${confColor} ${confBorder}`}>
              {confLabel}
            </span>
          </div>

          {confidence && (
            <>
              <div className="flex items-center gap-5 p-4 rounded-xl border border-gray-800/80 mb-4">
                {/* Mini gauge */}
                <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 60 60">
                    <circle
                      cx="30"
                      cy="30"
                      r="25"
                      className="stroke-gray-800"
                      strokeWidth="5"
                      fill="transparent"
                    />
                    <circle
                      cx="30"
                      cy="30"
                      r="25"
                      className={`${confColor.replace("text-", "stroke-")} transition-all duration-1000 ease-out`}
                      strokeWidth="5"
                      strokeDasharray={confStrokeDash.toString()}
                      strokeDashoffset={confStrokeOffset}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-base font-black text-white">{confScore}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xs font-bold text-gray-200 uppercase mb-1">
                    How reliable is this result?
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {confScore >= 80
                      ? "The investigation has strong evidence from multiple sources. The findings are well-supported."
                      : confScore >= 60
                      ? "The investigation has good supporting evidence, though some aspects could be strengthened."
                      : confScore >= 35
                      ? "The investigation has limited evidence. Additional data would improve the reliability of these findings."
                      : "The available evidence is insufficient to draw strong conclusions. Further investigation is recommended."}
                  </p>
                </div>
              </div>

              {/* Evidence & Limitations */}
              <div className="grid grid-cols-1 gap-3">
                {/* What we know */}
                {confidence.strengths.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold uppercase text-emerald-400/80 tracking-wide mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Confirmed Evidence
                    </h4>
                    <ul className="space-y-1.5">
                      {confidence.strengths.map((s, i) => (
                        <li
                          key={i}
                          className="text-xs text-gray-300 flex items-start gap-2 pl-1"
                        >
                          <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* What we don't know */}
                {confidence.limitations.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold uppercase text-amber-400/80 tracking-wide mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Gaps & Limitations
                    </h4>
                    <ul className="space-y-1.5">
                      {confidence.limitations.map((l, i) => (
                        <li
                          key={i}
                          className="text-xs text-gray-400 flex items-start gap-2 pl-1"
                        >
                          <span className="text-amber-500 mt-0.5 shrink-0">⚠</span>
                          <span>{l}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}

          {!confidence && (
            <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
              Confidence data not available.
            </div>
          )}

          <p className="mt-3 text-[10px] text-gray-600 leading-relaxed">
            Confidence measures <strong>how reliable</strong> this analysis is based on available data, not the severity of risk indicators.
          </p>
        </div>
      </div>

      {/* ===== CONTRIBUTING FACTORS (unchanged from original) ===== */}
      <div className="bg-surface/90 border border-gray-800 rounded-2xl p-5 shadow-xl">
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wide mb-2 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            <span>What raised the risk score ({risk.factors.length} factors)</span>
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

          {risk.factors.length === 0 && (
            <p className="text-xs text-gray-500 py-4 text-center">
              No risk-contributing factors were detected.
            </p>
          )}
        </div>

        {/* Recommendations */}
        {risk.recommendations.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-800">
            <h4 className="text-xs font-bold uppercase text-amber-400 tracking-wide mb-2">
              Recommended Next Steps
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
    </div>
  );
};

function computeFallbackConfidence(risk: RiskAssessment): any {
  const strengths: string[] = [];
  const limitations: string[] = [];
  let confidencePoints = 65;

  const hasMixer = risk.factors.some(
    (f) => f.id === "FACTOR_MIXER" || f.category.toLowerCase().includes("anonymization")
  );
  const hasIllicit = risk.factors.some(
    (f) => f.id === "FACTOR_ILLICIT" || f.category.toLowerCase().includes("intelligence")
  );
  const hasBridge = risk.factors.some(
    (f) => f.id === "FACTOR_CROSS_CHAIN" || f.category.toLowerCase().includes("hopping")
  );
  const hasPeel = risk.factors.some(
    (f) => f.id === "FACTOR_PEEL_CHAIN" || f.category.toLowerCase().includes("structuring")
  );

  if (hasMixer) {
    confidencePoints += 15;
    strengths.push("Mixer / privacy pool interaction verified");
  }
  if (hasIllicit) {
    confidencePoints += 15;
    strengths.push("Interaction with law-enforcement flagged entity confirmed");
  }
  if (hasBridge) {
    confidencePoints += 10;
    strengths.push("Cross-chain bridge routing identified");
  }
  if (hasPeel) {
    confidencePoints += 10;
    strengths.push("Sequential peel chain structuring confirmed");
  }

  if (risk.evidenceList && risk.evidenceList.length > 0) {
    strengths.push(`${risk.evidenceList.length} verified evidence items supporting analysis`);
  } else {
    strengths.push("Direct transaction path traced across multiple hops");
  }

  limitations.push("Wallet owner identity subject to exchange subpoena response");
  if (hasBridge) {
    limitations.push("Cross-chain destination validator logs require formal request");
  } else {
    limitations.push("Off-chain entity attributions based on cluster heuristics");
  }

  const confidenceScore = Math.min(100, Math.max(0, confidencePoints));
  let confidenceLevel: "LOW" | "MEDIUM" | "HIGH" | "VERIFIED" = "HIGH";
  if (confidenceScore >= 80) confidenceLevel = "VERIFIED";
  else if (confidenceScore >= 60) confidenceLevel = "HIGH";
  else if (confidenceScore >= 35) confidenceLevel = "MEDIUM";
  else confidenceLevel = "LOW";

  return {
    confidenceScore,
    confidenceLevel,
    strengths,
    limitations,
  };
}

